import { merge } from 'lodash'
import { getClient, TransactionClient } from '../../db'
import { RepoCreateError, RepoReadError, RepoUpdateError } from '../Errors'
import { makeRequired, Ulid } from '../pgUtils'
import * as pgQueries from './pg.queries'
import { UserSessionMetrics } from './types'

export async function createUSMByUserId(
  userId: Ulid,
  tc?: TransactionClient
): Promise<UserSessionMetrics> {
  try {
    const result = await pgQueries.createUsmByUserId.run(
      {
        userId,
      },
      tc ?? getClient()
    )
    if (result.length) return makeRequired(result[0])
    throw new RepoCreateError('Insert did not return new row')
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export async function getUSMByUserId(
  userId: Ulid,
  tc?: TransactionClient
): Promise<UserSessionMetrics | undefined> {
  try {
    const result = await pgQueries.getUsmByUserId.run(
      {
        userId,
      },
      tc ?? getClient()
    )

    if (result.length) return makeRequired(result[0])
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export type UserSessionMetricsUpdateQuery = { [key: string]: number }

// NOTE: when queries are merged conflicting scalar values will be overwritten
// ex: a = { a: { aa: 1, bb: 2 } }, b = { a: { aa: 3, cc: 4 } }
// merge(a,b) => a = { a: { aa: 3, bb: 2, cc: 4 } }
export async function executeUSMUpdatesByUserId(
  userId: Ulid,
  queries: UserSessionMetricsUpdateQuery[]
): Promise<void> {
  // NOTE: `queries` has an example shape similar to below after `merge()`
  // {
  //   hasBeenUnmatched': 109,
  //   absentStudent': 22,
  //   absentVolunteer': 27
  //   ...
  // }
  const update: any = {}
  for (const q of queries) {
    merge(update, q)
  }
  try {
    const result = await pgQueries.executeUsmUpdatesByUserId.run(
      {
        userId,
        absentStudent: update['absentStudent'],
        absentVolunteer: update['absentVolunteer'],
        lowSessionRatingFromCoach: update['lowSessionRatingFromCoach'],
        lowSessionRatingFromStudent: update['lowSessionRatingFromStudent'],
        lowCoachRatingFromStudent: update['lowCoachRatingFromStudent'],
        reported: update['reported'],
        onlyLookingForAnswers: update['onlyLookingForAnswers'],
        rudeOrInappropriate: update['rudeOrInappropriate'],
        commentFromStudent: update['commentFromStudent'],
        commentFromVolunteer: update['commentFromVolunteer'],
        hasBeenUnmatched: update['hasBeenUnmatched'],
        hasHadTechnicalIssues: update['hasHadTechnicalIssues'],
        personalIdentifyingInfo: update['personalIdentifyingInfo'],
        gradedAssignment: update['gradedAssignment'],
        coachUncomfortable: update['coachUncomfortable'],
        studentCrisis: update['studentCrisis'],
      },
      getClient()
    )
    if (result.length && makeRequired(result[0].ok)) return
    throw new RepoUpdateError('Update query did not return id')
  } catch (err) {
    throw new RepoUpdateError(
      `Failed to execute merged update ${update} for user ${userId}: ${
        (err as Error).message
      }`
    )
  }
}
