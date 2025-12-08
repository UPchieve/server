import config from '../../config'
import { getClient, TransactionClient } from '../../db'
import * as pgQueries from './pg.queries'
import { RepoReadError } from '../Errors'
import { makeRequired } from '../pgUtils'

export type ModerationType = 'contextual' | 'realtime_image'

export async function getConfidenceTreshold(
  moderationCategory: string,
  moderationType: ModerationType,
  client: TransactionClient = getClient()
): Promise<Number> {
  try {
    const result = await pgQueries.getConfidenceThreshold.run(
      {
        moderationCategory,
        moderationType,
      },
      client
    )

    if (!result.length) return config.contextualModerationConfidenceThreshold

    return Number(makeRequired(result[0]).threshold)
  } catch (err) {
    throw new RepoReadError(err)
  }
}
