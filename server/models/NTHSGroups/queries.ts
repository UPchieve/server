import { getClient, getRoClient, TransactionClient } from '../../db'
import {
  RepoCreateError,
  RepoDeleteError,
  RepoReadError,
  RepoUpsertError,
  RepoUpdateError,
} from '../Errors'
import {
  makeRequired,
  makeSomeOptional,
  makeSomeRequired,
  Ulid,
  Uuid,
} from '../pgUtils'
import * as pgQueries from './pg.queries'
import type {
  NTHSAction,
  NTHSActionName,
  NTHSActiveGroupMember,
  NTHSGroup,
  NTHSGroupAction,
  NTHSGroupMemberRole,
  NTHSGroupMemberWithRole,
  NTHSGroupRoleName,
  NTHSSchoolAffiliationStatusName,
  NTHSGroupWithMemberInfo,
  NTHSChapterStatus,
  NTHSChapterStatusName,
  NTHSGroupChapterStatusInfo,
  NTHSCandidateApplicationStatus,
  NTHSChapterImpact,
  NTHSChapterPeriodStarts,
  NTHSChapterRosterMember,
  NTHSChapterTopTutor,
} from './types'
import { camelCaseKeys } from '../../tests/db-utils'
import logger from '../../logger'
import config from '../../config'

