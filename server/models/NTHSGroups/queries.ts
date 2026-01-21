import { getClient, getRoClient, TransactionClient } from '../../db'
import { RepoCreateError, RepoReadError } from '../Errors'
import { makeRequired, makeSomeOptional, Ulid, Uuid } from '../pgUtils'
import * as pgQueries from './pg.queries'
import type {
  NTHSGroup,
  NTHSGroupMember,
  NTHSGroupMemberRole,
  UserGroup,
} from './types'

export async function getGroupsByUser(userId: Ulid): Promise<UserGroup[]> {
  try {
    const results = await pgQueries.getGroupsByUser.run(
      {
        userId,
      },
      getRoClient()
    )
    return results.map(makeRequired)
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getInviteCodeForGroup(groupId: Ulid) {
  try {
    const results = await pgQueries.getInviteCodeForGroup.run(
      { id: groupId },
      getRoClient()
    )
    return results.map(makeRequired)[0]
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getGroupByInviteCode(
  inviteCode: Uuid,
  tc: TransactionClient = getRoClient()
): Promise<NTHSGroup> {
  try {
    const results = await pgQueries.getGroupByInviteCode.run(
      {
        inviteCode,
      },
      tc
    )
    return results.map(makeRequired)[0]
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function joinGroupById(
  {
    userId,
    groupId,
    title,
  }: {
    userId: Ulid
    groupId: Ulid
    title: string
  },

  tc: TransactionClient = getClient()
) {
  try {
    const results = await pgQueries.joinGroupById.run(
      {
        userId,
        groupId,
        title,
      },
      tc
    )

    return results.map((row) => makeSomeOptional(row, ['deactivatedAt']))
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export async function getAllNthsMembers(
  tc: TransactionClient = getRoClient()
): Promise<NTHSGroupMember[]> {
  try {
    const results = await pgQueries.getAllNthsUsers.run(undefined, tc)
    return results.map(
      (row) => makeSomeOptional(row, ['deactivatedAt']) as NTHSGroupMember
    )
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function insertNthsMemberGroupRole(
  args: {
    userId: Ulid
    nthsGroupId: Ulid
    roleName: string
  },
  tc: TransactionClient = getClient()
): Promise<NTHSGroupMemberRole> {
  try {
    const result = await pgQueries.insertNthsGroupMemberRole.run(
      {
        ...args,
      },
      tc
    )
    if (!result.length) {
      throw new RepoCreateError(
        `Did not get a result back after attempting to insert NTHS group member role for user ${args.userId} and group ${args.nthsGroupId} and role ${args.roleName}`
      )
    }
    return makeRequired(result[0]) as NTHSGroupMemberRole
  } catch (err) {
    throw new RepoCreateError(err)
  }
}
