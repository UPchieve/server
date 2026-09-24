import { NextFunction, Request, Response, Router } from 'express'
import { extractUser } from '../extract-user'
import { resError } from '../res-error'
import * as NTHSGroupsService from '../../services/NTHSGroupsService'
import {
  InputError,
  NotAuthenticatedError,
  NTHSGroupNameTakenError,
  RepoUpdateError,
} from '../../models/Errors'
import {
  toNTHSActionPublic,
  toNTHSAdvisorPublic,
  toNTHSGroupActionPublic,
  toNTHSGroupMemberWithRolePublic,
  toNTHSGroupPublic,
  toNTHSGroupWithMemberInfoPublic,
  toNTHSChapterImpactPublic,
  toNTHSChapterRosterPublic,
} from '../../public/nths'
import type {
  NTHSActionName,
  NTHSChapterPeriodStarts,
  NTHSGroupRoleName,
} from '../../models/NTHSGroups'
import { asDate, asUuid, isUuid } from '../../utils/type-utils'
import { ONE_DAY_ELAPSED_MILLISECONDS } from '../../constants/time'
import type {
  NTHSActionsAndGroupActionsResponse,
  NTHSCreateActionResponse,
  NTHSGroupMembersResponse,
  NTHSGroupPublicResponse,
  NTHSGroupsResponse,
  NTHSNewGroupResponse,
  NTHSSchoolAffiliationResponse,
  NTHSChapterImpactResponse,
  NTHSChapterRosterResponse,
} from '../../contracts/nths-group'

function requireActiveGroupMember(role?: NTHSGroupRoleName) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.user && req.user.id && isUuid(req.params.groupId)) {
      const groupMember = await NTHSGroupsService.getActiveGroupMember(
        req.user.id,
        req.params.groupId
      )
      if (groupMember && (!role || groupMember.roleName === role)) {
        res.locals.groupMember = groupMember
        return next()
      }
    }
    return res.status(403).json({ err: 'Unauthorized' })
  }
}

const isActiveGroupMember = requireActiveGroupMember()
const isActiveGroupAdmin = requireActiveGroupMember('admin')

function requesterIsGroupAdmin(res: Response): boolean {
  return res.locals.groupMember?.roleName === 'admin'
}

// Must run after isActiveGroupMember, which sets res.locals.groupMember and
// has already checked req.user.id.
async function requireClearedToViewMemberInfo(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (requesterIsGroupAdmin(res)) {
    return next()
  }
  if (
    await NTHSGroupsService.isClearedToViewChapterMemberInfo(
      extractUser(req).id
    )
  ) {
    return next()
  }
  return res.status(403).json({ err: 'Unauthorized' })
}

// This lists out the subset of actions that a group admin is allowed
// to take via the `/actions` endpoint so that we can guard other actions
// that are intended to be set via other endpoints
export const GROUP_ADMIN_ACTIONS: ReadonlySet<string> = new Set<NTHSActionName>(
  [
    'NAMED YOUR TEAM',
    'REVIEWED RESOURCES',
    'ATTENDED ORIENTATION',
    'RECRUITMENT SPRINT',
    'MARKED SCHOOL AFFILIATION IN PROGRESS',
    'OPTED OUT',
  ]
)

// The other GROUP_ADMIN_ACTIONS drive school-affiliation status, and
// nths_group_actions doubles as that status's history log.
export const GROUP_ADMIN_REMOVABLE_ACTIONS: ReadonlySet<string> =
  new Set<NTHSActionName>([
    'NAMED YOUR TEAM',
    'REVIEWED RESOURCES',
    'ATTENDED ORIENTATION',
    'RECRUITMENT SPRINT',
  ])

// The oldest start the app sends is the 1st of the month (at most 31 days
// back); 62 days leaves room for a slow device clock while still refusing
// arbitrary history.
const PERIOD_START_MAX_AGE_DAYS = 62
const PERIOD_START_MAX_AGE_MS =
  PERIOD_START_MAX_AGE_DAYS * ONE_DAY_ELAPSED_MILLISECONDS
// Browser clocks can run a few minutes fast; clamp a start just ahead of
// server time instead of rejecting it.
const CLOCK_SKEW_TOLERANCE_MS = 5 * 60 * 1000

