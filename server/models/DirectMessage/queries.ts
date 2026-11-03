import type {
  DirectMessage,
  DirectMessageConversation,
} from '../../types/direct-messages'
import * as pgQueries from './pg.queries'
import { RepoCreateError, RepoReadError } from '../Errors'
import { getClient, TransactionClient } from '../../db'
import { getDbUlid, makeRequired, makeSomeRequired, Ulid } from '../pgUtils'
import config from '../../config'

export async function createConversationIfEligible(
  studentId: Ulid,
  volunteerId: Ulid,
  client?: TransactionClient
): Promise<void> {
  try {
    await pgQueries.createConversationIfEligible.run(
      {
        id: getDbUlid(),
        studentId,
        volunteerId,
        minSessionLength: config.minSessionLength,
      },
      client ?? getClient()
    )
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export async function getOrCreateConversation(
  studentId: Ulid,
  volunteerId: Ulid,
  client?: TransactionClient
): Promise<DirectMessageConversation | undefined> {
  await createConversationIfEligible(studentId, volunteerId, client)
  try {
    const result = await pgQueries.getConversationByParticipants.run(
      { studentId, volunteerId },
      client ?? getClient()
    )
    if (!result.length) return
    return makeSomeRequired(result[0], [
      'id',
      'studentId',
      'volunteerId',
      'createdAt',
    ])
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getConversationForParticipant(
  conversationId: Ulid,
  userId: Ulid,
  client?: TransactionClient
): Promise<DirectMessageConversation | undefined> {
  try {
    const result = await pgQueries.getConversationForParticipant.run(
      { conversationId, userId },
      client ?? getClient()
    )
    if (result.length)
      return makeSomeRequired(result[0], [
        'id',
        'studentId',
        'volunteerId',
        'createdAt',
      ])
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function createDirectMessage(
  data: {
    conversationId: Ulid
    senderId: Ulid
    contents: string
  },
  client?: TransactionClient
): Promise<DirectMessage> {
  try {
    const result = await pgQueries.createDirectMessage.run(
      { id: getDbUlid(), ...data },
      client ?? getClient()
    )
    return makeRequired(result[0])
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export async function getDirectMessagesForConversation(
  conversationId: Ulid,
  client?: TransactionClient
): Promise<DirectMessage[]> {
  try {
    const result = await pgQueries.getDirectMessagesForConversation.run(
      { conversationId },
      client ?? getClient()
    )
    return result.map((row) => makeRequired(row))
  } catch (err) {
    throw new RepoReadError(err)
  }
}
