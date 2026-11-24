import { getDbUlid, makeSomeRequired } from '../pgUtils'
import { CensoredSessionMessage } from './types'
import * as pgQueries from './pg.queries'
import { getClient } from '../../db'
import { RepoCreateError } from '../Errors'
export { CENSORED_BY } from '../../types/moderation'

export async function createCensoredMessage({
  senderId,
  message,
  sessionId,
  censoredBy,
  sentAt = new Date(),
  shown = false,
}: {
  senderId: CensoredSessionMessage['senderId']
  message: CensoredSessionMessage['message']
  sessionId: CensoredSessionMessage['sessionId']
  censoredBy: CensoredSessionMessage['censoredBy']
  shown?: CensoredSessionMessage['shown']
  sentAt?: CensoredSessionMessage['sentAt']
}): Promise<CensoredSessionMessage> {
  try {
    const result = await pgQueries.createCensoredMessage.run(
      {
        id: getDbUlid(),
        senderId,
        message,
        sessionId,
        censoredBy,
        shown,
        sentAt,
      },
      getClient()
    )
    if (result.length) {
      return makeSomeRequired(result[0], [
        'id',
        'senderId',
        'message',
        'sessionId',
        'censoredBy',
        'sentAt',
        'shown',
      ])
    }
    throw new RepoCreateError(
      'createCensoredMessage: Insert query did not return new row'
    )
  } catch (err) {
    throw new RepoCreateError(err)
  }
}
