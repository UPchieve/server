import { RepoCreateError, RepoReadError, RepoUpdateError } from '../Errors'
import { TransactionClient, getClient } from '../../db'
import * as pgQueries from './pg.queries'
import { Ulid, getDbUlid, makeRequired, makeSomeOptional } from '../pgUtils'
import {
  ProgressReportAnalysisTypes,
  ProgressReportDetailInsert,
  ProgressReportInfo,
  ProgressReportStatuses,
  ProgressReportSummaryInsert,
  ProgressReportConceptInsert,
  ProgressReportConceptRow,
  ProgressReportSummaryRow,
  ProgressReportSessionPaginated,
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

export async function getProgressReportInfoBySessionId(
  userId: Ulid,
  sessionId: Ulid,
  analysisType: ProgressReportAnalysisTypes,
  tc?: TransactionClient
): Promise<ProgressReportInfo | undefined> {
  try {
    const result = await pgQueries.getProgressReportInfoBySessionId.run(
      {
        userId,
        sessionId,
        analysisType,
      },
      tc ?? getClient()
    )
    if (result.length) {
      const data = makeSomeOptional(result[0], ['readAt'])
      return {
        ...data,
        status: data.status as ProgressReportStatuses,
      }
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getProgressReportByReportId(
  reportId: Ulid,
  tc?: TransactionClient
): Promise<ProgressReportInfo | undefined> {
  try {
    const result = await pgQueries.getProgressReportByReportId.run(
      {
        reportId,
      },
      tc ?? getClient()
    )
    if (result.length) {
      const data = makeSomeOptional(result[0], ['readAt'])
      return {
        ...data,
        status: data.status as ProgressReportStatuses,
      }
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getProgressReportSummariesForMany(
  reportIds: Ulid[],
  tc?: TransactionClient
): Promise<ProgressReportSummaryRow[]> {
  try {
    const result = await pgQueries.getProgressReportSummariesForMany.run(
      {
        reportIds,
      },
      tc ?? getClient()
    )
    if (result.length)
      return result.map(v => makeSomeOptional(v, ['reportReadAt']))
    return []
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getProgressReportConceptsByReportId(
  reportId: Ulid,
  tc?: TransactionClient
): Promise<ProgressReportConceptRow[]> {
  try {
    const result = await pgQueries.getProgressReportConceptsByReportId.run(
      {
        reportId,
      },
      tc ?? getClient()
    )
    if (result.length)
      return result.map(v => makeSomeOptional(v, ['reportReadAt']))
    return []
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getProgressReportSessionsForSubjectByPagination(
  userId: Ulid,
  data: {
    subject: string
    analysisType: ProgressReportAnalysisTypes
    limit: number
    offset: number
  },
  tc?: TransactionClient
): Promise<ProgressReportSessionPaginated[]> {
  try {
    const result = await pgQueries.getProgressReportSessionsForSubjectByPagination.run(
      {
        userId,
        subject: data.subject,
        analysisType: data.analysisType,
        limit: data.limit,
        offset: data.offset,
      },
      tc ?? getClient()
    )
    if (result.length) return result.map(row => makeRequired(row))
    return []
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getAllProgressReportIdsByUserIdAndSubject(
  userId: Ulid,
  subject: string,
  analysisType: ProgressReportAnalysisTypes,
  tc?: TransactionClient
): Promise<Ulid[]> {
  try {
    const result = await pgQueries.getAllProgressReportIdsByUserIdAndSubject.run(
      {
        userId,
        subject,
        analysisType,
      },
      tc ?? getClient()
    )
    if (result.length) return result.map(row => makeRequired(row).id)
    return []
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getLatestProgressReportIdBySubject(
  userId: Ulid,
  subject: Ulid,
  analysisType: ProgressReportAnalysisTypes,
  tc?: TransactionClient
): Promise<ProgressReportInfo | undefined> {
  try {
    const result = await pgQueries.getLatestProgressReportIdBySubject.run(
      {
        userId,
        subject,
        analysisType,
      },
      tc ?? getClient()
    )
    if (result.length) {
      const data = makeSomeOptional(result[0], ['readAt'])
      return {
        ...data,
        status: data.status as ProgressReportStatuses,
      }
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function updateProgressReportsReadAtByReportIds(
  reportIds: Ulid[],
  tc?: TransactionClient
): Promise<void> {
  try {
    const result = await pgQueries.updateProgressReportsReadAtByReportIds.run(
      { reportIds },
      tc ?? getClient()
    )
    if (!(result.length && makeRequired(result[0]).ok))
      throw new RepoUpdateError(
        `updateProgressReportReadAt: Update query did not return ok for ${reportIds.join(
          ','
        )}`
      )
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export async function getUnreadProgressReportOverviewSubjectsByUserId(
  userId: Ulid,
  tc?: TransactionClient
): Promise<string[]> {
  try {
    const result = await pgQueries.getUnreadProgressReportOverviewSubjectsByUserId.run(
      {
        userId,
      },
      tc ?? getClient()
    )
    if (result.length) return result.map(row => makeRequired(row).subject)
    return []
  } catch (err) {
    throw new RepoReadError(err)
  }
}
