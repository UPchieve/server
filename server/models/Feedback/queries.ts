import { Feedback } from './types'
import { RepoCreateError, RepoReadError } from '../Errors'
import { getClient } from '../../pg'
import * as pgQueries from './pg.queries'
import { Ulid, makeSomeRequired, getDbUlid, makeRequired } from '../pgUtils'

function buildFeedback(rows: pgQueries.IGetFeedbackByIdResult[]): Feedback {
  if (rows.length > 2)
    throw new Error('Found more than 2 feedbacks for a session')
  const newRows = rows.map(v =>
    makeSomeRequired(v, [
      'studentCounselingFeedback',
      'studentTutoringFeedback',
      'volunteerFeedback',
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
    if (row.userRole === 'student') {
      feedback.studentId = row.userId
      feedback.studentCounselingFeedback = row.studentCounselingFeedback as any
      feedback.studentTutoringFeedback = row.studentTutoringFeedback as any
    } else if (row.userRole === 'volunteer') {
      feedback.volunteerId = row.userId
      feedback.volunteerFeedback = row.volunteerFeedback as any
    } else throw new Error('Found feedback with unknown user role')
  }
  return feedback
}

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

export async function getFeedbackById(
  id: Ulid
): Promise<Feedback | undefined> {
  try {
    const result = await pgQueries.getFeedbackById.run({ id }, getClient())
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
    const temp = makeSomeRequired(result[0], [
      'legacyFeedbacks',
      'studentCounselingFeedback',
      'studentTutoringFeedback',
      'volunteerFeedback',
      'subTopic',
      'type',
    ])
    return {
      userId: temp.id,
      createdAt: temp.createdAt,
      updatedAt: temp.updatedAt,
      ...buildFeedback([temp])
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export type FeedbackPayload = Pick<Feedback,
  | 'studentCounselingFeedback'
  | 'studentTutoringFeedback'
  | 'volunteerFeedback'
  | 'comment'
>
export async function saveFeedback(sessionId: Ulid, userRole: 'student' | 'volunteer', feedback: FeedbackPayload): Promise<Ulid> {
  try {
    const result = await pgQueries.saveFeedback.run({
      id: getDbUlid(),
      sessionId,
      userRole,
      studentCounselingFeedback: feedback.studentCounselingFeedback,
      studentTutoringFeedback: feedback.studentTutoringFeedback,
      volunteerFeedback: feedback.volunteerFeedback,
      comment: feedback.comment
    }, getClient())
    return makeRequired(result[0]).id
  } catch (err) {
    throw new RepoCreateError(err)
  }
}