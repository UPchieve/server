import { RepoCreateError, RepoReadError, RepoUpdateError } from '../Errors'
import { TransactionClient, getClient } from '../../db'
import * as pgQueries from './pg.queries'
import { Ulid, getDbUlid, makeSomeRequired, ensureWriteOk } from '../pgUtils'
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
  ProgressReportOverviewUnreadStat,
  ProgressReportPrompt,
} from './types'

export async function insertProgressReport(
  userId: Ulid,
  status: ProgressReportStatuses,
  promptId: number,
  tc?: TransactionClient
): Promise<Ulid> {
  try {
    const result = await pgQueries.insertProgressReport.run(
      {
        id: getDbUlid(),
        userId,
        status,
        promptId,
      },
      tc ?? getClient()
    )
    if (result.length) return makeSomeRequired(result[0], ['id']).id
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
    ensureWriteOk(result, { reportId })
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
    if (result.length) return makeSomeRequired(result[0], ['id']).id
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
    if (result.length) return makeSomeRequired(result[0], ['id']).id
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
    if (result.length) return makeSomeRequired(result[0], ['id']).id
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
    if (result.length) return makeSomeRequired(result[0], ['id']).id
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
    ensureWriteOk(result, { reportId, status })
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
      const data = makeSomeRequired(result[0], ['createdAt', 'id', 'status'])
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
      const data = makeSomeRequired(result[0], ['createdAt', 'id', 'status'])
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
      return result.map((v) =>
        makeSomeRequired(v, [
          'content',
          'createdAt',
          'detailId',
          'focusArea',
          'id',
          'infoType',
          'overallGrade',
          'reportId',
          'sessionCreatedAt',
          'summary',
        ])
      )
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
      return result.map((v) =>
        makeSomeRequired(v, [
          'content',
          'createdAt',
          'description',
          'detailId',
          'focusArea',
          'grade',
          'id',
          'infoType',
          'name',
          'reportId',
        ])
      )
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
    const result =
      await pgQueries.getProgressReportSessionsForSubjectByPagination.run(
        {
          userId,
          subject: data.subject,
          analysisType: data.analysisType,
          limit: data.limit,
          offset: data.offset,
        },
        tc ?? getClient()
      )
    if (result.length)
      return result.map((row) =>
        makeSomeRequired(row, [
          'createdAt',
          'id',
          'subject',
          'topic',
          'topicIconLink',
        ])
      )
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
    const result =
      await pgQueries.getAllProgressReportIdsByUserIdAndSubject.run(
        {
          userId,
          subject,
          analysisType,
        },
        tc ?? getClient()
      )
    if (result.length)
      return result.map((row) => makeSomeRequired(row, ['id']).id)
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
      const data = makeSomeRequired(result[0], ['createdAt', 'id', 'status'])
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
    ensureWriteOk(result, { reportIds })
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export async function getUnreadSubjectReportsCountByUserId(
  userId: Ulid,
  tc?: TransactionClient
): Promise<ProgressReportOverviewUnreadStat[]> {
  try {
    const result = await pgQueries.getUnreadSubjectReportsCountByUserId.run(
      {
        userId,
      },
      tc ?? getClient()
    )
    return result.map((row) =>
      makeSomeRequired(row, ['subject', 'totalUnreadReports'])
    )
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getLatestProgressReportOverviewSubjectByUserId(
  userId: Ulid,
  tc?: TransactionClient
): Promise<string | undefined> {
  try {
    const result =
      await pgQueries.getLatestProgressReportOverviewSubjectByUserId.run(
        {
          userId,
        },
        tc ?? getClient()
      )
    if (result.length) return makeSomeRequired(result[0], ['name']).name
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getActiveSubjectPromptBySubjectName(
  subject: string,
  tc?: TransactionClient
): Promise<ProgressReportPrompt> {
  try {
    const result = await pgQueries.getActiveSubjectPromptBySubjectName.run(
      { subject },
      tc ?? getClient()
    )
    if (result.length) {
      const data = makeSomeRequired(result[0], ['id', 'prompt'])
      if (!data.prompt)
        throw new RepoReadError(
          `getActivePromptBySubjectName: Empty progress report prompt for subject ${subject}`
        )
      else return data
    } else
      throw new RepoReadError(
        `getActivePromptBySubjectName: No active progress report prompt found for subject ${subject}`
      )
  } catch (err) {
    throw new RepoReadError(err)
  }
}
