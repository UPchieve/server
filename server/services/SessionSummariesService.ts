import { Uuid } from '../models/pgUtils'
import * as SessionRepo from '../models/Session/queries'
import * as ProgressReportsService from './ProgressReportsService'
import { getSubjectAndTopic } from '../models/Subjects'
import { USER_ROLES, USER_ROLES_TYPE } from '../constants'
import * as LangfuseService from './LangfuseService'
import {
  OpenAiResponseType,
  invokeModel,
  MODEL_ID as OPENAI_MODELID,
} from './OpenAIService'
import logger from '../logger'
import * as SessionSummariesRepo from '../models/SessionSummaries/queries'
import QueueService from './QueueService'
import { Jobs } from '../worker/jobs'
import { getActiveClassesForStudent } from './StudentService'
import { LangfusePromptNameEnum } from './LangfuseService'
import { TextPromptClient } from 'langfuse-core'
import { UserRole } from '../models/User'

const responseInstructions =
  'Use whatever information is available to generate your summary. Respond in exactly one sentence that can be stored in a Postgres text column. If you are unable to generate a helpful or accurate summary based on the information provided, respond with nothing. Return a truly empty string (not in quotes, just no characters at all).'

const SYSTEM_PROMPTS_FOR_USER_TYPES: Partial<Record<UserRole, string>> = {
  [USER_ROLES.TEACHER]: `You are an assistant helping summarize high school tutoring sessions for teachers.

    Based on the session transcript and, when available, collaborative editor content and image text,
    generate a single sentence summary that would be useful for the student's
    teacher to understand what happened in the session.

    The format of the transcripts is:

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
    However, image text may not always be present.

    ${responseInstructions}`,
}

const LANGFUSE_USER_TYPE_TO_SUMMARY_PROMPT: Partial<
  Record<UserRole, LangfusePromptNameEnum>
> = {
  [USER_ROLES.TEACHER]: LangfusePromptNameEnum.SESSION_SUMMARY_TEACHER_PROMPT,
}

async function getPromptDataForUserType(userType: UserRole): Promise<
  | {
      isFallback: boolean
      prompt: string
      version: string
      promptObject?: TextPromptClient
    }
  | undefined
> {
  const promptName = LANGFUSE_USER_TYPE_TO_SUMMARY_PROMPT[userType]
  const promptFromLangfuse = promptName
    ? await LangfuseService.getPrompt(promptName, undefined, 5000)
    : undefined
  const isFallback = !promptFromLangfuse
  const prompt = isFallback
    ? SYSTEM_PROMPTS_FOR_USER_TYPES[userType]
    : (promptFromLangfuse! as TextPromptClient).prompt
  if (!prompt) {
    logger.error(`No prompt defined for user type: ${userType}`)
    return
  }

  return {
    isFallback,
    prompt,
    version: isFallback
      ? 'FALLBACK'
      : `${promptFromLangfuse!.name}-${promptFromLangfuse!.version}`,
    ...(!isFallback && {
      promptObject: promptFromLangfuse as TextPromptClient,
    }),
  }
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

  const botPrompt = await ProgressReportsService.formatSessionsForBotPrompt([
    sessionWithMessages,
  ])

  for (const userType of Object.keys(
    LANGFUSE_USER_TYPE_TO_SUMMARY_PROMPT
  ) as USER_ROLES_TYPE[]) {
    const promptData = await getPromptDataForUserType(userType)
    if (!promptData) continue
    const summary = await generateSessionSummary(promptData.prompt, botPrompt, {
      sessionId,
      userType,
    })

    // Sometimes the LLM will return a summary like "''" or '""'. We'll check for characters
    // to avoid storing empty summaries
    if (summary.response) {
      if (!/[a-zA-Z0-9]/.test(summary.response.trim())) continue
      await SessionSummariesRepo.addSessionSummary(
        session.id,
        summary.response,
        userType,
        summary.traceId
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

const LF_TRACE_NAME = 'teacherSessionSummary'
const LF_GENERATION_NAME = 'getTeacherSessionSummary'

export async function generateSessionSummary(
  systemPrompt: string,
  botPrompt: string,
  metadata: {
    sessionId: Uuid
    userType: USER_ROLES_TYPE
  }
): Promise<{ response: string | null; traceId: string }> {
  const t = LangfuseService.getClient().trace({
    name: LF_TRACE_NAME,
    metadata,
  })

  const gen = t.generation({
    name: LF_GENERATION_NAME,
    model: OPENAI_MODELID,
    input: botPrompt,
  })
  const result = await invokeModel({
    prompt: systemPrompt,
    userMessage: botPrompt,
    responseType: OpenAiResponseType.TEXT,
  })
  gen.end({ output: result })

  const response = {
    response: result.results as string,
    traceId: t.traceId,
  }
  logger.info(
    `Session: ${metadata.sessionId} received session summary completion ${result.results} for userType ${metadata.userType} with response ${response}`
  )
  return response
}

export async function queueGenerateSessionSummaryForSession(sessionId: Uuid) {
  const session = await SessionRepo.getSessionById(sessionId)
  if (!session.volunteerId) return
  const classes = await getActiveClassesForStudent(session.studentId)
  // Summaries are currently generated only for teachers,
  // so the student must be enrolled in at least one class
  if (classes.length) {
    try {
      await QueueService.add(Jobs.GenerateSessionSummary, { sessionId })
    } catch (error) {
      logger.error(
        `Failed to queue ${Jobs.GenerateSessionSummary} for session ${sessionId}`
      )
    }
  }
}
