import { Ulid, Uuid } from '../models/pgUtils'
import * as NTHSGroupsRepo from '../models/NTHSGroups'
import {
  getClient,
  getRoClient,
  runInTransaction,
  TransactionClient,
} from '../db'
import {
  GetGroupMembersOptions,
  NTHS_ACTIONS_TO_SCHOOL_AFFILIATION_STATUS_MAPPING,
  NTHSAction,
  NTHSActionName,
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
  NTHSCandidateApplicationStatus,
} from '../models/NTHSGroups'
import generateAlphanumericOfLength from '../utils/generate-alphanumeric'
import {
  AlreadyInNTHSGroupError,
  CannotRemoveSoleNTHSAdminError,
  NTHSGroupAffiliationExistsError,
} from '../models/Errors'
import logger from '../logger'
import QueueService from './QueueService'
import { Jobs } from '../worker/jobs'

export async function getGroups(userId: Ulid) {
  return await NTHSGroupsRepo.getGroupsByUser(userId)
}

export async function foundGroup(
  userId: Ulid
): Promise<NTHSGroupWithMemberInfo> {
  return runInTransaction(async (tc: TransactionClient) => {
    const groups = await NTHSGroupsRepo.getGroupsByUser(userId, tc)

    // For now, let's enforce single group membership
    if (groups.length > 0) {
      throw new AlreadyInNTHSGroupError()
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
      schoolAffiliationStatus: null,
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
    nthsGroupId: Ulid
    firstName: string
    email: string
  }[]
> {
  return await NTHSGroupsRepo.getGroupAdminsContactInfo(groupId, tc)
}

export async function joinGroupAsMemberByGroupId(
  userId: Ulid,
  groupId: Ulid,
  roleName: NTHSGroupRoleName = 'member',
  tc: TransactionClient = getClient()
) {
  return await runInTransaction(async (client: TransactionClient) => {
    await NTHSGroupsRepo.joinGroupById(
      {
        userId,
        groupId,
        title: 'member',
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
}

export async function getNTHSGroupsByMember(
  userId: Ulid,
  tc: TransactionClient = getRoClient()
): Promise<NTHSGroupWithMemberInfo[]> {
  return await NTHSGroupsRepo.getGroupsByUser(userId, tc)
}

type UpdateGroupMemberRequest = {
  role?: NTHSGroupRoleName
  isActive?: boolean
}

export async function updateGroupMember(
  userId: Ulid,
  nthsGroupId: Ulid,
  update: UpdateGroupMemberRequest
) {
  // Do not allow deactivating or demoting of the sole admin of the group
  const client = getClient()
  const members = await NTHSGroupsRepo.getGroupMembers(nthsGroupId, client)
  const activeAdmins = members.filter(
    (member) => member.roleName === 'admin' && !member.deactivatedAt
  )
  if (activeAdmins.length === 1 && userId === activeAdmins[0].userId) {
    if (update.role !== 'admin' || update.isActive) {
      throw new CannotRemoveSoleNTHSAdminError()
    }
  }
  await runInTransaction(async (tc) => {
    if (update.role) {
      await updateGroupMemberRole(userId, nthsGroupId, update.role, tc)
    }
    if (update.isActive === false) {
      // For now, only DEactivating is possible, not reactivating.
      await NTHSGroupsRepo.deactivateGroupMember(userId, nthsGroupId, tc)
    }
  }, client)
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

export async function getGroupMember(
  userId: Ulid,
  nthsGroupId: Ulid,
  tc: TransactionClient = getRoClient()
): Promise<
  Omit<NTHSGroupMemberWithRole, 'firstName' | 'lastInitial'> | undefined
> {
  return await NTHSGroupsRepo.getNthsGroupMember(userId, nthsGroupId, tc)
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
    schoolId: string
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
    schoolId: string
  },
  tc: TransactionClient = getClient()
) {
  return await NTHSGroupsRepo.addSchoolToSchoolAffiliation(args, tc)
}

export async function submitSchoolAffilaiton({
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
  schoolId: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  phoneExtension?: string
  title: string
}) {
  return runInTransaction(async (tc) => {
    try {
      const NTHSAdvisor = await addNTHSAdvisor(
        {
          nthsGroupId,
          schoolId,
          firstName,
          lastName,
          email,
          phone,
          phoneExtension,
          title,
        },
        tc
      )

      const created = await createAction(
        nthsGroupId,
        'SUBMITTED ADVISOR CONTACT INFO',
        tc
      )

      await addSchoolToSchoolAffiliation(
        {
          nthsGroupId,
          schoolId,
        },
        tc
      )

      return { groupId: nthsGroupId, NTHSAdvisor, action: created }
    } catch (err) {
      if (err instanceof Error && err.message.includes('unique_school_id')) {
        throw new NTHSGroupAffiliationExistsError()
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

export async function deactivateNonHighSchoolMember(
  userId: Ulid,
  groups: NTHSGroupWithMemberInfo[] | undefined,
  tc: TransactionClient = getClient()
) {
  const groupsToRemoveFrom: NTHSGroupWithMemberInfo[] =
    groups ?? (await NTHSGroupsRepo.getGroupsByUser(userId, tc))
  const logData = { userId, groupIds: groupsToRemoveFrom.map((g) => g.groupId) }
  try {
    await runInTransaction(async (client) => {
      for (const group of groupsToRemoveFrom) {
        await NTHSGroupsRepo.deactivateGroupMember(
          userId,
          group.groupId,
          client
        )
        await QueueService.add(Jobs.NotifyNTHSChapterAdminsOfDeactivatedUser, {
          deactivatedUserId: userId,
          nthsGroupId: group.groupId,
        })
      }
      logger.info(
        logData,
        'Removed non-high school user from all NTHS chapters'
      )
    }, tc)
  } catch (err) {
    logger.error(
      logData,
      'Failed to deactivate non-high school user from all NTHS chapters'
    )
  }
}

export async function getLatestCandidateApplicationStatus(
  userId: Ulid
): Promise<NTHSCandidateApplicationStatus> {
  return NTHSGroupsRepo.getLatestCandidateApplicationStatus(userId)
}

export async function createCandidateApplication({
  status,
  userId,
  deniedNotes,
}: {
  status: NTHSCandidateApplicationStatus
  userId: Ulid
  deniedNotes?: string
}): Promise<
  {
    id: number
    userId: Ulid
    status: NTHSCandidateApplicationStatus
    createdAt: Date
  }[]
> {
  return NTHSGroupsRepo.createCandidateApplication({
    status,
    userId,
    deniedNotes,
  })
}
