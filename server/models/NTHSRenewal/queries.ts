import { getClient, TransactionClient } from '../../db'
import {
  RepoCreateError,
  RepoDeleteError,
  RepoReadError,
  RepoUpdateError,
  RepoUpsertError,
} from '../Errors'
import { makeSomeRequired, Ulid } from '../pgUtils'
import * as pgQueries from './pg.queries'

export type NTHSRenewalCandidacy = 'none' | 'named' | 'accepted' | 'declined'

export type NTHSRenewalState = {
  createdAt: Date
  closedAt: Date | null
  hasConfirmedPresident: boolean
  hasNamedSuccessor: boolean
  viewerCandidacy: NTHSRenewalCandidacy
}

function toCandidacy(row: {
  viewerNamedAt?: Date
  viewerAccepted?: boolean
}): NTHSRenewalCandidacy {
  if (row.viewerAccepted === true) return 'accepted'
  if (row.viewerAccepted === false) return 'declined'
  if (row.viewerNamedAt) return 'named'
  return 'none'
}

// schoolYearStartsOn is 'YYYY-MM-DD': node-pg sends a Date in the process
// time zone, which can shift a date column by a day.
export async function getNthsRenewalState(
  groupId: Ulid,
  viewerId: Ulid,
  schoolYearStartsOn: string,
  tc: TransactionClient = getClient()
): Promise<NTHSRenewalState | undefined> {
  try {
    const [row] = await pgQueries.getNthsRenewalState.run(
      { groupId, viewerId, schoolYearStartsOn },
      tc
    )
    if (!row) return
    const required = makeSomeRequired(row, [
      'createdAt',
      'hasConfirmedPresident',
      'hasNamedSuccessor',
    ])
    return {
      createdAt: required.createdAt,
      closedAt: required.closedAt ?? null,
      hasConfirmedPresident: required.hasConfirmedPresident,
      hasNamedSuccessor: required.hasNamedSuccessor,
      viewerCandidacy: toCandidacy(required),
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export type NTHSRenewalSuccessor = {
  userId: Ulid
  firstName: string
  lastInitial: string
  accepted: boolean | null
  namedBy: { firstName: string; lastInitial: string } | null
}

export async function getRenewalSuccessors(
  groupId: Ulid,
  schoolYearStartsOn: string,
  tc: TransactionClient = getClient()
): Promise<NTHSRenewalSuccessor[]> {
  try {
    const rows = await pgQueries.getRenewalSuccessors.run(
      { groupId, schoolYearStartsOn },
      tc
    )
    return rows.map((row) => {
      const required = makeSomeRequired(row, ['userId', 'firstName'])
      return {
        userId: required.userId,
        firstName: required.firstName,
        lastInitial: required.lastInitial ?? '',
        accepted: required.accepted ?? null,
        namedBy: required.namedByFirstName
          ? {
              firstName: required.namedByFirstName,
              lastInitial: required.namedByLastInitial ?? '',
            }
          : null,
      }
    })
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function insertRenewalNominations(
  groupId: Ulid,
  schoolYearStartsOn: string,
  userIds: Ulid[],
  namedBy: Ulid,
  tc: TransactionClient
): Promise<void> {
  try {
    await pgQueries.insertRenewalNominations.run(
      { groupId, schoolYearStartsOn, userIds, namedBy },
      tc
    )
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export async function deleteUnansweredRenewalNominations(
  groupId: Ulid,
  schoolYearStartsOn: string,
  userIds: Ulid[],
  tc: TransactionClient
): Promise<void> {
  try {
    await pgQueries.deleteUnansweredRenewalNominations.run(
      { groupId, schoolYearStartsOn, userIds },
      tc
    )
  } catch (err) {
    throw new RepoDeleteError(err)
  }
}

export async function upsertRenewalAnswer(
  args: {
    groupId: Ulid
    schoolYearStartsOn: string
    userId: Ulid
    accepted: boolean
    commitments: Record<string, true> | null
  },
  tc: TransactionClient
): Promise<void> {
  try {
    await pgQueries.upsertRenewalAnswer.run(args, tc)
  } catch (err) {
    throw new RepoUpsertError(err)
  }
}

export async function demotePresidentsNotRenewing(
  groupId: Ulid,
  schoolYearStartsOn: string,
  tc: TransactionClient
): Promise<Ulid[]> {
  try {
    const rows = await pgQueries.demotePresidentsNotRenewing.run(
      { groupId, schoolYearStartsOn },
      tc
    )
    return rows.map((row) => makeSomeRequired(row, ['userId']).userId)
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export type NTHSRenewalEmailMember = NTHSRenewalEmailRecipient & {
  isAdmin: boolean
  chapterConfirmed: boolean
  chapterHasNamed: boolean
  namedUnanswered: boolean
  selfNamed: boolean
  sentTemplateIds: string[]
}

export async function getRenewalEmailMembers(
  groupId: Ulid,
  schoolYearStartsOn: string,
  sentSince: Date,
  templateIds: string[]
): Promise<NTHSRenewalEmailMember[]> {
  try {
    const rows = await pgQueries.getRenewalEmailMembers.run(
      { groupId, schoolYearStartsOn, sentSince, templateIds },
      getClient()
    )
    return rows.map((row) =>
      makeSomeRequired(row, [
        'userId',
        'email',
        'firstName',
        'chapterName',
        'isAdmin',
        'chapterConfirmed',
        'chapterHasNamed',
        'namedUnanswered',
        'selfNamed',
        'sentTemplateIds',
      ])
    )
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getRenewalCycleChapters(
  schoolYearStartsOn: string,
  closesAt: Date
): Promise<Ulid[]> {
  try {
    const rows = await pgQueries.getRenewalCycleChapters.run(
      { schoolYearStartsOn, closesAt },
      getClient()
    )
    return rows.map((row) => makeSomeRequired(row, ['id']).id)
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export type NTHSChapterDueToClose = { affectedUserIds: Ulid[] }

export async function getChapterDueToRenewalClose(
  groupId: Ulid,
  schoolYearStartsOn: string,
  closesAt: Date,
  tc: TransactionClient = getClient()
): Promise<NTHSChapterDueToClose | undefined> {
  try {
    const [row] = await pgQueries.getChapterDueToRenewalClose.run(
      { groupId, schoolYearStartsOn, closesAt },
      tc
    )
    if (!row) return
    return makeSomeRequired(row, ['affectedUserIds'])
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export type NTHSRenewalEmailRecipient = {
  userId: Ulid
  email: string
  firstName: string
  chapterName: string
}

export async function getRenewalClosedEmailRecipients(args: {
  groupId: Ulid
  schoolYearStartsOn: string
  closesAt: Date
  emailTemplateId: string
}): Promise<NTHSRenewalEmailRecipient[]> {
  try {
    const rows = await pgQueries.getRenewalClosedEmailRecipients.run(
      args,
      getClient()
    )
    return rows.map((row) =>
      makeSomeRequired(row, ['userId', 'email', 'firstName', 'chapterName'])
    )
  } catch (err) {
    throw new RepoReadError(err)
  }
}
