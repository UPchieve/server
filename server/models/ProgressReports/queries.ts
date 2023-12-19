import { RepoCreateError, RepoUpdateError } from '../Errors'
import { TransactionClient, getClient } from '../../db'
import * as pgQueries from './pg.queries'
import { Ulid, getDbUlid, makeRequired } from '../pgUtils'
import {
  ProgressReportAnalysisTypes,
  ProgressReportDetailInsert,
  ProgressReportStatuses,
  ProgressReportSummaryInsert,
  ProgressReportConceptInsert,
} from './types'

export async function insertProgressReport(
  userId: Ulid,
  status: ProgressReportStatuses,
  tc?: TransactionClient
): Promise<Ulid> {
  try {
    const result = await pgQueries.insertProgressReport.run(
      {
        id: getDbUlid(),
        userId,
        status,
      },
      tc ?? getClient()
    )
    if (result.length) return makeRequired(result[0]).id
    throw new RepoCreateError(
      `insertProgressReport: Insert query did not return new row for user ${userId}`
    )
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export async function insertProgressReportSession(
  reportId: Ulid,
  sessionId: Ulid,
  analysisType: ProgressReportAnalysisTypes,
  tc?: TransactionClient
): Promise<void> {
  try {
    const result = await pgQueries.insertProgressReportSession.run(
      {
        reportId,
        sessionId,
        analysisType,
      },
      tc ?? getClient()
    )
    if (!(result.length && makeRequired(result[0]).ok))
      throw new RepoCreateError(
        `insertProgressReportSession: Insert query did not return new row for report ${reportId}`
      )
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export async function insertProgressReportSummary(
  reportId: Ulid,
  data: ProgressReportSummaryInsert,
  tc?: TransactionClient
): Promise<Ulid> {
  try {
    const result = await pgQueries.insertProgressReportSummary.run(
      {
        id: getDbUlid(),
        reportId,
        summary: data.summary,
        overallGrade: data.overallGrade,
      },
      tc ?? getClient()
    )
    if (result.length) return makeRequired(result[0]).id
    throw new RepoCreateError(
      `insertProgressReportSummary: Insert query did not return new row for report ${reportId}`
    )
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export async function insertProgressReportSummaryDetail(
  reportSummaryId: Ulid,
  data: ProgressReportDetailInsert,
  tc?: TransactionClient
): Promise<Ulid> {
  try {
    const result = await pgQueries.insertProgressReportSummaryDetail.run(
      {
        id: getDbUlid(),
        content: data.content,
        reportSummaryId,
        focusArea: data.focusArea,
        infoType: data.infoType,
      },
      tc ?? getClient()
    )
    if (result.length) return makeRequired(result[0]).id
    throw new RepoCreateError(
      `insertProgressReportSummaryDetail: Insert query did not return new row for report summary ${reportSummaryId}`
    )
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export async function insertProgressReportConcept(
  reportId: Ulid,
  data: ProgressReportConceptInsert,
  tc?: TransactionClient
): Promise<Ulid> {
  try {
    const result = await pgQueries.insertProgressReportConcept.run(
      {
        id: getDbUlid(),
        name: data.name,
        description: data.description,
        grade: data.grade,
        reportId,
      },
      tc ?? getClient()
    )
    if (result.length) return makeRequired(result[0]).id
    throw new RepoCreateError(
      `insertProgressReportConcept: Insert query did not return new row for report ${reportId}`
    )
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export async function insertProgressReportConceptDetail(
  reportConceptId: Ulid,
  data: ProgressReportDetailInsert,
  tc?: TransactionClient
): Promise<Ulid> {
  try {
    const result = await pgQueries.insertProgressReportConceptDetail.run(
      {
        id: getDbUlid(),
        content: data.content,
        reportConceptId,
        focusArea: data.focusArea,
        infoType: data.infoType,
      },
      tc ?? getClient()
    )
    if (result.length) return makeRequired(result[0]).id
    throw new RepoCreateError(
      `insertProgressReportConceptDetail: Insert query did not return new row for progress report concept ${reportConceptId}`
    )
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export async function updateProgressReportStatus(
  reportId: Ulid,
  status: ProgressReportStatuses,
  tc?: TransactionClient
): Promise<void> {
  try {
    const result = await pgQueries.updateProgressReportStatus.run(
      {
        reportId,
        status,
      },
      tc ?? getClient()
    )
    if (!(result.length && makeRequired(result[0]).ok))
      throw new RepoUpdateError(
        `updateProgressReportStatus: Update query did not return ok for ${reportId} to status ${status}`
      )
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}
