import * as pgQueries from './pg.queries'
import { getClient, TransactionClient } from '../../db'
import { getDbUlid, makeRequired } from '../pgUtils'
import { RepoCreateError, RepoReadError } from '../Errors'
import type { Uuid } from '../../types/shared'
import type { DirectMessageModerationSource } from '../../types/direct-message-moderation'

export async function createCensoredDirectMessage(
  data: {
    conversationId: Uuid
    senderId: Uuid
    message: string
    censoredBy: DirectMessageModerationSource
    reasons: string[]
    blocked: boolean
  },
  client: TransactionClient
): Promise<Uuid> {
  try {
    const [row] = await pgQueries.createCensoredDirectMessage.run(
      { id: getDbUlid(), ...data },
      client
    )
    if (!row) throw new Error('Censored DM was not created')
    return makeRequired(row).id
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export async function createDirectMessageFlag(
  data: { conversationId: Uuid; censoredMessageId: Uuid; flagName: string },
  client: TransactionClient
) {
  try {
    const rows = await pgQueries.createDirectMessageFlag.run(
      { id: getDbUlid(), ...data },
      client
    )
    if (!rows.length) throw new Error('DM evidence or flag category not found')
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export async function getRecentMessages(conversationId: Uuid, limit: number) {
  try {
    const rows = await pgQueries.getRecentMessages.run(
      { conversationId, limit },
      getClient()
    )
    // We fetch newest first to get the latest messages, then reverse so AI reads them in order
    return rows.map((row) => makeRequired(row)).reverse()
  } catch (err) {
    throw new RepoReadError(err)
  }
}
