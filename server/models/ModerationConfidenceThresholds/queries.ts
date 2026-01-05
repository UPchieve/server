import { getClient, TransactionClient } from '../../db'
import * as pgQueries from './pg.queries'
import { RepoReadError } from '../Errors'
import { makeRequired } from '../pgUtils'

export type ModerationType = 'contextual' | 'realtime_image'
export type ModerationThreshold = {
  name: string
  threshold: number
}

async function getConfidenceThresholdsByModerationType(
  moderationType: ModerationType,
  client: TransactionClient = getClient()
): Promise<ModerationThreshold[]> {
  try {
    const result = await pgQueries.getConfidenceThresholdsByModerationType.run(
      {
        moderationType,
      },
      client
    )

    return result.map((row) => {
      const data = makeRequired(row)
      return {
        name: data.name,
        threshold: Number(data.threshold),
      }
    })
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getContextualConfidenceThresholds(
  client: TransactionClient = getClient()
): Promise<ModerationThreshold[]> {
  return getConfidenceThresholdsByModerationType('contextual', client)
}

export async function getRealtimeConfidenceThresholds(
  client: TransactionClient = getClient()
): Promise<ModerationThreshold[]> {
  return getConfidenceThresholdsByModerationType('realtime_image', client)
}
