import { Ulid, Uuid } from '../models/pgUtils'
import * as NTHSGroupsRepo from '../models/NTHSGroups'
import * as NTHSApplicationRepo from '../models/NTHSApplication'
import { sendNTHSChapterSchoolAffiliationApprovedNotification } from './MailService'
import {
  GetGroupMembersOptions,
  NTHS_ACTIONS_TO_SCHOOL_AFFILIATION_STATUS_MAPPING,
  NTHSAction,
  NTHSActionName,
  NTHSActiveGroupMember,
  NTHSCandidateApplicationStatus,
  NTHSChapterStatus,
  NTHSChapterStatusName,
  NTHSGroup,
  NTHSGroupAction,
  NTHSGroupChapterStatusInfo,
  NTHSGroupMember,
  NTHSGroupMemberRole,
  NTHSGroupMemberWithRole,
  NTHSGroupRoleName,
  NTHSGroupWithMemberInfo,
  NTHSSchoolAffiliationStatusName,
  NTHSChapterGoals,
  NTHSChapterImpact,
  NTHSChapterPeriodStarts,
  NTHSChapterRoster,
} from '../models/NTHSGroups'
import {
  getClient,
  getRoClient,
  runInTransaction,
  TransactionClient,
} from '../db'
import generateAlphanumericOfLength from '../utils/generate-alphanumeric'
import { schoolYearFor } from '../utils/school-year'
import {
  AlreadyInNTHSGroupError,
  CannotRemoveSoleNTHSAdminError,
  InputError,
  LookupError,
  NTHSSchoolAlreadyClaimedError,
  NTHSChapterSchoolFixedError,
  NotAHighSchoolerNTHSJoinError,
  NotAllowedError,
  NTHSChapterClosedError,
  NTHSApprovalExpiredError,
} from '../models/Errors'
import logger from '../logger'
import {
  getVolunteerOccupations,
  getVolunteersReadyToCoachStatus,
  VolunteerOccupations,
} from '../models/Volunteer'
import { getUsersBanStatuses } from '../models/User'
import { isReadyToCoach } from './VolunteerService'
import {
  isNthsTitle,
  LEADERSHIP_TITLES,
  NTHS_TITLES,
  NTHSTitle,
} from '../constants/nths-titles'
import { hoursInMs } from '../utils/time-utils'
import QueueService from './QueueService'

export const APPROVAL_LIFETIME_HOURS = 720
const SENDGRID_SYNC_DELAY_MS = 5000

function approvalExpiry(activatedAt: Date): Date {
  return new Date(activatedAt.getTime() + hoursInMs(APPROVAL_LIFETIME_HOURS))
}

export async function getGroups(userId: Ulid) {
  return await NTHSGroupsRepo.getGroupsByUser(userId)
}

export async function syncNthsUserToSendGrid(userId: Ulid) {
  await QueueService.add(
    'SyncSendGridContact',
    { delay: SENDGRID_SYNC_DELAY_MS },
    { userId }
  )
}

