import { NextFunction, Request, Response, Router } from 'express'
import { extractUser } from '../extract-user'
import { resError } from '../res-error'
import * as NTHSGroupsService from '../../services/NTHSGroupsService'
import {
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
} from '../../public/nths'
import type {
  NTHSActionsAndGroupActionsResponse,
  NTHSCreateActionResponse,
  NTHSGroupMembersResponse,
  NTHSGroupPublicResponse,
  NTHSGroupsResponse,
  NTHSNewGroupResponse,
  NTHSSchoolAffiliationResponse,
} from '../../contracts/nths'

export async function isGroupAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.user && req.user.id && req.params.groupId) {
    const groupMember = await NTHSGroupsService.getGroupMember(
      req.user?.id!,
      req.params.groupId
    )
    if (groupMember?.roleName === 'admin') {
      return next()
    }
  }
  return res.status(403).json({ err: 'Unauthorized' })
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
    .get(async (req: Request, res: Response<NTHSGroupMembersResponse>) => {
      try {
        const members = await NTHSGroupsService.getGroupMembers(
          req.params.groupId
        )
        return res.json({
          members: members.map(toNTHSGroupMemberWithRolePublic),
        })
      } catch (err) {
        resError(res, err)
      }
    })

  router
    .route('/nths-groups/:groupId/members/:memberId')
    .put(isGroupAdmin, async (req: Request, res: Response<void>) => {
      try {
        await NTHSGroupsService.updateGroupMember(
          req.params.memberId,
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
        await NTHSGroupsService.updateGroupMember(userId, req.params.groupId, {
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
    .put(isGroupAdmin, async (req, res: Response<NTHSGroupPublicResponse>) => {
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
    })

  router
    .route('/nths-groups/:groupId/actions')
    .post(
      isGroupAdmin,
      async (req: Request, res: Response<NTHSCreateActionResponse>) => {
        try {
          const groupId = req.params.groupId
          const action = req.body.action
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
    .route('/nths-groups/:groupId/actions')
    .get(
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
    .route('/nths-groups/:groupId/submit-school-affiliation')
    .post(
      isGroupAdmin,
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
