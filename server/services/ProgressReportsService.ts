import { Ulid } from '../models/pgUtils'
import { logError } from '../logger'
import { TransactionClient, runInTransaction } from '../db'
import {
  ProgressReport,
  ProgressReportAnalysisTypes,
  insertProgressReport,
  insertProgressReportSession,
  insertProgressReportSummary,
  insertProgressReportSummaryDetail,
  insertProgressReportTopic,
  insertProgressReportTopicDetail,
  updateProgressReportStatus,
  ProgressReportDetail,
  ProgressReportSummaryRow,
  ProgressReportSummary,
  ProgressReportTopicRow,
  ProgressReportTopic,
  ProgressReportEvaluationTypes,
  ProgressReportEvaluationDetailTypes,
  getProgressReportSummariesForMany,
  getProgressReportTopicsByReportId,
  getProgressReportInfoBySessionId,
  getProgressReportByReportId,
  ProgressReportInfo,
} from '../models/ProgressReports'
import {
  UserSessionsWithMessages,
  getUserSessionsByUserId,
  getMessagesForFrontend,
  MessageForFrontend,
  UserSessionsFilter,
} from '../models/Session'
import { captureEvent } from './AnalyticsService'
import { EVENTS } from '../constants'
import * as BotsService from './BotsService'
import moment from 'moment'
import QueueService from './QueueService'
import { Jobs } from '../worker/jobs'

export function formatTranscriptMessage(
  message: MessageForFrontend,
  userType: string
): string {
  return `${moment(message.createdAt).format('hh:mm:ss')} ${userType}: ${
    message.contents
  }\n`
}

export function formatScorecasterSession(
  session: UserSessionsWithMessages
): string {
  let transcript = ''
  for (const message of session.messages) {
    const userType = message.user === session.studentId ? 'Student' : 'Tutor'
    transcript += formatTranscriptMessage(message, userType)
  }

  return `
    Session:
    ${transcript}

    Editor:
    ${session.quillDoc}
    `
}

export function formatSessionsForBotPrompt(
  sessions: UserSessionsWithMessages[]
): string {
  return sessions.map(formatScorecasterSession).join('\n')
}

export async function generateProgressReportForUser(
  userId: Ulid,
  filter: UserSessionsFilter
): Promise<ProgressReport> {
  const sessions = await getSessionsToAnalyzeForProgressReport(userId, filter)
  const botPrompt = await formatSessionsForBotPrompt(sessions)
  const botReport = await BotsService.generateProgressReport(userId, botPrompt)
  captureEvent(userId, EVENTS.SCORECASTER_ANALYSIS_COMPLETED, {
    response: botReport,
    debug: botReport,
  })
  const sessionIds = sessions.map(s => s.id)
  const reportId = await saveProgressReport(userId, sessionIds, botReport)
  if (!reportId)
    throw new Error(
      `Failed to save a progress report for sessions ${sessions.join(
        ','
      )} for user ${userId}`
    )
  const report = await getProgressReportForReport(reportId)
  return report
}

export async function queueGenerateProgressReportForUser(
  sessionId: Ulid
): Promise<void> {
  // TODO: We should really have retry abilities if we fail to queue a job
  await QueueService.add(
    Jobs.GenerateProgressReport,
    { sessionId },
    { removeOnComplete: true, removeOnFail: true }
  )
}

export function transformProgressReportSummaryRows(
  rows: ProgressReportSummaryRow[]
): ProgressReportSummary[] {
  const summaries: Record<Ulid, ProgressReportSummary> = {}

  for (const row of rows) {
    if (!summaries[row.id]) {
      summaries[row.id] = {
        id: row.id,
        summary: row.summary,
        overallGrade: row.overallGrade,
        details: [],
        createdAt: row.createdAt,
      }
    }

    const detail: ProgressReportDetail = {
      id: row.detailId,
      content: row.content,
      evaluationType: row.evaluationType as ProgressReportEvaluationTypes,
      evaluationDetailType: row.evaluationDetailType as ProgressReportEvaluationDetailTypes,
    }

    summaries[row.id].details.push(detail)
  }

  return Object.values(summaries)
}

export function transformProgressReportTopicRows(
  rows: ProgressReportTopicRow[]
): ProgressReportTopic[] {
  const topics: Record<Ulid, ProgressReportTopic> = {}

  for (const row of rows) {
    if (!topics[row.id]) {
      topics[row.id] = {
        id: row.id,
        name: row.name,
        description: row.description,
        grade: row.grade,
        details: [],
        createdAt: row.createdAt,
      }
    }

    const detail: ProgressReportDetail = {
      id: row.detailId,
      content: row.content,
      evaluationType: row.evaluationType as ProgressReportEvaluationTypes,
      evaluationDetailType: row.evaluationDetailType as ProgressReportEvaluationDetailTypes,
    }

    topics[row.id].details.push(detail)
  }

  return Object.values(topics)
}

