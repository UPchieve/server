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

    if (!result.length) {
      if (moderationType === 'contextual')
        return config.contextualModerationConfidenceThreshold
      else return config.imageModerationMinConfidence
    }

    return Number(makeRequired(result[0]).threshold)
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export type ModerationTreshold = {
  name: string
  threshold: string
}

export async function getContextualConfidenceThresholds(
  client: TransactionClient = getClient()
): Promise<ModerationTreshold[]> {
  try {
    const result = await pgQueries.getContextualConfidenceThresholds.run(
      undefined,
      client
    )

    return result.map((row) => makeRequired(row))
  } catch (err) {
    throw new RepoReadError(err)
  }
}
