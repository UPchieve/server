import { Ulid, Uuid } from '../models/pgUtils'
import * as NTHSGroupsRepo from '../models/NTHSGroups'
import config from '../config'
import {
  getClient,
  getRoClient,
  runInTransaction,
  TransactionClient,
} from '../db'
import {
  NTHSGroupMemberRole,
  NTHSGroupMemberWithRole,
  NTHSGroupRoleName,
} from '../models/NTHSGroups'
import generateAlphanumericOfLength from '../utils/generate-alphanumeric'
import {
  AlreadyInNTHSGroupError,
  CannotRemoveSoleNTHSAdminError,
} from '../models/Errors'

export async function getGroups(userId: Ulid) {
  return await NTHSGroupsRepo.getGroupsByUser(userId)
}

export async function foundGroup(userId: Ulid) {
  return runInTransaction(async (tc: TransactionClient) => {
    const groups = await NTHSGroupsRepo.getGroupsByUser(userId, tc)

    // For now, let's enforce single group membership
    if (groups.length > 0) {
      throw new AlreadyInNTHSGroupError()
    }

    const inviteCode = generateAlphanumericOfLength(6)
    const chapterNumber = Number(await NTHSGroupsRepo.groupsCount(tc)) + 1
    const name = `NTHS Chapter ${chapterNumber}`
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
      memberTitle: creator.title,
      joinedAt: creator.joinedAt,
      groupId: group.id,
      groupName: group.name,
      groupKey: group.key,
      inviteCode: group.inviteCode,
      roleName: 'admin',
    }

    return result
  })
}

export async function getInviteLinkForGroup(groupId: Ulid) {
  const code = await NTHSGroupsRepo.getInviteCodeForGroup(groupId)
  return `https://${config.client.host}/join-group/${code}`
}

export async function getNTHSGroupByInviteCode(
  inviteCode: Uuid,
  tc: TransactionClient = getRoClient()
) {
  return await NTHSGroupsRepo.getGroupByInviteCode(inviteCode, tc)
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
  }, tc)
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
  nthsGroupId: Ulid
): Promise<NTHSGroupMemberWithRole[]> {
  return await NTHSGroupsRepo.getGroupMembers(nthsGroupId)
}
