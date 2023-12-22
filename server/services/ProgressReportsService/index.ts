import { Ulid } from '../../models/pgUtils'
import logger, { logError } from '../../logger'
import { TransactionClient, runInTransaction } from '../../db'
import {
  ProgressReportAnalysisTypes,
  insertProgressReport,
  insertProgressReportSession,
  insertProgressReportSummary,
  insertProgressReportSummaryDetail,
  insertProgressReportConcept,
  insertProgressReportConceptDetail,
  updateProgressReportStatus,
} from '../../models/ProgressReports'
import {
  UserSessionsWithMessages,
  getUserSessionsByUserId,
  getMessagesForFrontend,
  MessageForFrontend,
} from '../../models/Session'
import { captureEvent } from '../AnalyticsService'
import { EVENTS } from '../../constants'
import moment from 'moment'
import { ProgressReport } from './types'
import { openai } from '../BotsService'

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
  sessionIds: Ulid[],
  data: ProgressReport
) {
  let reportId: Ulid = ''
  try {
    // Early exit if there is no report to save
    if (!Object.keys(data.summary).length || !data.concepts.length) return

    reportId = await insertProgressReport(userId, 'pending')

    await runInTransaction(async (tc: TransactionClient) => {
      const reportType: ProgressReportAnalysisTypes =
        sessionIds.length > 1 ? 'group' : 'single'

      for (const sessionId of sessionIds) {
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

      for (const concept of data.concepts) {
        const reportConceptId = await insertProgressReportConcept(
          reportId,
          concept,
          tc
        )
        for (const detail of concept.details) {
          await insertProgressReportConceptDetail(reportConceptId, detail, tc)
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
  const report = await generateProgressReport(userId, botPrompt)
  captureEvent(userId, EVENTS.SCORECASTER_ANALYSIS_COMPLETED, {
    response: report,
    debug: report,
  })
  const sessionIds = sessions.map(s => s.id)
  await saveProgressReport(userId, sessionIds, report)
  return report
}

export async function generateProgressReport(
  userId: Ulid,
  botPrompt: string
): Promise<ProgressReport> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4-1106-preview',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `Analyze transcripts from a series of high school reading tutoring sessions involving the same student. 
          Predict the topics for the student's next quiz and assess their likely performance. 
          Highlight the areas where the student is expected to excel, 
          based on the dialogue and editor content provided in each session. 
          The format of the transcripts is:

          Session:
          [hh:mm:ss] Tutor: {message}
          [hh:mm:ss] Student: {message}
          
          Editor:
          {editorContent}
          
          The editor content is a JSON representation of a Quill Editor document in Quill's Delta format. 
          The Delta format is a series of operations applied to the document. 
          Both the student and the tutor can commit operations. You will not know the author of an operation, 
          although you can assume that students insert the early original content into the document; 
          tutors may make edits intended to represent annotations, corrections, examples, and other kinds of feedback; 
          and students may make additional edits to respond to the tutor's feedback. 
          
          Respond in a JSON format in the shape of ProgressReportResponse from the TypeScript types below

          // Types of assessment for a report, currently 'strength' and 'practiceArea', but designed to include more types in the future
          type ProgressFocusAreas = 'strength' | 'practiceArea'

          // Types of details for an assessment for a report, currently 'recommendation' and 'reason', scalable for additional types like 'prediction', etc.
          type ProgressInfoTypes = 'recommendation' | 'reason'

          type ProgressReportDetail = {
            // Content elaborating on the focusArea and infoType for a concept, specific to the student's performance or needs
            content: string
            // Determines if the associated concept is categorized as a 'strength' or 'practiceArea', with flexibility for future assessment types
            focusArea: ProgressFocusAreas
            // Specifies the nature of the assessment detail, such as a 'recommendation' for improvement or a 'reason' explaining the assessment
            // If a 'practiceArea' is given, provide a recommendation for improvement
            infoType: ProgressInfoTypes
          }

          type ProgressReportSummary = {
            // Consolidated summary reflecting the overarching findings or conclusions from the assessment of all concepts
            summary: string
            // Aggregated grade representing the overall performance level in the subject, on a scale of 65-100
            overallGrade: number
            // Compiled list of detailed assessments, each correlating to specific aspects of the concepts assessed
            details: ProgressReportDetail[]
          }

          type ProgressReportConcept = {
            // Identifier for the specific concept under assessment
            name: string
            // Concise description of the concept, providing context or background relevant to the assessment
            description: string
            // Numerical grade assigned to the concept, indicative of the student's performance or understanding, on a scale of 65-100
            grade: number
            // Collection of detailed assessments for the concept, encompassing various types and aspects of assessment
            details: ProgressReportDetail[]
          }

          type ProgressReportResponse = {
            // The summary section encapsulating an overall assessment and grade for the subject; an empty object indicates a summary couldn't be produced
            summary: ProgressReportSummary
            // Array of concepts (topics), each with detailed assessments; an empty array indicates no concepts to analyze
            concepts: ProgressReportConcept[]
          }

          The comments denoted by "//" provide guidance on what should be filled into each property.`,
      },
      {
        role: 'user',
        content: botPrompt,
      },
    ],
  })
  const response = completion.choices[0].message.content
  logger.info(
    `User: ${userId} received ProgressReport completion ${completion} with response ${response}`
  )
  return response ? JSON.parse(response) : { summary: {}, concepts: [] }
}
