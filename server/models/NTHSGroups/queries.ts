import { getClient, getRoClient, TransactionClient } from '../../db'
import { RepoCreateError, RepoReadError } from '../Errors'
import { makeRequired, makeSomeOptional, Ulid, Uuid } from '../pgUtils'
import * as pgQueries from './pg.queries'
import type { NTHSGroup, UserGroup } from './types'

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
