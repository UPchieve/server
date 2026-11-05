import { getClient, TransactionClient } from '../../db'
import { RepoReadError, RepoUpsertError } from '../Errors'
import { makeSomeRequired, Ulid } from '../pgUtils'
import * as pgQueries from './pg.queries'

export type NTHSRenewalCandidacy = 'none' | 'accepted'

export type NTHSRenewalState = {
  createdAt: Date
  closedAt: Date | null
  hasConfirmedPresident: boolean
  viewerCandidacy: NTHSRenewalCandidacy
  hasManager: boolean
}

function toCandidacy(row: { viewerAccepted?: boolean }): NTHSRenewalCandidacy {
  if (row.viewerAccepted === true) return 'accepted'
  return 'none'
}

// schoolYearStartsOn is 'YYYY-MM-DD': node-pg sends a Date in the process
// time zone, which can shift a date column by a day.
export async function getNthsRenewalState(
  groupId: Ulid,
  viewerId: Ulid | undefined,
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
      'hasManager',
    ])
    return {
      createdAt: required.createdAt,
      closedAt: required.closedAt ?? null,
      hasConfirmedPresident: required.hasConfirmedPresident,
      viewerCandidacy: toCandidacy(required),
      hasManager: required.hasManager,
    }
  } catch (err) {
    throw new RepoReadError(err)
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

export type NTHSRenewalEmailMember = NTHSRenewalEmailRecipient & {
  isAdmin: boolean
  isPresident: boolean
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
        'isPresident',
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

export async function getStaffClosedEmailRecipients(args: {
  groupId: Ulid
  emailTemplateId: string
}): Promise<NTHSRenewalEmailRecipient[]> {
  try {
    const rows = await pgQueries.getStaffClosedEmailRecipients.run(
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