export async function foundGroup(
  userId: Ulid
): Promise<NTHSGroupWithMemberInfo> {
  const result = await runInTransaction(async (tc: TransactionClient) => {
    const groups = await NTHSGroupsRepo.getGroupsByUser(userId, tc)

    // For now, let's enforce single group membership
    if (groups.length > 0) {
      throw new AlreadyInNTHSGroupError()
    }

    // The route only asks who you are, so without this any authenticated user
    // could found a chapter and make themselves its admin. Read inside the
    // transaction: the default read client is a replica, where lag would let a
    // just-revoked approval through.
    const application =
      await NTHSApplicationRepo.getActivatedCandidateApplication(userId, tc)
    if (!application)
      throw new NotAllowedError(
        'An approved NTHS application is needed to start a chapter'
      )
    if (new Date() >= approvalExpiry(application.activatedAt)) {
      throw new NTHSApprovalExpiredError({
        message: 'NTHS approval expired before the chapter was started',
      })
    }

    const inviteCode = generateAlphanumericOfLength(6)
    const name = `NTHS Chapter ${Number(await NTHSGroupsRepo.groupsCount(tc)) + 1}`
    const key = name.split(' ').join('-').toLowerCase()
    const group = await NTHSGroupsRepo.createGroup(
      { inviteCode, name, key },
      tc
    )

    const creator = await NTHSGroupsRepo.joinGroupById(
      { groupId: group.id, userId, title: 'President' },
      tc
    )
    await NTHSGroupsRepo.upsertNthsGroupMemberRole(
      {
        userId: creator.userId,
        nthsGroupId: group.id,
        roleName: 'admin',
      },
      tc
    )

    // If the application has a valid school_id we can go ahead and "claim"
    // the school via an UNAFFILIATED status in nths_group_school_affiliation
    // table so we can enforce a 1-chapter-per-school policy.
    let schoolAffiliationStatus: NTHSSchoolAffiliationStatusName | null = null
    if (application.schoolId) {
      try {
        await NTHSGroupsRepo.insertSchoolAffiliation(
          {
            nthsGroupId: group.id,
            schoolId: application.schoolId,
            status: 'UNAFFILIATED',
          },
          tc
        )
        schoolAffiliationStatus = 'UNAFFILIATED'
      } catch (err) {
        if (err instanceof Error && err.message.includes('unique_school_id')) {
          throw new NTHSSchoolAlreadyClaimedError()
        }
        throw err
      }
    }

    const result = {
      groupInfo: {
        id: group.id,
        name: group.name,
        key: group.key,
        inviteCode: group.inviteCode,
      },
      memberInfo: {
        title: creator.title,
        joinedAt: creator.joinedAt,
        roleName: 'admin',
      },
      schoolAffiliationStatus,
      hasSchoolOnRecord: !!application.schoolId,
      // @TODO Remove the fields below once we update the client to reference groupInfo and memberInfo instead
      memberTitle: creator.title,
      joinedAt: creator.joinedAt,
      groupId: group.id,
      groupName: group.name,
      groupKey: group.key,
      inviteCode: group.inviteCode,
      roleName: 'admin',
    } as NTHSGroupWithMemberInfo

    return result
  })
  await syncNthsUserToSendGrid(userId)
  return result
}

export async function updateGroupName(groupId: Ulid, name: string) {
  const group = await NTHSGroupsRepo.updateGroupName(groupId, name)
  return group
}

export async function getNTHSGroupByInviteCode(
  inviteCode: Uuid,
  tc: TransactionClient = getRoClient()
) {
  return await NTHSGroupsRepo.getGroupByInviteCode(inviteCode, tc)
}

export async function getNTHSGroupByID(
  groupId: Ulid,
  tc: TransactionClient = getRoClient()
): Promise<NTHSGroup | undefined> {
  return await NTHSGroupsRepo.getGroupById(groupId, tc)
}

export async function getNTHSGroupAdminsContactInfo(
  groupId: Ulid,
  tc: TransactionClient = getRoClient()
): Promise<
  {
    userId: Ulid
    nthsGroupId: Ulid
    firstName: string
    email: string
    chapterName: string
  }[]
> {
  return await NTHSGroupsRepo.getGroupAdminsContactInfo(groupId, tc)
}

export async function joinGroupAsMemberByGroupId(
  userId: Ulid,
  groupId: Ulid,
  roleName: NTHSGroupRoleName = 'member',
  tc?: TransactionClient
) {
  const groups = await runInTransaction(async (client: TransactionClient) => {
    const closedAt = await NTHSGroupsRepo.getGroupClosedAtForShare(
      groupId,
      client
    )
    ensureChapterOpen({ closedAt })

    const occupations = await getVolunteerOccupations(userId, client)
    if (
      occupations.length &&
      !occupations.includes(VolunteerOccupations.HIGH_SCHOOL_STUDENT)
    ) {
      throw new NotAHighSchoolerNTHSJoinError()
    }

    await NTHSGroupsRepo.joinGroupById(
      {
        userId,
        groupId,
        title: 'Member',
      },
      client
    )
    await NTHSGroupsRepo.upsertNthsGroupMemberRole(
      {
        userId,
        nthsGroupId: groupId,
        roleName,
      },
      client
    )
    return await NTHSGroupsRepo.getGroupsByUser(userId, client)
  }, tc)
  await syncNthsUserToSendGrid(userId)
  return groups
}

