import { Ulid, Uuid } from '../models/pgUtils'
import * as NTHSGroupsRepo from '../models/NTHSGroups'
import config from '../config'
import generateAlphanumericOfLength from '../utils/generate-alphanumeric'
import { Transaction } from 'yjs'
import { getClient, getRoClient, TransactionClient } from '../db'

export async function getGroups(userId: Ulid) {
  return await NTHSGroupsRepo.getGroupsByUser(userId)
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
  tc: TransactionClient = getClient()
) {
  return await NTHSGroupsRepo.joinGroupById(
    {
      userId,
      groupId,
      title: 'member',
    },
    tc
  )
}
