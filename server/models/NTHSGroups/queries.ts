import { getClient, getRoClient, TransactionClient } from '../../db'
import { RepoCreateError, RepoReadError, RepoUpsertError } from '../Errors'
import { makeRequired, makeSomeOptional, Ulid, Uuid } from '../pgUtils'
import * as pgQueries from './pg.queries'
import type {
  NTHSGroup,
  NTHSGroupMember,
  NTHSGroupMemberRole,
  NTHSGroupMemberWithRole,
  NTHSGroupRoleName,
  UserGroup,
} from './types'
import { camelCaseKeys } from '../../tests/db-utils'

export async function getGroupsByUser(userId: Ulid): Promise<UserGroup[]> {
  try {
    const results = await pgQueries.getGroupsByUser.run(
      {
        userId,
      },
      getRoClient()
    )
    return results.map((row) => {
      const camelCased = makeRequired(row)
      return {
        ...camelCased,
        roleName: camelCased.roleName as NTHSGroupRoleName,
      }
    })
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
): Promise<Omit<NTHSGroupMember, 'firstName' | 'email'>[]> {
  try {
    const results = await pgQueries.getAllNthsUsers.run(undefined, tc)
    return results.map(
      (row) =>
        makeSomeOptional(row, ['deactivatedAt']) as Omit<
          NTHSGroupMember,
          'firstName' | 'email'
        >
    )
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function insertNthsMemberGroupRole(
  args: {
    userId: Ulid
    nthsGroupId: Ulid
    roleName: NTHSGroupRoleName
  },
  tc: TransactionClient = getClient()
): Promise<Omit<NTHSGroupMemberRole, 'firstName' | 'email'>> {
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

export async function upsertNthsGroupMemberRole(
  args: {
    userId: Ulid
    nthsGroupId: Ulid
    roleName: NTHSGroupRoleName
  },
  tc: TransactionClient = getClient()
): Promise<NTHSGroupMemberRole> {
  try {
    const results = await pgQueries.upsertNthsGroupMemberRole.run(
      {
        ...args,
      },
      tc
    )
    if (!results.length) {
      throw new Error(
        `Failed to insert or update user ${args.userId}'s role in group ${args.nthsGroupId} to ${args.roleName}`
      )
    }
    return makeRequired(results[0])
  } catch (err) {
    throw new RepoUpsertError(err)
  }
}

export async function getNthsGroupMember(
  userId: Ulid,
  nthsGroupId: Ulid,
  tc: TransactionClient = getRoClient()
): Promise<Omit<NTHSGroupMemberWithRole, 'firstName' | 'email'> | undefined> {
  try {
    const results = await pgQueries.getGroupMember.run(
      {
        userId,
        nthsGroupId,
      },
      tc
    )
    if (results.length) {
      return {
        ...makeSomeOptional(results[0], ['deactivatedAt', 'title']),
        roleName: camelCaseKeys(results[0]).roleName as NTHSGroupRoleName,
      }
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getGroupMembers(
  groupId: Ulid,
  tc: TransactionClient = getRoClient()
): Promise<NTHSGroupMemberWithRole[]> {
  try {
    const results = await pgQueries.getGroupMembers.run(
      {
        groupId,
      },
      tc
    )
    return results.map((row) => {
      const camelCased = makeSomeOptional(row, ['title', 'deactivatedAt'])
      return {
        ...camelCased,
        roleName: camelCased.roleName as NTHSGroupRoleName,
      }
    })
  } catch (err) {
    throw new RepoReadError(err)
  }
}
