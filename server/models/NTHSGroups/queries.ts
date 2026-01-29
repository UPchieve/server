import { getClient, getRoClient, TransactionClient } from '../../db'
import {
  RepoCreateError,
  RepoReadError,
  RepoUpsertError,
  RepoUpdateError,
} from '../Errors'
import { makeRequired, makeSomeOptional, Ulid } from '../pgUtils'
import * as pgQueries from './pg.queries'
import type {
  NTHSGroup,
  NTHSGroupMemberRole,
  NTHSGroupMemberWithRole,
  NTHSGroupRoleName,
  UserGroup,
} from './types'
import { camelCaseKeys } from '../../tests/db-utils'

export async function getGroupsByUser(
  userId: Ulid,
  tc: TransactionClient = getRoClient()
): Promise<UserGroup[]> {
  try {
    const results = await pgQueries.getGroupsByUser.run(
      {
        userId,
      },
      tc
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
  inviteCode: string,
  tc: TransactionClient = getRoClient()
): Promise<Omit<NTHSGroup, 'inviteCode'>> {
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

    return makeSomeOptional(results[0], ['deactivatedAt'])
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
): Promise<
  Omit<NTHSGroupMemberWithRole, 'firstName' | 'lastInitial'> | undefined
> {
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

export async function groupsCount(tc: TransactionClient = getClient()) {
  try {
    const results = await pgQueries.groupsCount.run(undefined, tc)
    return results[0].count ?? 0
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

export async function createGroup(
  {
    inviteCode,
    name,
    key,
  }: {
    inviteCode: string
    name: string
    key: string
  },

  tc: TransactionClient = getClient()
): Promise<NTHSGroup> {
  try {
    const results = await pgQueries.createGroup.run(
      {
        inviteCode,
        name,
        key,
      },
      tc
    )

    return makeRequired(results[0])
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export async function deactivateGroupMember(
  userId: Ulid,
  nthsGroupId: Ulid,
  tc: TransactionClient = getClient()
) {
  try {
    await pgQueries.deactivateGroupMember.run(
      {
        userId,
        groupId: nthsGroupId,
      },
      tc
    )
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export async function updateGroupName(
  groupId: Ulid,
  name: string,
  tc: TransactionClient = getClient()
): Promise<NTHSGroup | void> {
  try {
    const [result] = await pgQueries.updateGroupName.run(
      {
        groupId,
        name,
      },
      tc
    )
    if (result) {
      return makeRequired(result)
    } else {
      throw new RepoUpdateError(`Group id ${groupId} not found`)
    }
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}
