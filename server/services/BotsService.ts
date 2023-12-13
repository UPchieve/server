import OpenAI from 'openai'
import { Ulid } from '../models/pgUtils'
import {
  getMessagesForFrontend,
  getUserSessionsByUserId,
  UserSessionsWithMessages,
} from '../models/Session'
import config from '../config'
import { captureEvent } from './AnalyticsService'
import { EVENTS } from '../constants'
import logger, { logError } from '../logger'
import { formatScorecasterSessionsToBotPrompt } from '../utils/bots-utils'

export const openai = new OpenAI({
  apiKey: config.openAIApiKey,
})

export type ScorecasterTopics = {
  topic: string
  description: string
  grade: number
  type: 'strength' | 'practiceArea'
  reasons: string[]
  recommendations: string[]
}

export type ScorecasterSummary = {
  summary: string
  recommendations: string
  strengths: string
  strengthsGrade: number
  practiceAreas: string
  practiceAreasGrade: number
}

export type ScorecasterOverview = {
  summary: ScorecasterSummary
  grade: number
}

export type ScorecasterResponse = {
  overview: ScorecasterOverview
  topics: ScorecasterTopics[]
}

// Scorecaster will only look at all of a user's past reading sessions for the moment
export async function getScorecasterSessions(
  userId: Ulid
): Promise<UserSessionsWithMessages[]> {
  try {
    const sessions = await getUserSessionsByUserId(userId, {
      subject: 'reading',
    })
    const sessionsWithMessages: UserSessionsWithMessages[] = []
    for (const session of sessions) {
      try {
        const messages = await getMessagesForFrontend(session.id)
        sessionsWithMessages.push({ ...session, messages })
      } catch (error) {
        logError(error as Error)
      }
    }
    return sessionsWithMessages
  } catch (error) {
    logError(error as Error)
    throw error
  }
}

export async function generateScorecasterAnalysis(
  userId: Ulid
): Promise<ScorecasterResponse> {
  const sessionsToFormat = await getScorecasterSessions(userId)
  const botPrompt = await formatScorecasterSessionsToBotPrompt(sessionsToFormat)
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
          
          Respond in a JSON format in the shape of ScorecasterResponse from the TypeScript types below


          type ScorecasterTopics = {
            // The name of the topic to assess
            topic: string
            // Brief and short description of the topic
            description: string
            // Grade should be their grade for the topic from 65-100
            grade: number
            // If the topic is a strength or a practiceArea for the student
            type: 'strength' | 'practiceArea'
            // Reasons for why it's a strength or practice area
            reasons: string[]
            // Recommendations to the student on the topic
            recommendations: string[]
          }

          type ScorecasterSummary = {
            // A summary of all the topics
            summary: string
            // A summary of the recommendations to the student from the topics
            recommendations: string
            // A summary of the student's strengths
            strengths: string
            // Overall grade level you give them based off the topics between 65-100
            strengthsGrade: number
            // A summary of the student's practice Areas
            practiceAreas: string
            // Overall grade level you give them based off the topics between 65-100
            practiceAreasGrade: number
          }

          type ScorecasterOverview = {
            summary: ScorecasterSummary
            // Overall grade level you give them for the subject
            grade: number
          }

          type ScorecasterResponse = {
            overview: ScorecasterOverview
            topics: ScorecasterTopics[]
          }

          The comments denoted by "//" highlight what should be filled into the property below.
          If you have nothing to analyze, respond with an empty array for categories and an empty string for the summary.`,
      },
      {
        role: 'user',
        content: botPrompt,
      },
    ],
  })
  const response = completion.choices[0].message.content
  captureEvent(userId, EVENTS.SCORECASTER_ANALYSIS_COMPLETED, {
    response,
    debug: completion,
  })
  logger.info(
    `User: ${userId} received Scorecaster completion ${completion} with response ${response}`
  )
  return response ? JSON.parse(response) : { summary: {}, topics: [] }
}
