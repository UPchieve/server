import { merge } from 'lodash'
import { getClient } from '../../pg'
import { RepoCreateError, RepoReadError, RepoUpdateError } from '../Errors'
import { makeRequired, Ulid } from '../pgUtils'
import * as pgQueries from './pg.queries'
import { PgUserSessionMetrics } from './types'

export async function createUSMByUserId(
  userId: Ulid
): Promise<PgUserSessionMetrics> {
  try {
    const result = await pgQueries.createUsmByUserId.run(
      {
        userId,
      },
      getClient()
    )
    if (result.length) return makeRequired(result[0])
    throw new RepoCreateError('Insert did not return new row')
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export async function getUSMByUserId(
  userId: Ulid
): Promise<PgUserSessionMetrics | undefined> {
  try {
    const result = await pgQueries.getUsmByUserId.run(
      {
        userId,
      },
      getClient()
    )

    if (result.length) return makeRequired(result[0])
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getAllUSM(): Promise<PgUserSessionMetrics[]> {
  try {
    const results = await pgQueries.getAllUsm.run(undefined, getClient())
    return makeRequired(results)
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export type UserSessionMetricsUpdateQuery =  { [key: string]: number }

// NOTE: when queries are merged conflicting scalar values will be overwritten
// ex: a = { a: { aa: 1, bb: 2 } }, b = { a: { aa: 3, cc: 4 } }
// merge(a,b) => a = { a: { aa: 3, bb: 2, cc: 4 } }
export async function executeUSMUpdatesByUserId(
  userId: Ulid,
  queries: UserSessionMetricsUpdateQuery[]
): Promise<void> {
  // TODO fix `counters` nesting
  // NOTE: `queries` has example shape below after `merge()`
  // {
  //   'counters.hasBeenUnmatched': 109,
  //   'counters.absentStudent': 22,
  //   'counters.absentVolunteer': 27
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
        absentStudent: update['counters.absentStudent'],
        absentVolunteer: update['counters.absentVolunteer'],
        lowSessionRatingFromCoach: update['counters.lowSessionRatingFromCoach'],
        lowSessionRatingFromStudent: update['counters.lowSessionRatingFromStudent'],
        lowCoachRatingFromStudent: update['counters.lowCoachRatingFromStudent'],
        reported: update['counters.reported'],
        onlyLookingForAnswers: update['counters.onlyLookingForAnswers'],
        rudeOrInappropriate: update['counters.rudeOrInappropriate'],
        commentFromStudent: update['counters.commentFromStudent'],
        commentFromVolunteer: update['counters.commentFromVolunteer'],
        hasBeenUnmatched: update['counters.hasBeenUnmatched'],
        hasHadTechnicalIssues: update['counters.hasHadTechnicalIssues'],
      },
      getClient()
    )
    if (result.length && result[0]) return
    throw new RepoUpdateError('Update query did not return id')
  } catch (err) {
    throw new RepoUpdateError(
      `Failed to execute merged update ${update} for user ${userId}: ${
        (err as Error).message
      }`
    )
  }
}