function asPeriodStart(
  value: unknown,
  name: string,
  now: Date
): Date | undefined {
  if (value === undefined) return
  const startsAt = asDate(value, name)
  if (startsAt.getTime() - now.getTime() > CLOCK_SKEW_TOLERANCE_MS)
    throw new InputError(`${name} is ahead of server time`)
  if (now.getTime() - startsAt.getTime() > PERIOD_START_MAX_AGE_MS)
    throw new InputError(
      `${name} must be within the last ${PERIOD_START_MAX_AGE_DAYS} days`
    )
  return startsAt > now ? now : startsAt
}

export function routeNTHSGroups(router: Router): void {
  router
    .route('/nths-groups')
    .get(async (req: Request, res: Response<NTHSGroupsResponse>) => {
      try {
        const user = extractUser(req)
        const groups = await NTHSGroupsService.getGroups(user.id)
        const candidateApplicationStatus =
          groups.length === 0
            ? await NTHSGroupsService.getLatestCandidateApplicationStatus(
                user.id
              )
            : undefined
        res.json({
          groups: groups.map(toNTHSGroupWithMemberInfoPublic),
          candidateApplicationStatus,
        })
      } catch (error) {
        resError(res, error)
      }
    })

  router
    .route('/nths-groups/:groupId/members')
    .get(
      isActiveGroupMember,
      requireClearedToViewMemberInfo,
      async (req: Request, res: Response<NTHSGroupMembersResponse>) => {
        try {
          // Only admins get closed accounts, since they need the row to
          // remove the member.
          const members = await NTHSGroupsService.getGroupMembers(
            req.params.groupId,
            undefined,
            { excludeClosedAccounts: !requesterIsGroupAdmin(res) }
          )
          return res.json({
            members: members.map(toNTHSGroupMemberWithRolePublic),
          })
        } catch (err) {
          resError(res, err)
        }
      }
    )

  router
    .route('/nths-groups/:groupId/members/:memberId')
    .put(isActiveGroupAdmin, async (req: Request, res: Response<void>) => {
      try {
        const memberId = asUuid(req.params.memberId, 'memberId')
        await NTHSGroupsService.updateGroupMember(
          memberId,
          req.params.groupId,
          req.body
        )
        return res.sendStatus(204)
      } catch (err) {
        resError(res, err)
      }
    })

  router
    .route('/nths-groups/:groupId/leave')
    // This route is similar to the above, but is for a member removing **themselves** from a group
    // whereas the above is a group admin action to update other members' settings.
    .delete(async (req: Request, res: Response<void>) => {
      try {
        const userId = req.user?.id
        if (!userId) throw new NotAuthenticatedError()
        const groupId = asUuid(req.params.groupId, 'groupId')
        await NTHSGroupsService.updateGroupMember(userId, groupId, {
          isActive: false,
        })
        return res.sendStatus(204)
      } catch (err) {
        resError(res, err)
      }
    })

  router
    .route('/nths-groups/new')
    .post(async (req: Request, res: Response<NTHSNewGroupResponse>) => {
      try {
        const user = extractUser(req)
        const group = await NTHSGroupsService.foundGroup(user.id)
        res.json({ group: toNTHSGroupWithMemberInfoPublic(group) })
      } catch (error) {
        resError(res, error)
      }
    })
  router
    .route('/nths-groups/:groupId')
    .put(
      isActiveGroupAdmin,
      async (req, res: Response<NTHSGroupPublicResponse>) => {
        try {
          const name = req.body.name
          const group = await NTHSGroupsService.updateGroupName(
            req.params.groupId,
            name
          )
          res.json({ group: toNTHSGroupPublic(group) })
        } catch (error) {
          if (
            error instanceof RepoUpdateError &&
            error.message.includes('unique_name')
          ) {
            return resError(
              res,
              new NTHSGroupNameTakenError(
                `Team name must be unique: ${req.body.name} is already taken`
              )
            )
          }
          resError(res, error)
        }
      }
    )

  router
    .route('/nths-groups/:groupId/actions')
    .post(
      isActiveGroupAdmin,
      async (req: Request, res: Response<NTHSCreateActionResponse>) => {
        try {
          const groupId = req.params.groupId
          const action = req.body.action
          if (!GROUP_ADMIN_ACTIONS.has(action))
            throw new InputError(
              `${action} is not an action a chapter can take`
            )
          const created = await NTHSGroupsService.createAction(groupId, action)
          res.json({
            groupId,
            action: toNTHSGroupActionPublic(created.action),
            schoolAffiliationStatus: created.schoolAffiliationStatus,
          })
        } catch (err) {
          resError(res, err)
        }
      }
    )

  router
    .route('/nths-groups/:groupId/actions/:actionName')
    .delete(isActiveGroupAdmin, async (req: Request, res: Response<void>) => {
      try {
        const groupId = req.params.groupId
        const action = req.params.actionName
        if (!GROUP_ADMIN_REMOVABLE_ACTIONS.has(action))
          throw new InputError(`${action} is not an action a chapter can unset`)
        await NTHSGroupsService.deleteAction(groupId, action as NTHSActionName)
        return res.sendStatus(204)
      } catch (err) {
        resError(res, err)
      }
    })

  router
    .route('/nths-groups/:groupId/actions')
    .get(
      isActiveGroupMember,
      async (
        req: Request,
        res: Response<NTHSActionsAndGroupActionsResponse>
      ) => {
        try {
          const groupId = req.params.groupId
          const groupActions =
            await NTHSGroupsService.getActionsForGroup(groupId)
          const actions = await NTHSGroupsService.getActions()
          res.json({
            groupId,
            actions: actions.map(toNTHSActionPublic),
            groupActions: groupActions.map(toNTHSGroupActionPublic),
          })
        } catch (err) {
          resError(res, err)
        }
      }
    )

  router
    .route('/nths-groups/:groupId/impact')
    .get(
      isActiveGroupMember,
      requireClearedToViewMemberInfo,
      async (req: Request, res: Response<NTHSChapterImpactResponse>) => {
        try {
          const user = extractUser(req)
          const now = new Date()
          const monthStartsAt = asPeriodStart(
            req.query.monthStartsAt,
            'monthStartsAt',
            now
          )
          const impact = await NTHSGroupsService.getChapterImpact(
            req.params.groupId,
            user.id,
            now,
            monthStartsAt
          )
          res.json({ impact: toNTHSChapterImpactPublic(impact) })
        } catch (err) {
          resError(res, err)
        }
      }
    )

  router
    .route('/nths-groups/:groupId/roster')
    .get(
      isActiveGroupMember,
      requireClearedToViewMemberInfo,
      async (req: Request, res: Response<NTHSChapterRosterResponse>) => {
        try {
          const now = new Date()
          const periodStarts: Partial<NTHSChapterPeriodStarts> = {
            weekStartsAt: asPeriodStart(
              req.query.weekStartsAt,
              'weekStartsAt',
              now
            ),
            lastTwoWeeksStartsAt: asPeriodStart(
              req.query.lastTwoWeeksStartsAt,
              'lastTwoWeeksStartsAt',
              now
            ),
            monthStartsAt: asPeriodStart(
              req.query.monthStartsAt,
              'monthStartsAt',
              now
            ),
          }
          // Only admins get deleted accounts, since they need the row to
          // remove the member.
          const roster = await NTHSGroupsService.getChapterRoster(
            req.params.groupId,
            now,
            periodStarts,
            { includeClosedAccounts: requesterIsGroupAdmin(res) }
          )
          res.json({ roster: toNTHSChapterRosterPublic(roster) })
        } catch (err) {
          resError(res, err)
        }
      }
    )

  router
    .route('/nths-groups/:groupId/submit-school-affiliation')
    .post(
      isActiveGroupAdmin,
      async (req: Request, res: Response<NTHSSchoolAffiliationResponse>) => {
        try {
          const nthsGroupId = req.params.groupId
          const {
            schoolId,
            firstName,
            lastName,
            email,
            phone,
            phoneExtension,
            title,
          } = req.body
          const result = await NTHSGroupsService.submitSchoolAffiliation({
            nthsGroupId,
            schoolId,
            firstName,
            lastName,
            email,
            phone,
            phoneExtension,
            title,
          })

          res.json({
            groupId: result.groupId,
            NTHSAdvisor: toNTHSAdvisorPublic(result.NTHSAdvisor),
            action: {
              action: toNTHSGroupActionPublic(result.action.action),
              schoolAffiliationStatus: result.action.schoolAffiliationStatus,
            },
          })
        } catch (err) {
          resError(res, err)
        }
      }
    )
}
