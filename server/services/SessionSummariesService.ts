import { Uuid } from '../models/pgUtils'
import * as SessionRepo from '../models/Session/queries'
import * as ProgressReportsService from './ProgressReportsService'
import { getSubjectAndTopic } from '../models/Subjects'
import { TOOL_TYPES, USER_ROLES, USER_ROLES_TYPE } from '../constants'
import * as LangfuseService from './LangfuseService'
import { openai } from './BotsService'
import logger from '../logger'
import * as SessionSummariesRepo from '../models/SessionSummaries/queries'
import QueueService from './QueueService'
import { Jobs } from '../worker/jobs'
import { getActiveClassesForStudent } from './StudentService'

const responseInstructions =
  'Respond in exactly one sentence that can be stored in a Postgres text column.'

const SYSTEM_PROMPTS_FOR_USER_TYPES = [
  {
    userType: USER_ROLES.TEACHER,
    systemPrompt: `You are an assistant helping summarize high school tutoring sessions for teachers.
    
    Based on the session transcript and collaborative editor content below, 
    generate a single sentence summary that would be useful for the student's 
    teacher to understand what happened in the session.

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

    ${responseInstructions}`,
  },
]

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

  const botPrompt = await ProgressReportsService.formatSessionsForBotPrompt(
    [sessionWithMessages],
    subjectData.toolType as TOOL_TYPES
  )

  for (const { userType, systemPrompt } of SYSTEM_PROMPTS_FOR_USER_TYPES) {
    const summary = await generateSessionSummary(
      session.studentId,
      systemPrompt,
      botPrompt
    )

    if (!summary) continue
    await SessionSummariesRepo.addSessionSummary(session.id, summary, userType)
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
const MODEL = 'gpt-4o'
export async function generateSessionSummary(
  userId: Uuid,
  systemPrompt: string,
  botPrompt: string
): Promise<string> {
  const t = LangfuseService.getClient().trace({
    name: LF_TRACE_NAME,
    userId,
  })

  const gen = t.generation({
    name: LF_GENERATION_NAME,
    model: MODEL,
    input: botPrompt,
  })
  const completion = await openai.chat.completions.create({
    model: MODEL,
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
  gen.end({ output: completion })

  const response = completion.choices[0].message.content
  logger.info(
    `User: ${userId} received session summary completion ${completion} with response ${response}`
  )
  return response ?? ''
}

export async function queueGenerateSessionSummaryForSession(sessionId: Uuid) {
  const session = await SessionRepo.getSessionById(sessionId)
  const classes = await getActiveClassesForStudent(session.studentId)
  // Summaries are currently generated only for teachers,
  // so the student must be enrolled in at least one class
  if (classes.length) {
    try {
      await QueueService.add(
        Jobs.GenerateSessionSummary,
        { sessionId },
        { removeOnComplete: true, removeOnFail: true }
      )
    } catch (error) {
      logger.error(
        `Failed to queue ${Jobs.GenerateSessionSummary} for session ${sessionId}`
      )
    }
  }
}
