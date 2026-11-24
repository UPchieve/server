import { getClient, TransactionClient } from '../../db'
import { RepoReadError } from '../Errors'
import { makeSomeRequired, Ulid } from '../pgUtils'
import * as pgQueries from './pg.queries'

export async function getAtLargeEligibility(
  userId: Ulid,
  tc: TransactionClient = getClient()
) {
  try {
    const result = await pgQueries.getAtLargeEligibility.run({ userId }, tc)
    if (!result.length) return undefined
    return makeSomeRequired(result[0], [
      'deactivated',
      'deleted',
      'roles',
      'testUser',
    ])
  } catch (err) {
    throw new RepoReadError(err)
  }
}
