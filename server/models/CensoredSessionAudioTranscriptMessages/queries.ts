import { CensoredSessionAudioTranscriptMessage } from './types'
import { RepoCreateError } from '../Errors'
import * as pgQueries from './pg.queries'
import { getClient } from '../../db'
export async function insertCensoredSessionAudioTranscriptMessages(
  sessionAudioTranscriptMessageId: string,
  message: string,
  client = getClient()
): Promise<CensoredSessionAudioTranscriptMessage> {
  try {
    const result = await pgQueries.insertCensoredSessionAudioTranscriptMessage.run(
      {
        sessionAudioTranscriptMessageId,
        message,
      },
      client
    )
    if (!result.length)
      throw new RepoCreateError(
        'Failed to insert censored session audio transcript message'
      )
    return result[0]
  } catch (err) {
    throw new RepoCreateError(err)
  }
}