export async function getGroupsByUser(
  userId: Ulid,
  tc: TransactionClient = getRoClient()
): Promise<NTHSGroupWithMemberInfo[]> {
  try {
    const results = await pgQueries.getGroupsByUser.run(
      {
        userId,
      },
      tc
    )
    return results.map((row) => {
      const camelCased = makeSomeOptional(row, ['schoolAffiliationStatus'])
      return {
        ...camelCased,
        roleName: camelCased.roleName as NTHSGroupRoleName,
        schoolAffiliationStatus:
          (camelCased.schoolAffiliationStatus as NTHSSchoolAffiliationStatusName) ??
          null,
        hasSchoolOnRecord: !!camelCased.hasSchoolOnRecord,
        /// TODO: Simplify the return to just the below properties once the type of NTHSGroupWithUser is cleaned up
        groupInfo: {
          id: camelCased.groupId,
          name: camelCased.groupName,
          key: camelCased.groupKey,
          inviteCode: camelCased.inviteCode,
        },
        memberInfo: {
          joinedAt: camelCased.joinedAt,
          title: camelCased.memberTitle,
          roleName: camelCased.roleName as NTHSGroupRoleName,
        },
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

export async function getGroupById(
  groupId: Ulid,
  tc: TransactionClient = getRoClient()
): Promise<NTHSGroup | undefined> {
  try {
    const results = await pgQueries.getGroupById.run({ groupId }, tc)
    if (results.length) {
      return makeRequired(results[0])
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getGroupAdminsContactInfo(
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
  try {
    const results = await pgQueries.getNthsGroupAdminsContactInfo.run(
      {
        groupId,
      },
      tc
    )
    return results.map((row) =>
      makeSomeRequired(row, [
        'userId',
        'nthsGroupId',
        'firstName',
        'email',
        'chapterName',
      ])
    )
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getAdvisorContactInfo(
  groupId: Ulid,
  tc: TransactionClient = getRoClient()
): Promise<
  | {
      firstName: string
      email: string
      nthsGroupId: Ulid
      chapterName: string
    }[]
  | undefined
> {
  try {
    const results = await pgQueries.getAdvisorContactInfo.run({ groupId }, tc)
    if (results.length) {
      return results.map((row) => makeRequired(row))
    }
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
    return makeSomeRequired(results[0], [
      'userId',
      'nthsGroupId',
      'roleId',
      'roleName',
      'updatedAt',
    ])
  } catch (err) {
    throw new RepoUpsertError(err)
  }
}

export async function getActiveNthsGroupMember(
  userId: Ulid,
  nthsGroupId: Ulid,
  tc: TransactionClient = getRoClient()
): Promise<NTHSActiveGroupMember | undefined> {
  try {
    const results = await pgQueries.getActiveGroupMember.run(
      {
        userId,
        nthsGroupId,
      },
      tc
    )
    if (results.length) {
      return {
        ...makeSomeRequired(results[0], [
          'nthsGroupId',
          'userId',
          'joinedAt',
          'updatedAt',
        ]),
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

export type GetGroupMembersOptions = {
  includeDeactivated?: boolean
  excludeClosedAccounts?: boolean
}
export async function getGroupMembers(
  groupId: Ulid,
  tc: TransactionClient = getRoClient(),
  options: GetGroupMembersOptions = {}
): Promise<NTHSGroupMemberWithRole[]> {
  try {
    const results = await pgQueries.getGroupMembers.run(
      {
        groupId,
        includeDeactivated: options.includeDeactivated,
        excludeClosedAccounts: options.excludeClosedAccounts,
      },
      tc
    )
    return results.map((row) => {
      const camelCased = makeSomeRequired(row, [
        'nthsGroupId',
        'userId',
        'joinedAt',
        'updatedAt',
        'firstName',
        'lastInitial',
        'roleName',
        'deleted',
      ])
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
): Promise<NTHSGroup> {
  try {
    const [result] = await pgQueries.updateGroupName.run(
      {
        groupId,
        name,
      },
      tc
    )
    if (result) {
      return makeSomeRequired(result, [
        'id',
        'name',
        'key',
        'createdAt',
        'inviteCode',
      ])
    } else {
      throw new RepoUpdateError(`Group id ${groupId} not found`)
    }
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export async function insertNthsGroupAction(
  groupId: Ulid,
  actionName: NTHSActionName,
  tc: TransactionClient = getClient()
): Promise<NTHSGroupAction> {
  try {
    const results = await pgQueries.insertNthsGroupAction.run(
      {
        groupId,
        actionName,
      },
      tc
    )
    if (!results.length) {
      logger.error(
        { groupId, actionName },
        'Failed to insert NTHS group action'
      )
      throw new Error('Failed to insert group action')
    }
    return makeSomeRequired(results[0], [
      'id',
      'groupId',
      'actionId',
      'actionName',
      'createdAt',
    ])
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export async function deleteNthsGroupAction(
  groupId: Ulid,
  actionName: NTHSActionName,
  tc: TransactionClient = getClient()
): Promise<void> {
  try {
    await pgQueries.deleteNthsGroupAction.run(
      {
        groupId,
        actionName,
      },
      tc
    )
  } catch (err) {
    throw new RepoDeleteError(err)
  }
}

export async function getNthsGroupActionsByGroupId(
  nthsGroupId: Ulid,
  tc: TransactionClient = getRoClient()
): Promise<NTHSGroupAction[]> {
  try {
    const results = await pgQueries.getAllNthsGroupActionsByGroupId.run(
      {
        groupId: nthsGroupId,
      },
      tc
    )
    return results.map((row) =>
      makeSomeRequired(row, [
        'id',
        'groupId',
        'actionId',
        'actionName',
        'createdAt',
      ])
    )
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getNthsActions(
  tc: TransactionClient = getRoClient()
): Promise<NTHSAction[]> {
  try {
    const results = await pgQueries.getNthsActions.run(undefined, tc)
    return results.map((row) => makeSomeRequired(row, ['id', 'name']))
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function updateSchoolAffiliationStatus(
  status: NTHSSchoolAffiliationStatusName,
  nthsGroupId: Ulid,
  tc: TransactionClient = getClient()
): Promise<NTHSSchoolAffiliationStatusName> {
  try {
    const result = await pgQueries.upsertSchoolAffiliationStatus.run(
      { status, nthsGroupId },
      tc
    )
    if (!result.length) {
      throw new Error(
        `Failed to upsert school affiliation status for group ${nthsGroupId}`
      )
    }
    return result[0].status! as NTHSSchoolAffiliationStatusName
  } catch (err) {
    throw new RepoUpsertError(err)
  }
}

export async function insertSchoolAffiliation(
  args: {
    nthsGroupId: Ulid
    schoolId: Uuid
    status: NTHSSchoolAffiliationStatusName
  },
  tc: TransactionClient = getClient()
): Promise<void> {
  let result
  try {
    result = await pgQueries.insertSchoolAffiliation.run(args, tc)
  } catch (err) {
    throw new RepoCreateError(err)
  }
  // If the status name doesn't match an actual row, the INSERT ... SELECT
  // silently inserts zero rows instead of erroring so this check is what
  // turns that into a visible failure.
  if (!result.length)
    throw new Error(
      `No ${args.status} school affiliation status to insert for group ${args.nthsGroupId}`
    )
}

type AdvisorArgs = {
  nthsGroupId: Ulid
  schoolId?: Ulid
  firstName: string
  lastName: string
  email: string
  phone?: string
  phoneExtension?: string
  title: string
}

export type Advisor = {
  id: Ulid
} & AdvisorArgs

export async function addNTHSAdvisor(
  args: AdvisorArgs,
  tc: TransactionClient = getClient()
): Promise<Advisor> {
  try {
    const results = await pgQueries.insertNthsAdvisor.run(args, tc)
    return makeSomeOptional(results[0], ['phone', 'phoneExtension', 'schoolId'])
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export async function addSchoolToSchoolAffiliation(
  args: {
    nthsGroupId: Ulid
    schoolId?: Ulid
  },
  tc: TransactionClient = getClient()
): Promise<{ schoolId?: Ulid; mismatched: boolean } | undefined> {
  try {
    const result = await pgQueries.addSchoolToSchoolAffiliation.run(args, tc)
    if (!result.length) return
    return makeSomeRequired(result[0], ['mismatched'])
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export async function getChapterStatus(
  nthsGroupId: Ulid,
  tc: TransactionClient = getRoClient()
): Promise<NTHSChapterStatus | undefined> {
  try {
    const results = await pgQueries.getLatestNthsChapterStatus.run(
      {
        groupId: nthsGroupId,
      },
      tc
    )
    if (results.length) {
      const row = makeRequired(results[0])
      return makeRequired({
        ...row,
        statusName: row.statusName as NTHSChapterStatusName,
      })
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function insertChapterStatus(
  nthsGroupId: Ulid,
  status: NTHSChapterStatusName,
  tc: TransactionClient = getClient()
): Promise<NTHSChapterStatus> {
  try {
    const results = await pgQueries.insertStatusForNthsChapter.run(
      {
        groupId: nthsGroupId,
        statusName: status,
      },
      tc
    )
    if (!results.length) {
      throw new Error(
        'Did not get back insert results when inserting NTHS chapter status'
      )
    }
    const row = makeRequired(results[0])
    return makeRequired({
      ...row,
      statusName: row.statusName as NTHSChapterStatusName,
    })
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export async function getAllNTHSGroupsChapterStatus(
  tc: TransactionClient = getRoClient()
): Promise<NTHSGroupChapterStatusInfo[]> {
  try {
    const results = await pgQueries.getAllNthsGroupsWithStatus.run(
      undefined,
      tc
    )
    return results.map((row) => {
      const camelCased = makeSomeRequired(row, ['groupId'])
      return {
        ...camelCased,
        statusName: camelCased?.statusName as NTHSChapterStatusName,
        schoolAffiliationStatusName:
          camelCased?.schoolAffiliationStatusName as NTHSSchoolAffiliationStatusName,
      }
    })
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getNthsChapterImpact(
  groupId: Ulid,
  startsAt: Date,
  endsAt: Date,
  tc: TransactionClient = getRoClient()
): Promise<Pick<NTHSChapterImpact, 'schoolYearToDate' | 'allTime'>> {
  try {
    const results = await pgQueries.getNthsChapterImpact.run(
      { groupId, startsAt, endsAt, minSessionLength: config.minSessionLength },
      tc
    )
    const row = makeSomeRequired(results[0], [
      'sessionsCompletedThisYear',
      'studentsHelpedThisYear',
      'hoursTutoredThisYear',
      'membersTutoringThisYear',
      'sessionsCompletedAllTime',
      'studentsHelpedAllTime',
      'hoursTutoredAllTime',
    ])
    return {
      schoolYearToDate: {
        studentsHelped: row.studentsHelpedThisYear,
        sessionsCompleted: row.sessionsCompletedThisYear,
        hoursTutored: row.hoursTutoredThisYear,
        membersTutoring: row.membersTutoringThisYear,
      },
      allTime: {
        studentsHelped: row.studentsHelpedAllTime,
        sessionsCompleted: row.sessionsCompletedAllTime,
        hoursTutored: row.hoursTutoredAllTime,
      },
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getNthsChapterRoster(
  groupId: Ulid,
  startsAt: Date,
  endsAt: Date,
  periodStarts: NTHSChapterPeriodStarts,
  periodEndsAt: Date,
  tc: TransactionClient = getRoClient()
): Promise<NTHSChapterRosterMember[]> {
  try {
    const results = await pgQueries.getNthsChapterRoster.run(
      {
        groupId,
        startsAt,
        endsAt,
        ...periodStarts,
        periodEndsAt,
        minSessionLength: config.minSessionLength,
      },
      tc
    )
    return results.map((row) => {
      const { hoursThisWeek, hoursLastTwoWeeks, hoursThisMonth, ...member } =
        makeSomeRequired(row, [
          'userId',
          'firstName',
          'lastInitial',
          'joinedAt',
          'roleName',
          'trainingComplete',
          'safetyApproved',
          'accountClosed',
          'sessionsThisYear',
          'hoursThisYear',
          'hoursThisWeek',
          'hoursLastTwoWeeks',
          'hoursThisMonth',
        ])
      return {
        ...member,
        roleName: member.roleName as NTHSGroupRoleName,
        periodHours: {
          thisWeek: hoursThisWeek,
          lastTwoWeeks: hoursLastTwoWeeks,
          thisMonth: hoursThisMonth,
        },
      }
    })
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getNthsChapterTopTutor(
  groupId: Ulid,
  startsAt: Date,
  endsAt: Date,
  tc: TransactionClient = getRoClient()
): Promise<NTHSChapterTopTutor | undefined> {
  try {
    const results = await pgQueries.getNthsChapterTopTutor.run(
      { groupId, startsAt, endsAt, minSessionLength: config.minSessionLength },
      tc
    )
    if (!results.length) return
    return makeSomeRequired(results[0], [
      'userId',
      'firstName',
      'lastInitial',
      'sessionsCompleted',
      'hoursTutored',
    ])
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getNthsChapterMemberHoursTutored(
  groupId: Ulid,
  userId: Ulid,
  startsAt: Date,
  endsAt: Date,
  tc: TransactionClient = getRoClient()
): Promise<number> {
  try {
    const results = await pgQueries.getNthsChapterMemberHoursTutored.run(
      {
        groupId,
        userId,
        startsAt,
        endsAt,
        minSessionLength: config.minSessionLength,
      },
      tc
    )
    return makeSomeRequired(results[0], ['hoursTutored']).hoursTutored
  } catch (err) {
    throw new RepoReadError(err)
  }
}
