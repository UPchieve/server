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
  ProgressReportSummaryRow,
  ProgressReportConceptRow,
  ProgressReportFocusAreas,
  ProgressReportInfoTypes,
  getProgressReportSummariesForMany,
  getProgressReportConceptsByReportId,
  getProgressReportInfoBySessionId,
  getProgressReportByReportId,
  ProgressReportInfo,
  getProgressReportSessionsForSubjectByPagination,
  getLatestProgressReportIdBySubject,
  updateProgressReportsReadAtByReportIds,
  getUnreadProgressReportOverviewSubjectsByUserId,
  getAllProgressReportIdsByUserIdAndSubject,
} from '../../models/ProgressReports'
import {
  UserSessionsWithMessages,
  getUserSessionsByUserId,
  getMessagesForFrontend,
  MessageForFrontend,
  UserSessionsFilter,
} from '../../models/Session'
import { captureEvent } from '../AnalyticsService'
import { EVENTS } from '../../constants'
import moment from 'moment'
import {
  ProgressReport,
  ProgressReportDetail,
  ProgressReportSummary,
  ProgressReportConcept,
} from './types'
import { openai } from '../BotsService'
import QueueService from '../QueueService'
import { Jobs } from '../../worker/jobs'
export * from './types'
import { ProgressReportNotFoundError } from '../Errors'

function formatTranscriptMessage(
  message: MessageForFrontend,
  userType: string
): string {
  return `${moment(message.createdAt).format('hh:mm:ss')} ${userType}: ${
    message.contents
  }\n`
}

function formatTranscriptAndEditor(session: UserSessionsWithMessages): string {
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

function formatSessionsForBotPrompt(
  sessions: UserSessionsWithMessages[]
): string {
  return sessions.map(formatTranscriptAndEditor).join('\n')
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

export async function generateProgressReportForUser(
  userId: Ulid,
  filter: UserSessionsFilter
): Promise<ProgressReport> {
  const sessions = await getSessionsToAnalyzeForProgressReport(userId, filter)
  const botPrompt = formatSessionsForBotPrompt(sessions)
  const botReport = await generateProgressReport(userId, botPrompt)
  captureEvent(userId, EVENTS.PROGRESS_REPORT_ANALYSIS_COMPLETED, {
    response: botReport,
    debug: botReport,
  })
  const sessionIds = sessions.map(s => s.id)
  const reportId = await saveProgressReport(userId, sessionIds, botReport)
  if (!reportId)
    throw new Error(
      `Failed to save a progress report for sessions ${sessionIds.join(
        ','
      )} for user ${userId}`
    )
  const report = await getProgressReportForReport(reportId)
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

export async function queueGenerateProgressReportForUser(
  sessionId: Ulid
): Promise<void> {
  await QueueService.add(
    Jobs.GenerateProgressReport,
    { sessionId },
    { removeOnComplete: true, removeOnFail: true }
  )
}

function transformProgressReportSummaryRows(
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
        reportId: row.reportId,
        reportReadAt: row.reportReadAt,
      }
    }

    const detail: ProgressReportDetail = {
      id: row.detailId,
      content: row.content,
      focusArea: row.focusArea as ProgressReportFocusAreas,
      infoType: row.infoType as ProgressReportInfoTypes,
    }

    summaries[row.id].details.push(detail)
  }

  return Object.values(summaries)
}

function transformProgressReportConceptRows(
  rows: ProgressReportConceptRow[]
): ProgressReportConcept[] {
  const concepts: Record<Ulid, ProgressReportConcept> = {}

  for (const row of rows) {
    if (!concepts[row.id]) {
      concepts[row.id] = {
        id: row.id,
        name: row.name,
        description: row.description,
        grade: row.grade,
        details: [],
        createdAt: row.createdAt,
        reportId: row.reportId,
        reportReadAt: row.reportReadAt,
      }
    }

    const detail: ProgressReportDetail = {
      id: row.detailId,
      content: row.content,
      focusArea: row.focusArea as ProgressReportFocusAreas,
      infoType: row.infoType as ProgressReportInfoTypes,
    }

    concepts[row.id].details.push(detail)
  }

  return Object.values(concepts)
}

