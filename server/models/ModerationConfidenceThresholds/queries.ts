import config from '../../config'
import { getClient, TransactionClient } from '../../db'
import * as pgQueries from './pg.queries'
import { RepoReadError } from '../Errors'
import { makeRequired } from '../pgUtils'

export type ModerationType = 'contextual' | 'realtime_image'

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
