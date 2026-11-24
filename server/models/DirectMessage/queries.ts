import type {
  DirectMessage,
  DirectMessageConversation,
} from '../../types/direct-messages'
import * as pgQueries from './pg.queries'
import { RepoCreateError, RepoReadError, RepoUpdateError } from '../Errors'
import { getClient, TransactionClient } from '../../db'
import { getDbUlid, makeSomeRequired } from '../pgUtils'
import config from '../../config'
import type { Uuid } from '../../types/shared'

export async function createConversationIfEligible(
  studentId: Uuid,
  volunteerId: Uuid,
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
  studentId: Uuid,
  volunteerId: Uuid,
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
  conversationId: Uuid,
  userId: Uuid,
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
    conversationId: Uuid
    senderId: Uuid
    contents: string
    sentWhileShadowbanned: boolean
  },
  client?: TransactionClient
): Promise<DirectMessage> {
  try {
    const result = await pgQueries.createDirectMessage.run(
      { id: getDbUlid(), ...data },
      client ?? getClient()
    )
    return makeSomeRequired(result[0], [
      'id',
      'conversationId',
      'senderId',
      'contents',
      'createdAt',
    ])
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export async function getDirectMessagesForConversation(
  conversationId: Uuid,
  viewerId: Uuid,
  client?: TransactionClient
): Promise<DirectMessage[]> {
  try {
    const result = await pgQueries.getDirectMessagesForConversation.run(
      { conversationId, viewerId },
      client ?? getClient()
    )
    return result.map((row) =>
      makeSomeRequired(row, [
        'id',
        'conversationId',
        'senderId',
        'contents',
        'createdAt',
      ])
    )
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function updateConversationLastSeen(
  conversationId: Uuid,
  userId: Uuid,
  client?: TransactionClient
): Promise<boolean> {
  try {
    const result = await pgQueries.updateConversationLastSeen.run(
      { conversationId, userId },
      client ?? getClient()
    )
    return result.length > 0
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export async function getUnreadDirectMessageSenderIds(
  userId: Uuid,
  client?: TransactionClient
): Promise<Uuid[]> {
  try {
    const result = await pgQueries.getUnreadDirectMessageSenderIds.run(
      { userId },
      client ?? getClient()
    )
    return result.map((row) => makeSomeRequired(row, ['senderId']).senderId)
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getPendingReviewCount() {
  try {
    const [row] = await pgQueries.getPendingReviewCount.run(
      undefined,
      getClient()
    )
    return makeSomeRequired(row, ['count']).count
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getPendingReviewConversations(
  limit: number,
  offset: number
) {
  try {
    const rows = await pgQueries.getPendingReviewConversations.run(
      { limit, offset },
      getClient()
    )
    return rows.map((row) =>
      makeSomeRequired(row, [
        'id',
        'studentId',
        'volunteerId',
        'studentName',
        'volunteerName',
        'oldestFlagAt',
        'pendingFlags',
        'reasons',
      ])
    )
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getConversationForReview(conversationId: Uuid) {
  try {
    const [row] = await pgQueries.getConversationForReview.run(
      { conversationId },
      getClient()
    )
    return row
      ? makeSomeRequired(row, [
          'id',
          'studentId',
          'volunteerId',
          'studentName',
          'volunteerName',
        ])
      : undefined
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getPendingReviewFlags(conversationId: Uuid) {
  try {
    const rows = await pgQueries.getPendingReviewFlags.run(
      { conversationId },
      getClient()
    )
    return rows.map((row) =>
      makeSomeRequired(row, ['id', 'category', 'createdAt'])
    )
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getMessagesForReview(
  conversationId: Uuid,
  limit: number,
  beforeId?: Uuid
) {
  try {
    const rows = await pgQueries.getMessagesForReview.run(
      { conversationId, limit, beforeId },
      getClient()
    )
    return rows.map((row) =>
      makeSomeRequired(row, ['id', 'senderId', 'contents', 'createdAt'])
    )
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function markFlagsReviewed(conversationId: Uuid, flagIds: Uuid[]) {
  try {
    const rows = await pgQueries.markFlagsReviewed.run(
      { conversationId, flagIds },
      getClient()
    )
    return rows.length
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export async function getUnreadDirectMessageCount(
  userId: Uuid,
  client?: TransactionClient
): Promise<number> {
  try {
    const result = await pgQueries.getUnreadDirectMessageCount.run(
      { userId },
      client ?? getClient()
    )
    return result[0]?.count ?? 0
  } catch (err) {
    throw new RepoReadError(err)
  }
}
