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
} from '../models/ProgressReports'
import {
  UserSessionsWithMessages,
  getUserSessionsByUserId,
  getMessagesForFrontend,
  MessageForFrontend,
} from '../models/Session'
import { captureEvent } from './AnalyticsService'
import { EVENTS } from '../constants'
import * as BotsService from './BotsService'
import moment from 'moment'

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

export async function saveProgressReport(
  userId: Ulid,
  sessionIds: Ulid | Ulid[],
  data: ProgressReport
) {
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
  } catch (error) {
    logError(error as Error)
    if (reportId) await updateProgressReportStatus(reportId, 'error')
    throw error
  }
}

export async function getSessionsToAnalyzeForProgressReport(
  userId: Ulid,
  sessionId?: Ulid
): Promise<UserSessionsWithMessages[]> {
  const sessions = await getUserSessionsByUserId(userId, {
    subject: 'reading',
    sessionId,
  })
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

export async function generateProgressReportForUser(
  userId: Ulid,
  sessionId?: Ulid
): Promise<ProgressReport> {
  const sessions = await getSessionsToAnalyzeForProgressReport(
    userId,
    sessionId
  )
  const botPrompt = await formatSessionsForBotPrompt(sessions)
  const report = await BotsService.generateProgressReport(userId, botPrompt)
  captureEvent(userId, EVENTS.SCORECASTER_ANALYSIS_COMPLETED, {
    response: report,
    debug: report,
  })
  const sessionIds = sessions.map(s => s.id)
  await saveProgressReport(userId, sessionIds, report)
  return report
}
