import { Uuid } from '../models/pgUtils'
import * as SessionRepo from '../models/Session/queries'
import * as ProgressReportsService from './ProgressReportsService'
import { getSubjectAndTopic } from '../models/Subjects'
import { TOOL_TYPES, USER_ROLES, USER_ROLES_TYPE } from '../constants'
import { invokeModel } from './AwsBedrockService'
import * as PromptService from './PromptService'
import logger from '../logger'
import * as SessionSummariesRepo from '../models/SessionSummaries/queries'
import QueueService from './QueueService'
import { Jobs } from '../worker/jobs'
import { getActiveClassesForStudent } from './StudentService'
import { UserRole } from '../models/User'
import { isStudentSessionSummaryEnabled } from './FeatureFlagService'
import config from '../config'
import {
  runWithModelObservation,
  runWithTrace,
  Trace,
} from './AiObservabilityService'

const LANGFUSE_ROLE_PROMPTS: Partial<
  Record<UserRole, PromptService.PromptName>
> = {
  [USER_ROLES.TEACHER]: PromptService.PromptName.SESSION_SUMMARY_TEACHER_PROMPT,
  [USER_ROLES.STUDENT]: PromptService.PromptName.SESSION_SUMMARY_STUDENT_PROMPT,
}
const LANGFUSE_TOOL_PROMPTS: Record<TOOL_TYPES, PromptService.PromptName> = {
  [TOOL_TYPES.DOCUMENT_EDITOR]:
    PromptService.PromptName.DOCUMENT_EDITOR_TOOL_PROMPT,
  [TOOL_TYPES.WHITEBOARD]: PromptService.PromptName.WHITEBOARD_TOOL_PROMPT,
}

async function getRolePrompt(userType: USER_ROLES_TYPE) {
  const promptName = LANGFUSE_ROLE_PROMPTS[userType]
  if (!promptName) return
  return PromptService.getPromptWithFallback(promptName)
}

async function getToolPrompt(toolType: TOOL_TYPES) {
  const promptName = LANGFUSE_TOOL_PROMPTS[toolType]
  if (!promptName) return
  return PromptService.getPromptWithFallback(promptName)
}

function createSystemPrompt(rolePrompt: string, toolPrompt: string) {
  return `${rolePrompt.trim()}\n\n${toolPrompt.trim()}`
}

export async function generateSessionSummaryForSession(sessionId: Uuid) {
  const session = await SessionRepo.getSessionById(sessionId)
  if (!session.volunteerId) return

  const subjectData = await getSubjectAndTopic(session.subject)
  if (!subjectData)
    throw new Error(
      `generateSessionSummaryForSession: No subject named ${session.subject} found`
    )

  const messages = await SessionRepo.getMessagesForFrontend(session.id)
  const sessionWithMessages = {
    ...session,
    subjectName: subjectData.subjectName,
    topicName: subjectData.topicName,
    messages,
  }

  const userPrompt = await ProgressReportsService.formatSessionsForBotPrompt([
    sessionWithMessages,
  ])
  const studentClasses = await getActiveClassesForStudent(session.studentId)
  const isStudentInAClass = !!studentClasses.length

  for (const userType of Object.keys(
    LANGFUSE_ROLE_PROMPTS
  ) as USER_ROLES_TYPE[]) {
    // Skip generating a session summary for the teacher if the
    // student is not in a class
    if (userType === USER_ROLES.TEACHER && !isStudentInAClass) continue

    const isSessionSummaryEnabledForStudent =
      await isStudentSessionSummaryEnabled(session.studentId)
    if (userType === USER_ROLES.STUDENT && !isSessionSummaryEnabledForStudent)
      continue

    const { result: summary, traceId } = await runWithTrace(
      async (trace) => {
        const rolePromptData = await getRolePrompt(userType)
        if (!rolePromptData) return
        const toolPromptData = await getToolPrompt(
          session.toolType as TOOL_TYPES
        )
        if (!toolPromptData) return

        const systemPrompt = createSystemPrompt(
          rolePromptData.prompt,
          toolPromptData.prompt
        )
        return await generateSessionSummary(
          systemPrompt,
          userPrompt,
          {
            sessionId,
            userType,
          },
          trace
        )
      },
      {
        name: 'sessionSummary',
        sessionId: session.id,
        metadata: {
          sessionId: session.id,
          userType,
        },
      }
    )
    // Sometimes the LLM will return a summary like "''" or '""'. We'll check for characters
    // to avoid storing empty summaries
    if (summary) {
      if (!/[a-zA-Z0-9]/.test(summary.trim())) continue
      await SessionSummariesRepo.addSessionSummary(
        session.id,
        summary,
        userType,
        traceId
      )
    }
  }
}

async function generateSessionSummary(
  systemPrompt: string,
  userPrompt: string,
  metadata: {
    sessionId: Uuid
    userType: USER_ROLES_TYPE
  },
  trace: Trace
) {
  const modelId = config.awsBedrockSonnet4Id
  const response = await runWithModelObservation<string>(
    () => {
      return invokeModel({
        modelId,
        prompt: systemPrompt,
        text: userPrompt,
      })
    },
    {
      trace,
      name: 'generateSessionSummary',
      model: modelId,
      input: userPrompt,
      metadata,
    }
  )

  logger.info(
    {
      sessionId: metadata.sessionId,
      userType: metadata.userType,
      response,
    },
    `Received session summary completion`
  )
  return response
}

export async function getSessionSummaryByUserType(
  sessionId: Uuid,
  userType: USER_ROLES_TYPE
) {
  const sessionSummary = await SessionSummariesRepo.getSessionSummaryByUserType(
    sessionId,
    userType
  )
  return sessionSummary
}

export async function queueGenerateSessionSummaryForSession(sessionId: Uuid) {
  const session = await SessionRepo.getSessionById(sessionId)
  if (!session.volunteerId) return
  const classes = await getActiveClassesForStudent(session.studentId)
  const isEnabledForStudent = await isStudentSessionSummaryEnabled(
    session.studentId
  )
  // Queue a session summary generation when the student has an active class (teacher summary)
  // or if the flag is enabled for the student to see their own session summary
  if (classes.length || isEnabledForStudent) {
    try {
      await QueueService.add(Jobs.GenerateSessionSummary, { sessionId })
    } catch (error) {
      logger.error(
        `Failed to queue ${Jobs.GenerateSessionSummary} for session ${sessionId}`
      )
    }
  }
}
