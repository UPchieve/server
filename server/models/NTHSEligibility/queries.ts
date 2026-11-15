import { getClient, TransactionClient } from '../../db'
import { RepoReadError } from '../Errors'
import { makeSomeOptional, Ulid } from '../pgUtils'
import * as pgQueries from './pg.queries'

export async function getAtLargeEligibility(
  userId: Ulid,
  tc: TransactionClient = getClient()
) {
  try {
    const result = await pgQueries.getAtLargeEligibility.run({ userId }, tc)
    if (!result.length) return undefined
    return makeSomeOptional(result[0], ['banType', 'gradeLevel'])
  } catch (err) {
    throw new RepoReadError(err)
  }
}