export function ensureChapterOpen(group: { closedAt?: Date | null }) {
  if (group.closedAt) {
    throw new NTHSChapterClosedError()
  }
}

// Signing up through a closed chapter's invite still creates the account; the
// coach just isn't added to the chapter.
export async function joinGroupAtSignup(
  userId: Ulid,
  inviteCode: Uuid,
  tc?: TransactionClient
) {
  const group = await getNTHSGroupByInviteCode(inviteCode, tc)
  if (!group) {
    throw new Error('Invalid team invite code')
  }
  try {
    await joinGroupAsMemberByGroupId(userId, group.id, 'member', tc)
  } catch (err) {
    if (!(err instanceof NTHSChapterClosedError)) {
      throw err
    }
  }
}

export type UpdateGroupMemberRequest = {
  role?: NTHSGroupRoleName
  title?: NTHSTitle
  isActive?: false
}

export function asGroupMemberUpdate(body: unknown): UpdateGroupMemberRequest {
  const { role, title, isActive } = (body ?? {}) as Record<string, unknown>
  if (role !== undefined && role !== 'admin' && role !== 'member') {
    throw new InputError('role must be admin or member')
  }
  if (title !== undefined && !isNthsTitle(title)) {
    throw new InputError(`title must be one of ${NTHS_TITLES.join(', ')}`)
  }
  if (isActive !== undefined && isActive !== false) {
    throw new InputError('isActive can only be false')
  }
  return { role, title, isActive }
}

export async function updateGroupMember(
  userId: Ulid,
  nthsGroupId: Ulid,
  update: UpdateGroupMemberRequest
) {
  const { members, targetMember } = await getMembersWithTarget(
    nthsGroupId,
    userId
  )
  ensureNotDeletedAdminTarget(targetMember, update)
  // Do not allow deactivating or demoting of the sole admin of the group
  if (isSoleActiveAdmin(members, userId)) {
    if ((update.role && update.role !== 'admin') || update.isActive === false) {
      throw new CannotRemoveSoleNTHSAdminError()
    }
  }
  await applyGroupMemberUpdate(targetMember, nthsGroupId, update)
}

export async function updateGroupMemberAsStaff(
  userId: Ulid,
  nthsGroupId: Ulid,
  update: UpdateGroupMemberRequest
) {
  const { targetMember } = await getMembersWithTarget(nthsGroupId, userId)
  ensureNotDeletedAdminTarget(targetMember, update)
  await applyGroupMemberUpdate(targetMember, nthsGroupId, update)
}

function ensureNotDeletedAdminTarget(
  targetMember: NTHSGroupMemberWithRole,
  update: UpdateGroupMemberRequest
) {
  if (update.role === 'admin' && targetMember.deleted) {
    throw new InputError('Cannot make a deleted account an admin')
  }
}

async function applyGroupMemberUpdate(
  targetMember: NTHSGroupMemberWithRole,
  nthsGroupId: Ulid,
  update: UpdateGroupMemberRequest
) {
  // A removal must end membership exactly as a leave does, so it cannot also
  // promote, demote or retitle the member.
  if (
    update.isActive === false &&
    (update.role !== undefined || update.title !== undefined)
  ) {
    throw new InputError('A removal cannot also change role or title')
  }
  // A departed member can't be changed. Removing them again is a no-op, so a
  // stale roster's Remove click succeeds and keeps their departure time.
  if (
    targetMember.deactivatedAt &&
    (update.role !== undefined || update.title !== undefined)
  ) {
    throw new InputError(
      'This member has left the chapter and cannot be changed'
    )
  }
  const userId = targetMember.userId
  const title = titleToWrite(targetMember, update)
  await runInTransaction(async (tc) => {
    if (update.role) {
      await updateGroupMemberRole(userId, nthsGroupId, update.role, tc)
    }
    if (title) {
      await NTHSGroupsRepo.updateNthsGroupMemberTitle(
        { userId, nthsGroupId, title },
        tc
      )
    }
    if (update.isActive === false) {
      // For now, only DEactivating is possible, not reactivating.
      await NTHSGroupsRepo.deactivateGroupMember(userId, nthsGroupId, tc)
    }
  })
  await syncNthsUserToSendGrid(userId)
}

