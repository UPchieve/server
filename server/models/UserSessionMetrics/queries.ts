import { merge } from 'lodash'
import { getClient, TransactionClient } from '../../db'
import { RepoReadError, RepoUpdateError } from '../Errors'
import { makeRequired, Ulid } from '../pgUtils'
import * as pgQueries from './pg.queries'
import { UserSessionMetrics } from './types'
import { UserRole } from '../User'

export type UserSessionMetricsUpdateQuery = { [key: string]: number }

// TODO: To remove. This will be computed via a view
export async function updateUserSessionMetricsByUserId(
  userId: Ulid,
  metrics: UserSessionMetrics
): Promise<UserSessionMetrics> {
  try {
    const result = await pgQueries.updateUserSessionMetricsByUserId.run(
      {
        userId,
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
      getClient()
    )
    if (result.length) return makeRequired(result[0])
    throw new RepoUpdateError(
      'updateUserSessionMetricsByUserId query did not update'
    )
  } catch (err) {
    throw new RepoUpdateError(
      `Failed to update metrics ${metrics} for user ${userId}: ${
        (err as Error).message
      }`
    )
  }
}

export async function getUserSessionMetricsByUserId(
  userId: Ulid,
  userRole: UserRole,
  tc?: TransactionClient
): Promise<UserSessionMetrics | undefined> {
  try {
    const result = await pgQueries.getUserSessionMetricsByUserId.run(
      {
        userId,
        userRole,
      },
      tc ?? getClient()
    )
    if (result.length) return makeRequired(result[0])
  } catch (err) {
    throw new RepoReadError(err)
  }
}
