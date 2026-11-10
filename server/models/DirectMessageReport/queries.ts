import * as pgQueries from './pg.queries'
import { getClient, TransactionClient } from '../../db'
import { getDbUlid, makeRequired, makeSomeRequired } from '../pgUtils'
import { RepoCreateError, RepoReadError } from '../Errors'
import type { Uuid } from '../../types/shared'
import type { DirectMessageReport } from '../../types/direct-messages'

type DirectMessageReportRow = {
  id: Uuid
  conversationId: Uuid
  reportingUserId: Uuid
  reportedUserId: Uuid
  reportReason: string
  reportMessage: string | null
  studentId: Uuid
  volunteerId: Uuid
}

function toDirectMessageReport(
  row: DirectMessageReportRow
): DirectMessageReport {
  const report = makeSomeRequired(row, [
    'id',
    'conversationId',
    'reportingUserId',
    'reportedUserId',
    'reportReason',
    'studentId',
    'volunteerId',
  ])
  return {
    id: report.id,
    conversationId: report.conversationId,
    reportingUserId: report.reportingUserId,
    reportedUserId: report.reportedUserId,
    reportReason: report.reportReason,
    reportMessage: report.reportMessage,
    studentId: report.studentId,
    volunteerId: report.volunteerId,
  }
}

export async function createReport(
  data: {
    conversationId: Uuid
    reportReason: string
    reportMessage?: string
    reportingUserId: Uuid
    reportedUserId: Uuid
  },
  client: TransactionClient
): Promise<Uuid> {
  try {
    const [row] = await pgQueries.createReport.run(
      { id: getDbUlid(), ...data },
      client
    )
    if (!row) throw new Error('DM report reason not found')
    return makeRequired(row).id
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export async function createReportFlag(
  data: { conversationId: Uuid; reportId: Uuid; flagName: string },
  client: TransactionClient
) {
  try {
    const rows = await pgQueries.createReportFlag.run(
      { id: getDbUlid(), ...data },
      client
    )
    if (!rows.length) throw new Error('DM report or flag category not found')
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export async function getReportById(
  reportId: Uuid
): Promise<DirectMessageReport> {
  try {
    const [row] = await pgQueries.getReportById.run({ reportId }, getClient())
    if (!row) throw new Error('DM report not found')
    return toDirectMessageReport(row)
  } catch (err) {
    throw new RepoReadError(err)
  }
}