export async function getMemberForStaff(userId: Ulid, nthsGroupId: Ulid) {
  const { members, targetMember } = await getMembersWithTarget(
    nthsGroupId,
    userId
  )
  const details = await NTHSGroupsRepo.getNthsGroupMemberForStaff(
    userId,
    nthsGroupId
  )
  const otherAdmins = members.filter(
    (m) => m.roleName === 'admin' && !m.deactivatedAt && m.userId !== userId
  )
  return {
    member: {
      userId,
      firstName: details.firstName,
      lastName: details.lastName,
      email: details.email,
      title: targetMember.title,
      roleName: targetMember.roleName,
      joinedAt: targetMember.joinedAt,
      deactivatedAt: targetMember.deactivatedAt ?? null,
      deleted: targetMember.deleted,
      isLastAdmin: isSoleActiveAdmin(members, userId),
    },
    chapter: {
      id: nthsGroupId,
      name: details.chapterName,
      closedAt: details.chapterClosedAt,
    },
    otherAdmins: otherAdmins.map((m) => ({
      userId: m.userId,
      firstName: m.firstName,
      lastInitial: m.lastInitial,
      title: m.title,
      deleted: m.deleted,
    })),
  }
}

// Departed members remain valid targets; anyone with no membership row is
// rejected so a role can't be granted to an outsider.
async function getMembersWithTarget(nthsGroupId: Ulid, userId: Ulid) {
  const members = await NTHSGroupsRepo.getGroupMembers(
    nthsGroupId,
    getClient(),
    { includeDeactivated: true }
  )
  const targetMember = members.find((member) => member.userId === userId)
  if (!targetMember) {
    throw new LookupError('User is not a member of this NTHS group')
  }
  return { members, targetMember }
}

function isSoleActiveAdmin(
  members: NTHSGroupMemberWithRole[],
  userId: Ulid
): boolean {
  const activeAdmins = members.filter(
    (member) =>
      member.roleName === 'admin' && !member.deactivatedAt && !member.deleted
  )
  return activeAdmins.length === 1 && activeAdmins[0].userId === userId
}

// A sole admin without high school student can leave: Chapter HQ's high school
// notice is their only way out, and it hides the Members tab where they could
// hand the chapter to someone else.
export async function leaveGroup(userId: Ulid, nthsGroupId: Ulid) {
  const { members } = await getMembersWithTarget(nthsGroupId, userId)
  if (isSoleActiveAdmin(members, userId)) {
    const occupations = await getVolunteerOccupations(userId, getClient())
    if (occupations.includes(VolunteerOccupations.HIGH_SCHOOL_STUDENT)) {
      throw new CannotRemoveSoleNTHSAdminError()
    }
  }
  await NTHSGroupsRepo.deactivateGroupMember(userId, nthsGroupId)
  await syncNthsUserToSendGrid(userId)
}

function titleToWrite(
  member: NTHSGroupMemberWithRole,
  update: UpdateGroupMemberRequest
): NTHSTitle | undefined {
  if (update.title) {
    if (member.deleted) {
      throw new InputError("A title can't be set on a deleted account")
    }
    if (
      LEADERSHIP_TITLES.includes(update.title) &&
      (update.role ?? member.roleName) !== 'admin'
    ) {
      throw new InputError(`${update.title} is a title only an admin can hold`)
    }
    return update.title
  }
  // A demotion sent without a title still clears a leadership title, since
  // only an admin can hold one.
  if (update.role === 'member' && LEADERSHIP_TITLES.includes(member.title))
    return 'Member'
}