export async function getProgressReportSummary(
  reportId: Ulid,
  tc?: TransactionClient
): Promise<ProgressReportSummary> {
  const summaryRows = await getProgressReportSummariesForMany([reportId], tc)
  const summaries = await transformProgressReportSummaryRows(summaryRows)
  if (!summaries.length)
    throw new Error(`No summary found for report ${reportId}`)
  return summaries[0]
}

export async function getProgressReportTopics(
  reportId: Ulid,
  tc?: TransactionClient
): Promise<ProgressReportTopic[]> {
  const topicRows = await getProgressReportTopicsByReportId(reportId, tc)
  const topics = transformProgressReportTopicRows(topicRows)
  if (!topics.length) throw new Error(`No topics found for report ${reportId}`)
  return topics
}

export async function getProgressReportSummaryAndTopics(
  reportId: Ulid,
  tc?: TransactionClient
): Promise<Pick<ProgressReport, 'summary' | 'topics'>> {
  const summary = await getProgressReportSummary(reportId, tc)
  const topics = await getProgressReportTopics(reportId, tc)
  return { summary, topics }
}

export async function getProgressReportDataAndDetails(
  getReportData: () => Promise<ProgressReportInfo | undefined>,
  tc: TransactionClient
): Promise<ProgressReport> {
  const reportData = await getReportData()
  if (!reportData?.id) {
    throw new Error('No report found')
  }
  const summaryAndTopics = await getProgressReportSummaryAndTopics(
    reportData.id,
    tc
  )
  return { ...reportData, ...summaryAndTopics }
}

export async function getProgressReportForUserSession(
  userId: Ulid,
  sessionId: Ulid
): Promise<ProgressReport> {
  return await runInTransaction(async (tc: TransactionClient) => {
    return getProgressReportDataAndDetails(
      () => getProgressReportInfoBySessionId(userId, sessionId, 'single', tc),
      tc
    )
  })
}

export async function getProgressReportForReport(
  reportId: Ulid
): Promise<ProgressReport> {
  return await runInTransaction(async (tc: TransactionClient) => {
    return getProgressReportDataAndDetails(
      () => getProgressReportByReportId(reportId, tc),
      tc
    )
  })
}

export async function saveProgressReport(
  userId: Ulid,
  sessionIds: Ulid | Ulid[],
  data: ProgressReport
): Promise<Ulid | undefined> {
  let reportId: Ulid = ''
  try {
    // Early exit if there is no report to save
    if (!Object.keys(data.summary).length || !data.topics.length) return

    reportId = await insertProgressReport(userId, 'pending')

    await runInTransaction(async (tc: TransactionClient) => {
      const sessionIdsList = Array.isArray(sessionIds)
        ? sessionIds
        : [sessionIds]
      const reportType: ProgressReportAnalysisTypes =
        sessionIdsList.length > 1 ? 'group' : 'single'

      for (const sessionId of sessionIdsList) {
        await insertProgressReportSession(reportId, sessionId, reportType, tc)
      }

      const reportSummaryId = await insertProgressReportSummary(
        reportId,
        data.summary,
        tc
      )
      for (const detail of data.summary.details) {
        await insertProgressReportSummaryDetail(reportSummaryId, detail, tc)
      }

      for (const topic of data.topics) {
        const reportTopicId = await insertProgressReportTopic(
          reportId,
          topic,
          tc
        )
        for (const detail of topic.details) {
          await insertProgressReportTopicDetail(reportTopicId, detail, tc)
        }
      }
      await updateProgressReportStatus(reportId, 'complete')
    })
    return reportId
  } catch (error) {
    logError(error as Error)
    if (reportId) await updateProgressReportStatus(reportId, 'error')
    throw error
  }
}

export async function getSessionsToAnalyzeForProgressReport(
  userId: Ulid,
  filter: UserSessionsFilter
): Promise<UserSessionsWithMessages[]> {
  const sessions = await getUserSessionsByUserId(userId, filter)
  const sessionsWithMessages: UserSessionsWithMessages[] = []
  for (const session of sessions) {
    try {
      if (!session.volunteerId) continue
      const messages = await getMessagesForFrontend(session.id)
      sessionsWithMessages.push({ ...session, messages })
    } catch (error) {
      logError(error as Error)
    }
  }
  return sessionsWithMessages
}

/**
 *
 *
 * TODO: the sessoin history tab should have a red indicator for async, temporary
 * WHEN we do the session recap
 *
 *
 *
 */
