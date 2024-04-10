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
  getAllProgressReportIdsByUserIdAndSubject,
  getLatestProgressReportOverviewSubjectByUserId,
  getProgressReportOverviewUnreadStatsByUserId,
  getActiveSubjectPromptBySubjectName,
} from '../../models/ProgressReports'
import {
  UserSessionsWithMessages,
  getUserSessionsByUserId,
  getMessagesForFrontend,
  MessageForFrontend,
  UserSessionsFilter,
  getSessionById,
} from '../../models/Session'
import { captureEvent } from '../AnalyticsService'
import { EVENTS, TOOL_TYPES } from '../../constants'
import moment from 'moment'
import {
  ProgressReport,
  ProgressReportDetail,
  ProgressReportSummary,
  ProgressReportConcept,
  ProgressReportSessionFilter,
  ProgressReportOverviewSubjectStat,
  ProgressReportPromptTemplateVariables,
  SaveProgressReportOptions,
} from './types'
import { openai } from '../BotsService'
import QueueService from '../QueueService'
import { Jobs } from '../../worker/jobs'
export * from './types'
import { ProgressReportNotFoundError } from '../Errors'
import { getProgressReportsFeatureFlag } from '../FeatureFlagService'
import { PROGRESS_REPORT_JSON_INSTRUCTIONS } from '../../constants'
import { Student, getStudentProfileByUserId } from '../../models/Student'
import { SubjectAndTopic, getSubjectAndTopic } from '../../models/Subjects'

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

function replaceSubjectPromptVariables(
  template: string,
  variables: ProgressReportPromptTemplateVariables
): string {
  return template.replace(/{{(\w+)}}/g, (match, key) => {
    if (key in variables) {
      const value =
        variables[key as keyof ProgressReportPromptTemplateVariables]
      return String(value)
    }
    return match
  })
}

function buildVariablesForTemplateReplacement(
  student: Partial<Student>,
  subjectDisplayName: string
): ProgressReportPromptTemplateVariables {
  return {
    responseInstructions: PROGRESS_REPORT_JSON_INSTRUCTIONS,
    subjectDisplayName,
    gradeLevel: student.gradeLevel,
  }
}

async function getActiveSubjectPrompt(
  subject: string,
  variables: ProgressReportPromptTemplateVariables
) {
  const subjectPrompt = await getActiveSubjectPromptBySubjectName(subject)
  return {
    ...subjectPrompt,
    prompt: replaceSubjectPromptVariables(subjectPrompt.prompt, variables),
  }
}

export async function getActiveSubjectPromptWithTemplateReplacement(
  userId: Ulid,
  subject: SubjectAndTopic
) {
  const studentProfile = await getStudentProfileByUserId(userId)
  const variables = buildVariablesForTemplateReplacement(
    studentProfile,
    subject.subjectDisplayName
  )
  return await getActiveSubjectPrompt(subject.subjectName, variables)
}

export async function hasActiveSubjectPrompt(
  subject: string
): Promise<boolean> {
  try {
    const activePrompt = await getActiveSubjectPromptBySubjectName(subject)
    return !!activePrompt.prompt
  } catch {
    return false
  }
}

function formatSessionsForBotPrompt(
  sessions: UserSessionsWithMessages[],
  toolType: TOOL_TYPES
): string {
  if (toolType === TOOL_TYPES.DOCUMENT_EDITOR)
    return sessions.map(formatTranscriptAndEditor).join('\n')
  else return ''
}

export async function saveProgressReport({
  userId,
  sessionIds,
  data,
  analysisType,
  promptId,
}: SaveProgressReportOptions) {
  let reportId: Ulid = ''
  try {
    if (!data.summary || !Object.keys(data.summary).length)
      throw new Error(
        `No progress report summary created for user ${userId} on session ${sessionIds.join(
          ','
        )}`
      )
    if (!data.concepts || !data.concepts.length)
      throw new Error(
        `No progress report concepts created for user ${userId} on session ${sessionIds.join(
          ','
        )}`
      )

    reportId = await insertProgressReport(userId, 'pending', promptId)

    await runInTransaction(async (tc: TransactionClient) => {
      for (const sessionId of sessionIds) {
        await insertProgressReportSession(reportId, sessionId, analysisType, tc)
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
  filter: ProgressReportSessionFilter
): Promise<ProgressReport> {
  const subjectData = await getSubjectAndTopic(filter.subject)
  if (!subjectData)
    throw new Error(
      `generateProgressReportForUser: No subject named ${filter.subject} found`
    )
  const sessions = await getSessionsToAnalyzeForProgressReport(userId, filter)
  const botPrompt = formatSessionsForBotPrompt(
    sessions,
    subjectData.toolType as TOOL_TYPES
  )
  const subjectPrompt = await getActiveSubjectPromptWithTemplateReplacement(
    userId,
    subjectData
  )
  const botReport = await generateProgressReport(
    userId,
    subjectPrompt.prompt,
    botPrompt
  )
  captureEvent(userId, EVENTS.PROGRESS_REPORT_ANALYSIS_COMPLETED, {
    response: botReport,
    debug: botReport,
  })
  const sessionIds = sessions.map(s => s.id)
  const reportId = await saveProgressReport({
    userId,
    sessionIds,
    data: botReport,
    analysisType: filter.analysisType,
    promptId: subjectPrompt.id,
  })
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
  systemPrompt: string,
  botPrompt: string
): Promise<ProgressReport> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4-1106-preview',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: systemPrompt,
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
  const session = await getSessionById(sessionId)
  const isSubjectPromptActive = await hasActiveSubjectPrompt(session.subject)
  const isProgressReportsActive = await getProgressReportsFeatureFlag(
    session.studentId
  )
  if (!isSubjectPromptActive || !isProgressReportsActive) return
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
        sessionCreatedAt: row.sessionCreatedAt,
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

export async function getProgressReportOverviewSubjectStats(
  userId: Ulid
): Promise<ProgressReportOverviewSubjectStat[]> {
  const stats = []
  const unreadStats = await getProgressReportOverviewUnreadStatsByUserId(userId)
  for (const unread of unreadStats) {
    const report = await getLatestProgressReportIdBySubject(
      userId,
      unread.subject,
      'group'
    )
    if (!report) continue
    const summary = await getProgressReportSummary(report.id)
    const data: ProgressReportOverviewSubjectStat = {
      ...unread,
      overallGrade: summary.overallGrade,
      latestReportCreatedAt: report.createdAt,
    }
    stats.push(data)
  }
  return stats.sort((a, b) =>
    b.latestReportCreatedAt > a.latestReportCreatedAt ? 1 : -1
  )
}

export async function getLatestProgressReportOverviewSubject(
  userId: Ulid
): Promise<string | undefined> {
  return await getLatestProgressReportOverviewSubjectByUserId(userId)
}