async function updateGroupMemberRole(
  userId: Ulid,
  nthsGroupId: Ulid,
  role: NTHSGroupRoleName,
  tc?: TransactionClient
): Promise<NTHSGroupMemberRole> {
  return await NTHSGroupsRepo.upsertNthsGroupMemberRole(
    {
      userId,
      nthsGroupId,
      roleName: role,
    },
    tc
  )
}

// Reads the primary: a replica lag window would let a just-revoked admin, or
// a just-founded member, get the wrong side of this check.
export async function getActiveGroupMember(
  userId: Ulid,
  nthsGroupId: Ulid,
  tc: TransactionClient = getClient()
): Promise<NTHSActiveGroupMember | undefined> {
  return await NTHSGroupsRepo.getActiveNthsGroupMember(userId, nthsGroupId, tc)
}

export async function getGroupMembers(
  nthsGroupId: Ulid,
  tc?: TransactionClient,
  options?: GetGroupMembersOptions
): Promise<NTHSGroupMemberWithRole[]> {
  return await NTHSGroupsRepo.getGroupMembers(nthsGroupId, tc, options)
}

type CreateActionResponse = {
  action: NTHSGroupAction
  schoolAffiliationStatus?: NTHSSchoolAffiliationStatusName
}
export async function createAction(
  nthsGroupId: Ulid,
  action: NTHSActionName,
  tc: TransactionClient = getClient()
): Promise<CreateActionResponse> {
  return await runInTransaction(async (tc) => {
    const createdAction = await NTHSGroupsRepo.insertNthsGroupAction(
      nthsGroupId,
      action,
      tc
    )
    let retVal = { action: createdAction }
    const status = NTHS_ACTIONS_TO_SCHOOL_AFFILIATION_STATUS_MAPPING[action]
    if (status) {
      const updatedStatus = await NTHSGroupsRepo.updateSchoolAffiliationStatus(
        status,
        nthsGroupId,
        tc
      )
      retVal = {
        ...retVal,
        schoolAffiliationStatus: updatedStatus,
      } as CreateActionResponse
    }

    return retVal
  }, tc)
}

export async function deleteAction(
  nthsGroupId: Ulid,
  action: NTHSActionName,
  tc: TransactionClient = getClient()
): Promise<void> {
  return await NTHSGroupsRepo.deleteNthsGroupAction(nthsGroupId, action, tc)
}

export async function getActionsForGroup(
  nthsGroupId: Ulid
): Promise<NTHSGroupAction[]> {
  return await NTHSGroupsRepo.getNthsGroupActionsByGroupId(nthsGroupId)
}

export async function getActions(): Promise<NTHSAction[]> {
  return await NTHSGroupsRepo.getNthsActions()
}

export async function addNTHSAdvisor(
  args: {
    nthsGroupId: Ulid
    schoolId?: string
    firstName: string
    lastName: string
    email: string
    phone?: string
    phoneExtension?: string
    title: string
  },
  tc: TransactionClient = getClient()
) {
  return await NTHSGroupsRepo.addNTHSAdvisor(args, tc)
}

export async function addSchoolToSchoolAffiliation(
  args: {
    nthsGroupId: Ulid
    schoolId?: string
  },
  tc: TransactionClient = getClient()
) {
  return await NTHSGroupsRepo.addSchoolToSchoolAffiliation(args, tc)
}

