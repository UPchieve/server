import { getClient } from '../../db'
import { RepoReadError } from '../Errors'
import { makeSomeOptional, Ulid } from '../pgUtils'
import * as pgQueries from './pg.queries'
import { Feedback } from './types'
import { fixNumberInt } from '../../utils/fix-number-int'

export type FeedbackByResult = {
  id: string
  sessionId: string
  studentCounselingFeedback?: pgQueries.Json
  studentTutoringFeedback?: pgQueries.Json
  subTopic: string
  type: string
  userId: string
  userRole: string
  volunteerFeedback?: pgQueries.Json
  legacyFeedbacks?: pgQueries.Json
  responseData?: pgQueries.Json
}

function buildFeedback(rows: FeedbackByResult[]): Feedback {
  if (rows.length > 2) {
    throw new Error('Found more than 2 feedbacks for a session')
  }
  const newRows = rows.map(v =>
    makeSomeOptional(v, [
      'legacyFeedbacks',
      'studentCounselingFeedback',
      'studentTutoringFeedback',
      'volunteerFeedback',
      'responseData',
      'type',
      'subTopic',
    ])
  )
  const feedback: Feedback = {
    id: newRows[0].id,
    sessionId: newRows[0].sessionId,
    type: newRows[0].type,
    subTopic: newRows[0].subTopic,
  }
  for (const row of newRows) {
    feedback.responseData = fixNumberInt(row.responseData as any)
    if (row.userRole === 'student') {
      feedback.studentId = row.userId
      feedback.studentCounselingFeedback = fixNumberInt(
        row.studentCounselingFeedback as any
      )
      feedback.studentTutoringFeedback = fixNumberInt(
        row.studentTutoringFeedback as any
      )
    } else if (row.userRole === 'volunteer') {
      feedback.volunteerId = row.userId
      feedback.volunteerFeedback = fixNumberInt(row.volunteerFeedback as any)
    } else throw new Error('Found feedback with unknown user role')
  }
  return feedback
}

// need this for session review, which still displays legacy feedback
export async function getFeedbackBySessionId(
  sessionId: Ulid
): Promise<Feedback | undefined> {
  try {
    const result = await pgQueries.getFeedbackBySessionId.run(
      { sessionId },
      getClient()
    )
    if (!result.length) return
    return buildFeedback(result)
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export type SingleFeedback = Feedback & {
  userId: Ulid
  createdAt: Date
  updatedAt: Date
}

export async function getFeedbackBySessionIdUserType(
  sessionId: Ulid,
  userRole: string
): Promise<SingleFeedback | undefined> {
  try {
    const result = await pgQueries.getFeedbackBySessionIdUserType.run(
      { sessionId, userRole },
      getClient()
    )
    if (!result.length) return
    const temp = makeSomeOptional(result[0], [
      'legacyFeedbacks',
      'studentCounselingFeedback',
      'studentTutoringFeedback',
      'volunteerFeedback',
      'responseData',
    ])
    return {
      userId: temp.id,
      createdAt: temp.createdAt,
      updatedAt: temp.updatedAt,
      ...buildFeedback([temp]),
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}
