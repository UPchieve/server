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

export async function getGroups(userId: Ulid) {
  return await NTHSGroupsRepo.getGroupsByUser(userId)
}

export async function foundGroup(userId: Ulid) {
  return runInTransaction(async (tc: TransactionClient) => {
    const inviteCode = generateAlphanumericOfLength(6)
    const chapterNumber = (await NTHSGroupsRepo.groupsCount(tc)) + 1
    const name = `NTHS Chapter ${chapterNumber}`
    const key = name.split(' ').join('-').toLowerCase()
    const group = await NTHSGroupsRepo.createGroup(
      { inviteCode, name, key },
      tc
    )
    // TODO - need jamie's changes
    const creator = await NTHSGroupsRepo.joinGroupById(
      { groupId: group.id, userId, title: 'President' },
      tc
    )

    return {
      title: creator.title,
      id: group.id,
      name: group.name,
      key: group.key,
      inviteCode: group.inviteCode,
    }
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
    await NTHSGroupsRepo.insertNthsMemberGroupRole(
      {
        userId,
        nthsGroupId: groupId,
        roleName,
      },
      client
    )
  }, tc)
}

export async function updateGroupMemberRole(
  userId: Ulid,
  nthsGroupId: Ulid,
  role: NTHSGroupRoleName
): Promise<NTHSGroupMemberRole> {
  return await NTHSGroupsRepo.upsertNthsGroupMemberRole({
    userId,
    nthsGroupId,
    roleName: role,
  })
}

export async function getGroupMember(
  userId: Ulid,
  nthsGroupId: Ulid,
  tc: TransactionClient = getRoClient()
): Promise<Omit<NTHSGroupMemberWithRole, 'firstName' | 'email'> | undefined> {
  return await NTHSGroupsRepo.getNthsGroupMember(userId, nthsGroupId, tc)
}

export async function getGroupMembers(
  nthsGroupId: Ulid
): Promise<NTHSGroupMemberWithRole[]> {
  return await NTHSGroupsRepo.getGroupMembers(nthsGroupId)
}