export async function submitSchoolAffiliation({
  nthsGroupId,
  schoolId,
  firstName,
  lastName,
  email,
  phone,
  phoneExtension,
  title,
}: {
  nthsGroupId: Ulid
  schoolId?: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  phoneExtension?: string
  title: string
}) {
  return runInTransaction(async (tc) => {
    try {
      // Goes first because it is what creates the affiliation row: the action
      // maps to PENDING_UPCHIEVE_VERIFICATION, which upserts. The update below
      // only ever touches an existing row.
      const created = await createAction(
        nthsGroupId,
        'SUBMITTED ADVISOR CONTACT INFO',
        tc
      )

      // The update COALESCEs, so a missing schoolId leaves the affiliation
      // untouched and still reports the school already on record. The advisor
      // inherits that rather than being written with no school at all.
      const affiliation = await addSchoolToSchoolAffiliation(
        {
          nthsGroupId,
          schoolId,
        },
        tc
      )
      // A school may already be claimed for this chapter, in which case we
      // don't want to let them use this process to "move" the chapter to
      // another school.
      if (affiliation?.mismatched) throw new NTHSChapterSchoolFixedError()

      const NTHSAdvisor = await addNTHSAdvisor(
        {
          nthsGroupId,
          schoolId: affiliation?.schoolId,
          firstName,
          lastName,
          email,
          phone,
          phoneExtension,
          title,
        },
        tc
      )

      return { groupId: nthsGroupId, NTHSAdvisor, action: created }
    } catch (err) {
      if (err instanceof Error && err.message.includes('unique_school_id')) {
        throw new NTHSSchoolAlreadyClaimedError()
      }

      throw err
    }
  })
}

export async function getAlltimeMembersByGroupId(
  nthsGroupId: Ulid
): Promise<NTHSGroupMember[]> {
  return await NTHSGroupsRepo.getGroupMembers(nthsGroupId, undefined, {
    includeDeactivated: true,
  })
}

export async function getLatestNthsChapterStatus(
  groupId: Ulid
): Promise<NTHSChapterStatus | undefined> {
  return NTHSGroupsRepo.getChapterStatus(groupId)
}

export async function insertNthsChapterStatus(
  groupId: Ulid,
  status: NTHSChapterStatusName
): Promise<NTHSChapterStatus> {
  return NTHSGroupsRepo.insertChapterStatus(groupId, status)
}

export async function getAllNTHSGroupsChapterStatus(): Promise<
  NTHSGroupChapterStatusInfo[]
> {
  return NTHSGroupsRepo.getAllNTHSGroupsChapterStatus()
}

export async function getApprovalExpiresAt(
  userId: Ulid
): Promise<Date | undefined> {
  const application =
    await NTHSApplicationRepo.getActivatedCandidateApplication(userId)
  return application ? approvalExpiry(application.activatedAt) : undefined
}

export async function getLatestCandidateApplicationStatus(
  userId: Ulid
): Promise<NTHSCandidateApplicationStatus | undefined> {
  return NTHSApplicationRepo.getLatestCandidateApplicationStatus(userId)
}

export type CloseChapterStatus =
  | 'closed'
  | 'alreadyClosed'
  | 'notFound'
  | 'failed'

export async function closeChapter(
  groupId: Uuid
): Promise<Exclude<CloseChapterStatus, 'failed'>> {
  return await runInTransaction(async (client: TransactionClient) => {
    const closed = await NTHSGroupsRepo.closeGroup(groupId, client)
    if (!closed) {
      const group = await NTHSGroupsRepo.getGroupById(groupId, client)
      return group ? 'alreadyClosed' : 'notFound'
    }
    await NTHSGroupsRepo.endAllGroupMemberships(groupId, client)
    await NTHSGroupsRepo.releaseGroupSchoolAffiliation(groupId, client)
    return 'closed'
  })
}

export async function closeChapters(
  groupIds: Uuid[]
): Promise<{ chapterId: Uuid; status: CloseChapterStatus }[]> {
  const results: { chapterId: Uuid; status: CloseChapterStatus }[] = []
  for (const chapterId of groupIds) {
    try {
      results.push({ chapterId, status: await closeChapter(chapterId) })
    } catch (err) {
      logger.error('Failed to close NTHS chapter', {
        groupId: chapterId,
        err,
      })
      results.push({ chapterId, status: 'failed' })
    }
  }
  return results
}