export async function getProgressReportSummary(
  reportId: Ulid,
  tc?: TransactionClient
): Promise<ProgressReportSummary> {
  const summaryRows = await getProgressReportSummariesForMany([reportId], tc)
  const summaries = transformProgressReportSummaryRows(summaryRows)
  if (!summaries.length)
    throw new Error(`No summary found for report ${reportId}`)
  return summaries[0]
}

export async function getProgressReportConcepts(
  reportId: Ulid,
  tc?: TransactionClient
): Promise<ProgressReportConcept[]> {
  const conceptRows = await getProgressReportConceptsByReportId(reportId, tc)
  const concepts = transformProgressReportConceptRows(conceptRows)
  if (!concepts.length)
    throw new Error(`No concepts found for report ${reportId}`)
  return concepts
}

export async function getProgressReportSummaryAndConcepts(
  reportId: Ulid,
  tc?: TransactionClient
): Promise<Pick<ProgressReport, 'summary' | 'concepts'>> {
  const summary = await getProgressReportSummary(reportId, tc)
  const concepts = await getProgressReportConcepts(reportId, tc)
  return { summary, concepts }
}

export async function getProgressReportDataAndDetails(
  getReportData: () => Promise<ProgressReportInfo | undefined>,
  tc: TransactionClient
): Promise<ProgressReport> {
  const reportData = await getReportData()
  if (!reportData?.id) {
    throw new ProgressReportNotFoundError('No report found')
  }
  const summaryAndConcepts = await getProgressReportSummaryAndConcepts(
    reportData.id,
    tc
  )
  return { ...reportData, ...summaryAndConcepts }
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

// TODO: Use cursor pagination
export async function getProgressReportsForSubjectPaginated(
  userId: Ulid,
  subject: string,
  page: number
) {
  const limit = 5
  const offset = (page - 1) * limit
  const data = {
    subject,
    analysisType: 'single' as ProgressReportAnalysisTypes,
    limit,
    offset,
  }
  const sessions = await getProgressReportSessionsForSubjectByPagination(
    userId,
    data
  )

  const isLastPage = sessions.length < limit
  return { sessions, page, isLastPage }
}

export async function getProgressReportSummaries(
  reportIds: Ulid[],
  tc?: TransactionClient
): Promise<ProgressReportSummary[]> {
  const summaryRows = await getProgressReportSummariesForMany(reportIds, tc)
  const summaries = transformProgressReportSummaryRows(summaryRows)
  return summaries
}

export async function getProgressReportSummariesBySubject(
  userId: Ulid,
  subject: string
): Promise<ProgressReportSummary[]> {
  const data = await runInTransaction(async (tc: TransactionClient) => {
    const reportIds = await getAllProgressReportIdsByUserIdAndSubject(
      userId,
      subject,
      'group',
      tc
    )
    const summaries = await getProgressReportSummaries(reportIds, tc)
    return summaries
  })
  return data
}

export async function getLatestProgressReportSummaryBySubject(
  userId: Ulid,
  subject: string
): Promise<ProgressReport> {
  return await runInTransaction(async (tc: TransactionClient) => {
    return getProgressReportDataAndDetails(
      () => getLatestProgressReportIdBySubject(userId, subject, 'group', tc),
      tc
    )
  })
}

export async function readProgressReportsByIds(
  reportIds: Ulid[]
): Promise<void> {
  await updateProgressReportsReadAtByReportIds(reportIds)
}

export async function getUnreadProgressReportOverviewSubjects(
  userId: Ulid
): Promise<string[]> {
  return await getUnreadProgressReportOverviewSubjectsByUserId(userId)
}
