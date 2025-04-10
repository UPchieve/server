import { Ulid } from '../models/pgUtils'
import * as SessionRepo from '../models/Session/queries'
import * as ProgressReportsService from './ProgressReportsService'
import { SubjectAndTopic, getSubjectAndTopic } from '../models/Subjects'
import { TOOL_TYPES } from '../constants'
import * as LangfuseService from './LangfuseService'
import { openai } from './BotsService'
import logger, { logError } from '../logger'

export async function generateTeacherSessionSummary(
  sessionId: Ulid
){
  const session = await SessionRepo.getSessionById(sessionId)
  if(!session.volunteerId) return
  const subjectData = await getSubjectAndTopic(session.subject)
  if (!subjectData)
    throw new Error(
      `generateProgressReportForUser: No subject named ${session.subject} found`
    )

  const messages = await SessionRepo.getMessagesForFrontend(session.id)

  const sessionWithMessages = { ...session, subjectName: subjectData.subjectName, topicName: subjectData.topicName, messages}

  const botPrompt = await ProgressReportsService.formatSessionsForBotPrompt(
      [sessionWithMessages],
      subjectData.toolType as TOOL_TYPES
    )

  const systemPrompt = `You are generating a one sentence summary of an online tutoring session between a student and a tutor for the student's teacher to view.`

  const summary = await generateSessionSummary(session.studentId, systemPrompt, botPrompt)

  //save summary
  //get summary
  //return summary

}

const LF_TRACE_NAME = 'teacherSessionSummary'
const LF_GENERATION_NAME = 'getTeacherSessionSummary'
const MODEL = 'gpt-4o'
export async function generateSessionSummary(
  userId: Ulid,
  systemPrompt: string,
  botPrompt: string
): Promise<string | null> {
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
  gen.end({ output: completion })

  const response = completion.choices[0].message.content
  logger.info(
    `User: ${userId} received session summary completion ${completion} with response ${response}`
  )
  return response ? JSON.parse(response) : null
}