export async function getChapterCloseReport(groupIds: Uuid[]) {
  return await NTHSGroupsRepo.getChapterCloseReport(groupIds)
}

export async function makeChaptersSchoolOfficial(groupIds: Ulid[]) {
  for (const id of groupIds) {
    await makeChapterSchoolOfficial(id)
  }
}

async function makeChapterSchoolOfficial(groupId: Ulid) {
  await runInTransaction(async (tc) => {
    const closedAt = await NTHSGroupsRepo.getGroupClosedAtForShare(groupId, tc)
    if (closedAt) {
      logger.warn(
        'NTHS chapter is closed; not marking it official or emailing anyone',
        { groupId }
      )
      return
    }
    await NTHSGroupsRepo.updateSchoolAffiliationStatus(
      'AFFILIATED',
      groupId,
      tc
    )
    const chapterAdmins = await getNTHSGroupAdminsContactInfo(groupId, tc)
    const chapterAdvisors = await NTHSGroupsRepo.getAdvisorContactInfo(
      groupId,
      tc
    )

    if (!chapterAdvisors?.length) {
      throw new Error(
        `Could not mark NTHS chapter ${groupId} as official: Missing chapter advisors`
      )
    }
    if (!chapterAdmins.length) {
      logger.warn(
        'NTHS chapter has no current admins; sending the school affiliation notice to advisors only',
        { groupId }
      )
    }
    const recipients = [...chapterAdmins, ...chapterAdvisors]
    await sendNTHSChapterSchoolAffiliationApprovedNotification(
      recipients,
      recipients[0].chapterName
    )
  })
}

export const CHAPTER_GOALS: NTHSChapterGoals = {
  hoursTutored: 40,
  membersTutoring: 3,
}

// The browser sends period starts in its local time. These UTC
// starts are for a client that sends none.
function utcPeriodStartsFor(instant: Date): NTHSChapterPeriodStarts {
  const year = instant.getUTCFullYear()
  const month = instant.getUTCMonth()
  const daysSinceMonday = (instant.getUTCDay() + 6) % 7
  const date = instant.getUTCDate()
  return {
    weekStartsAt: new Date(Date.UTC(year, month, date - daysSinceMonday)),
    lastTwoWeeksStartsAt: new Date(
      Date.UTC(year, month, date - daysSinceMonday - 7)
    ),
    monthStartsAt: new Date(Date.UTC(year, month, 1)),
  }
}

type ClearanceGaps = { needsOccupation: boolean; needsOnboarding: boolean }

function clearanceGaps(
  isAdmin: boolean,
  occupations: VolunteerOccupations[],
  readyToCoachStatus: Parameters<typeof isReadyToCoach>[0] | undefined
): ClearanceGaps {
  return {
    needsOccupation: !occupations.includes(
      VolunteerOccupations.HIGH_SCHOOL_STUDENT
    ),
    needsOnboarding:
      !isAdmin && !(readyToCoachStatus && isReadyToCoach(readyToCoachStatus)),
  }
}

function isClearedForRole(
  isAdmin: boolean,
  occupations: VolunteerOccupations[],
  readyToCoachStatus: Parameters<typeof isReadyToCoach>[0] | undefined
): boolean {
  const { needsOccupation, needsOnboarding } = clearanceGaps(
    isAdmin,
    occupations,
    readyToCoachStatus
  )
  return !needsOccupation && !needsOnboarding
}

export async function getChapterClearanceGaps(
  userId: Ulid,
  isAdmin: boolean,
  tc: TransactionClient = getClient()
): Promise<ClearanceGaps> {
  const readyToCoach = isAdmin
    ? []
    : await getVolunteersReadyToCoachStatus([userId], tc)
  const occupations = await getVolunteerOccupations(userId, tc)
  return clearanceGaps(isAdmin, occupations, readyToCoach[0])
}

