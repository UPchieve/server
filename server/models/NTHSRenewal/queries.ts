import { getClient, TransactionClient } from '../../db'
import { RepoReadError } from '../Errors'
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
