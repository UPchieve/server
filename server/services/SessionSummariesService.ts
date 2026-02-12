import { Uuid } from '../models/pgUtils'
import * as SessionRepo from '../models/Session/queries'
import * as ProgressReportsService from './ProgressReportsService'
import { getSubjectAndTopic } from '../models/Subjects'
import { TOOL_TYPES, USER_ROLES, USER_ROLES_TYPE } from '../constants'
import * as LangfuseService from './LangfuseService'
import { invokeModel } from './AwsBedrockService'
import logger from '../logger'
import * as SessionSummariesRepo from '../models/SessionSummaries/queries'
import QueueService from './QueueService'
import { Jobs } from '../worker/jobs'
import { getActiveClassesForStudent } from './StudentService'
import { LangfusePromptNameEnum } from './LangfuseService'
import { UserRole } from '../models/User'
import { isStudentSessionSummaryEnabled } from './FeatureFlagService'
import config from '../config'
import { runWithGeneration } from '../clients/ai-observability'

const responseInstructions =
  'Use whatever information is available to generate your summary. Respond in exactly one sentence that can be stored in a Postgres text column. If you are unable to generate a helpful or accurate summary based on the information provided, respond with nothing. Return a truly empty string (not in quotes, just no characters at all).'

const ROLE_PROMPT_FALLBACKS: Partial<Record<UserRole, string>> = {
  [USER_ROLES.TEACHER]: `You are an assistant helping summarize high school tutoring sessions for teachers.

    Based on the session transcript and, when available, collaborative editor content and image text or the content of the whiteboard,
    generate a single sentence summary that would be useful for the student's teacher to understand what happened in the session.

    ${responseInstructions}`,
  [USER_ROLES.STUDENT]: `You are an assistant helping summarize a high school tutoring session for a student.

    Based on the session transcript and, when available, collaborative editor content and image text or the content of the whiteboard,
    generate a single sentence summary that would be useful for the student.

    Phrase the summary as if you are directly speaking to the student.

    ${responseInstructions}`,
}

const LANGFUSE_ROLE_PROMPTS: Partial<Record<UserRole, LangfusePromptNameEnum>> =
  {
    [USER_ROLES.TEACHER]: LangfusePromptNameEnum.SESSION_SUMMARY_TEACHER_PROMPT,
    [USER_ROLES.STUDENT]: LangfusePromptNameEnum.SESSION_SUMMARY_STUDENT_PROMPT,
  }

const LANGFUSE_TOOL_PROMPTS: Record<TOOL_TYPES, LangfusePromptNameEnum> = {
  [TOOL_TYPES.DOCUMENT_EDITOR]:
    LangfusePromptNameEnum.DOCUMENT_EDITOR_TOOL_PROMPT,
  [TOOL_TYPES.WHITEBOARD]: LangfusePromptNameEnum.WHITEBOARD_TOOL_PROMPT,
}

function getToolPromptFallback(toolType: TOOL_TYPES) {
  if (toolType === TOOL_TYPES.DOCUMENT_EDITOR) {
    return `

    Use only what is supported by the transcript, the editor content, and image text (if available).
    Do not assume understanding beyond what is shown.

    The format of the session data is:

    Session:
    [hh:mm:ss] Tutor: {message}
    [hh:mm:ss] Student: {message}

    Editor:
    {editorContent}

    Image text:
    {imageText}

    The editor content is a JSON representation of a Quill Editor document in Quill's Delta format.
    The Delta format is a series of operations applied to the document.
    Both the student and the tutor can commit operations. You will not know the author of an operation,
    although you can assume that students insert the early original content into the document;
    tutors may make edits intended to represent annotations, corrections, examples, and other kinds of feedback;
    and students may make additional edits to respond to the tutor's feedback.

    The image text represents text extracted from any images uploaded to the editor during the session.
    It may provide helpful context about diagrams, screenshots, or handwritten work that was shared.
    However, image text may not always be present.`.trim()
  }
  return `

    Use only what is supported by the transcript and the whiteboard content. Do not assume understanding beyond what is shown.

    The format of the session data is:

    Session:
    [hh:mm:ss] Tutor: {message}
    [hh:mm:ss] Student: {message}

    Editor:
    {editorText}`.trim()
}

async function getRolePrompt(userType: USER_ROLES_TYPE) {
  const promptName = LANGFUSE_ROLE_PROMPTS[userType]
  const fallback = ROLE_PROMPT_FALLBACKS[userType]
  if (!promptName || !fallback) return
  return LangfuseService.getPromptWithFallback(promptName, fallback)
}

async function getToolPrompt(toolType: TOOL_TYPES) {
  const promptName = LANGFUSE_TOOL_PROMPTS[toolType]
  const fallback = getToolPromptFallback(toolType)
  if (!promptName || !fallback) return
  return LangfuseService.getPromptWithFallback(promptName, fallback)
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

    const rolePromptData = await getRolePrompt(userType)
    if (!rolePromptData) continue

    const toolPromptData = await getToolPrompt(session.toolType as TOOL_TYPES)
    if (!toolPromptData) continue

    const systemPrompt = createSystemPrompt(
      rolePromptData.prompt,
      toolPromptData.prompt
    )
    const { result: summary, traceId } = await generateSessionSummary(
      systemPrompt,
      userPrompt,
      {
        sessionId,
        userType,
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

export async function generateSessionSummary(
  systemPrompt: string,
  userPrompt: string,
  metadata: {
    sessionId: Uuid
    userType: USER_ROLES_TYPE
  }
) {
  const modelId = config.awsBedrockSonnet4Id
  const response = await runWithGeneration<string>(
    () => {
      return invokeModel({
        modelId,
        prompt: systemPrompt,
        text: userPrompt,
      })
    },
    {
      traceName: 'sessionSummary',
      generationName: 'generateSessionSummary',
      model: modelId,
      metadata,
    }
  )

  logger.info(
    `Session: ${metadata.sessionId} received session summary completion ${response.result} for userType ${metadata.userType} with response ${response}`
  )
  return response
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