// Mirrors the chapter page's member-info gate (high-line src/store/modules/
// volunteer.js isReadyToTutor + NTHSGroupsView.vue hidePageContentReason), so
// a member the page shows content to never gets a 403 here. Admins skip the
// ready-to-coach check only.
export async function isClearedToViewChapterMemberInfo(
  userId: Ulid,
  isAdmin: boolean,
  tc: TransactionClient = getClient()
): Promise<boolean> {
  const { needsOccupation, needsOnboarding } = await getChapterClearanceGaps(
    userId,
    isAdmin,
    tc
  )
  return !needsOccupation && !needsOnboarding
}

// The ban comes from users.ban_type, since getVolunteersReadyToCoachStatus
// inner-joins volunteer_profiles and drops banned members without one. It
// applies to admins too, and covers live_media, which isReadyToCoach lets
// through.
export async function getChapterMemberClearance(userId: Ulid): Promise<{
  isClearedAsAdmin: boolean
  isClearedAsMember: boolean
  isBanned: boolean
}> {
  const [[readyToCoachStatus], [banStatus], occupations] = await Promise.all([
    getVolunteersReadyToCoachStatus([userId]),
    getUsersBanStatuses([userId]),
    getVolunteerOccupations(userId),
  ])
  return {
    isClearedAsAdmin: isClearedForRole(true, occupations, readyToCoachStatus),
    isClearedAsMember: isClearedForRole(false, occupations, readyToCoachStatus),
    isBanned: !!banStatus?.banType,
  }
}

export async function getChapterImpact(
  groupId: Ulid,
  viewerId: Ulid,
  at: Date,
  monthStartsAt?: Date,
  tc: TransactionClient = getRoClient()
): Promise<NTHSChapterImpact> {
  const schoolYear = schoolYearFor(at)
  const monthStart = monthStartsAt ?? utcPeriodStartsFor(at).monthStartsAt
  const [totals, topTutorThisMonth, viewerHoursThisMonth] = await Promise.all([
    NTHSGroupsRepo.getNthsChapterImpact(
      groupId,
      schoolYear.startsAt,
      schoolYear.endsAt,
      tc
    ),
    NTHSGroupsRepo.getNthsChapterTopTutor(groupId, monthStart, at, tc),
    NTHSGroupsRepo.getNthsChapterMemberHoursTutored(
      groupId,
      viewerId,
      monthStart,
      at,
      tc
    ),
  ])
  return {
    groupId,
    schoolYear,
    schoolYearToDate: totals.schoolYearToDate,
    allTime: totals.allTime,
    goals: CHAPTER_GOALS,
    topTutorThisMonth,
    viewerHoursThisMonth,
  }
}

type GetChapterRosterOptions = {
  includeClosedAccounts?: boolean
}

export async function getChapterRoster(
  groupId: Ulid,
  at: Date,
  periodStarts: Partial<NTHSChapterPeriodStarts> = {},
  options: GetChapterRosterOptions = {},
  tc: TransactionClient = getRoClient()
): Promise<NTHSChapterRoster> {
  const { includeClosedAccounts = false } = options
  const schoolYear = schoolYearFor(at)
  const utcStarts = utcPeriodStartsFor(at)
  const starts: NTHSChapterPeriodStarts = {
    weekStartsAt: periodStarts.weekStartsAt ?? utcStarts.weekStartsAt,
    lastTwoWeeksStartsAt:
      periodStarts.lastTwoWeeksStartsAt ?? utcStarts.lastTwoWeeksStartsAt,
    monthStartsAt: periodStarts.monthStartsAt ?? utcStarts.monthStartsAt,
  }
  const [rows, topTutorThisMonth] = await Promise.all([
    NTHSGroupsRepo.getNthsChapterRoster(
      groupId,
      schoolYear.startsAt,
      schoolYear.endsAt,
      starts,
      at,
      tc
    ),
    NTHSGroupsRepo.getNthsChapterTopTutor(
      groupId,
      starts.monthStartsAt,
      at,
      tc
    ),
  ])
  return {
    groupId,
    schoolYear,
    members: includeClosedAccounts
      ? rows
      : rows.filter((row) => !row.accountClosed),
    topTutorThisMonth,
  }
}
