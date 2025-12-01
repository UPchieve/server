import config from '../../config'
import { getClient, TransactionClient } from '../../db'
import * as pgQueries from './pg.queries'
import { RepoReadError } from '../Errors'
import { makeRequired } from '../pgUtils'

export async function getConfidenceRating(
  flagReason: string,
  client: TransactionClient = getClient()
): Promise<number> {
  try {
    const result = await pgQueries.getConfidenceRating.run(
      {
        flagReason,
      },
      client
    )

    if (!result.length) return config.contextualModerationConfidenceThreshold

    return makeRequired(result[0]).confidenceRating
  } catch (err) {
    throw new RepoReadError(err)
  }
}
