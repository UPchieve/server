import { getClient, getRoClient, TransactionClient } from '../../db'
import { RepoCreateError, RepoReadError, RepoUpsertError } from '../Errors'
import { makeRequired, Ulid } from '../pgUtils'
import * as pgQueries from './pg.queries'
import type {
  NTHSChecklistItemProgress,
  NTHSChecklistItemStatus,
} from './types'
import { isNTHSChecklistItemStatus } from './types'

export type NTHSChecklistItemProgressRow = Omit<
  NTHSChecklistItemProgress,
  'status'
> & {
  status: string
}

export function toNTHSChecklistItemProgress(
  row: NTHSChecklistItemProgressRow
): NTHSChecklistItemProgress {
  if (!isNTHSChecklistItemStatus(row.status))
    throw new Error(`Invalid NTHS checklist item status: ${row.status}`)

  return {
    ...row,
    status: row.status,
  }
}

export async function getNTHSChecklistProgressByGroupId(
  nthsGroupId: Ulid,
  tc: TransactionClient = getRoClient()
): Promise<NTHSChecklistItemProgress[]> {
  try {
    const rows = await pgQueries.getNthsChecklistProgressByGroupId.run(
      { nthsGroupId },
      tc
    )
    return rows.map((row) => toNTHSChecklistItemProgress(makeRequired(row)))
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function upsertNTHSChecklistItemProgress(
  args: {
    nthsGroupId: Ulid
    itemKey: string
    status: NTHSChecklistItemStatus
    updatedByUserId: Ulid
  },
  tc: TransactionClient = getClient()
): Promise<NTHSChecklistItemProgress> {
  try {
    const [row] = await pgQueries.upsertNthsChecklistItemProgress.run(args, tc)
    if (!row) throw new Error('Failed to upsert NTHS checklist item progress')
    return toNTHSChecklistItemProgress(makeRequired(row))
  } catch (err) {
    throw new RepoUpsertError(err)
  }
}

export async function insertNTHSChecklistItemProgressIfMissing(
  args: {
    nthsGroupId: Ulid
    itemKey: string
    status: NTHSChecklistItemStatus
    updatedByUserId: Ulid
  },
  tc: TransactionClient = getClient()
): Promise<NTHSChecklistItemProgress | undefined> {
  try {
    const [row] = await pgQueries.insertNthsChecklistItemProgressIfMissing.run(
      args,
      tc
    )
    return row ? toNTHSChecklistItemProgress(makeRequired(row)) : undefined
  } catch (err) {
    throw new RepoCreateError(err)
  }
}
