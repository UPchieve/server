import * as pgQueries from './pg.queries'
import { SessionMetrics } from './types'
import { RepoCreateError, RepoUpdateError } from '../Errors'
import { makeRequired, Uuid } from '../pgUtils'
import { getClient, TransactionClient } from '../../db'

export async function createSessionMetrics(
  sessionId: Uuid,
  tc?: TransactionClient
) {
  try {
    const result = await pgQueries.createSessionMetrics.run(
      {
        sessionId,
      },
      tc ?? getClient()
    )
    if (!(result.length && makeRequired(result[0]).ok))
      throw new RepoCreateError('Insert session metrics did not return ok')
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export async function updateSessionMetrics(
  sessionId: Uuid,
  metrics: Partial<SessionMetrics>,
  tc?: TransactionClient
): Promise<SessionMetrics> {
  try {
    const result = await pgQueries.updateSessionMetrics.run(
      {
        sessionId,
        absentStudent: metrics.absentStudent,
        absentVolunteer: metrics.absentVolunteer,
        lowSessionRatingFromCoach: metrics.lowSessionRatingFromCoach,
        lowSessionRatingFromStudent: metrics.lowSessionRatingFromStudent,
        lowCoachRatingFromStudent: metrics.lowCoachRatingFromStudent,
        reported: metrics.reported,
        onlyLookingForAnswers: metrics.onlyLookingForAnswers,
        rudeOrInappropriate: metrics.rudeOrInappropriate,
        commentFromStudent: metrics.commentFromStudent,
        commentFromVolunteer: metrics.commentFromVolunteer,
        hasBeenUnmatched: metrics.hasBeenUnmatched,
        hasHadTechnicalIssues: metrics.hasHadTechnicalIssues,
        personalIdentifyingInfo: metrics.personalIdentifyingInfo,
        gradedAssignment: metrics.gradedAssignment,
        coachUncomfortable: metrics.coachUncomfortable,
        studentCrisis: metrics.studentCrisis,
      },
      tc ?? getClient()
    )
    if (result.length) return makeRequired(result[0])
    throw new RepoUpdateError('updateSessionMetrics query did not return ok')
  } catch (err) {
    throw new RepoUpdateError(
      `Failed to update metrics ${metrics} for session ${sessionId}: ${
        (err as Error).message
      }`
    )
  }
}
