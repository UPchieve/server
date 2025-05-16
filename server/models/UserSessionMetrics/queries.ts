import { getClient, TransactionClient } from '../../db'
import { RepoReadError } from '../Errors'
import { makeRequired, Ulid } from '../pgUtils'
import * as pgQueries from './pg.queries'
import { UserSessionMetrics } from './types'
import { UserRole } from '../User'

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
