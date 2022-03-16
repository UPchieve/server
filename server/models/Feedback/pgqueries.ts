import { PgFeedback } from './types'
import { RepoReadError } from '../Errors'
import { getClient } from '../../pg'
import * as pgQueries from './pg.queries'
import { Ulid, makeSomeRequired } from '../pgUtils'

function buildFeedback(rows: pgQueries.IGetFeedbackByIdResult[]): PgFeedback {
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
  const feedback: PgFeedback = {
    id: newRows[0].id,
    sessionId: newRows[0].sessionId,
    type: newRows[0].type,
    subTopic: newRows[0].subTopic,
  }
  for (const row of newRows) {
    if (row.userRole === 'student') {
      feedback.studentId = row.userId
      feedback.studentCounselingFeedback = row.studentCounselingFeedback
      feedback.studentTutoringFeedback = row.studentTutoringFeedback
    } else if (row.userRole === 'volunteer') {
      feedback.volunteerId = row.userId
      feedback.volunteerFeedback = row.volunteerFeedback
    } else throw new Error('Found feedback with unknown user role')
  }
  return feedback
}

export async function getFeedbackBySessionId(
  sessionId: Ulid
): Promise<PgFeedback | undefined> {
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
): Promise<PgFeedback | undefined> {
  try {
    const result = await pgQueries.getFeedbackById.run({ id }, getClient())
    if (!result.length) return
    return buildFeedback(result)
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export type SingleFeedback = PgFeedback & {
  userId: Ulid
  createdAt: Date
  updatedAt: Date
}

export async function getFeedbackBySessionIdUserType(
  sessionId: Ulid,
  userRole: 'student' | 'volunteer'
): Promise<SingleFeedback | undefined> {
  try {
    const result = await pgQueries.getFeedbackBySessionIdUserType.run(
      { sessionId, userRole },
      getClient()
    )
    if (!result.length) return
    return makeSomeRequired(result[0], [
      'legacyFeedbacks',
      'studentCounselingFeedback',
      'studentTutoringFeedback',
      'volunteerFeedback',
      'subTopic',
      'type',
    ])
  } catch (err) {
    throw new RepoReadError(err)
  }
}
