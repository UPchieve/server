import { getClient, TransactionClient } from '../../db'
import { RepoReadError } from '../Errors'
import { makeSomeRequired, Ulid } from '../pgUtils'
import * as pgQueries from './pg.queries'
import { UserSessionMetrics } from './types'
import type { UserRole } from '../../types/users'

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
    if (result.length)
      return makeSomeRequired(result[0], [
        'absentStudent',
        'absentVolunteer',
        'coachUncomfortable',
        'commentFromStudent',
        'commentFromVolunteer',
        'createdAt',
        'gradedAssignment',
        'hasBeenUnmatched',
        'hasHadTechnicalIssues',
        'lowCoachRatingFromStudent',
        'lowSessionRatingFromCoach',
        'lowSessionRatingFromStudent',
        'onlyLookingForAnswers',
        'personalIdentifyingInfo',
        'reported',
        'rudeOrInappropriate',
        'studentCrisis',
        'userId',
      ])
  } catch (err) {
    throw new RepoReadError(err)
  }
}
