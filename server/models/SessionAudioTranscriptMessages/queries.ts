import { InsertSessionAudioTranscriptMessageArgs } from './types'
import { RepoCreateError } from '../Errors'
import * as pgQueries from './pg.queries'
import { getClient } from '../../db'
import { getDbUlid, makeSomeRequired } from '../pgUtils'
export async function insertSessionAudioTranscriptMessage(
  data: InsertSessionAudioTranscriptMessageArgs,
  client = getClient()
): Promise<string> {
  try {
    const results = await pgQueries.insertSessionAudioTranscriptMessage.run(
      {
        id: getDbUlid(),
        userId: data.userId,
        sessionId: data.sessionId,
        message: data.message,
        saidAt: data.saidAt,
      },
      client
    )
    if (!results.length)
      throw new RepoCreateError(
        'Failed to create SessionAudioTranscriptMessage'
      )
    return makeSomeRequired(results[0], ['id']).id
  } catch (err) {
    throw new RepoCreateError(err)
  }
}
