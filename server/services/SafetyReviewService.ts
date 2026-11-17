import * as SessionRepo from '../models/Session'
import * as DirectMessageRepo from '../models/DirectMessage'
import { ConversationNotFoundError } from './Errors'
import type { Uuid } from '../types/shared'

const REVIEW_PAGE_SIZE = 25
const REVIEW_MESSAGE_PAGE_SIZE = 100

export async function getReviewCounts() {
  const [sessions, conversations] = await Promise.all([
    SessionRepo.getPendingReviewCount(),
    DirectMessageRepo.getPendingReviewCount(),
  ])
  return { sessions, conversations }
}

export async function getPendingDirectMessageReviews(page: number) {
  const conversations = await DirectMessageRepo.getPendingReviewConversations(
    REVIEW_PAGE_SIZE + 1,
    (page - 1) * REVIEW_PAGE_SIZE
  )
  return {
    conversations: conversations.slice(0, REVIEW_PAGE_SIZE),
    isLastPage: conversations.length <= REVIEW_PAGE_SIZE,
  }
}

export async function getDirectMessageReviewMessages(
  conversationId: Uuid,
  beforeId?: Uuid
) {
  const messages = await DirectMessageRepo.getMessagesForReview(
    conversationId,
    REVIEW_MESSAGE_PAGE_SIZE + 1,
    beforeId
  )
  return {
    messages: messages.slice(0, REVIEW_MESSAGE_PAGE_SIZE).reverse(),
    hasMore: messages.length > REVIEW_MESSAGE_PAGE_SIZE,
  }
}

export async function getDirectMessageReview(conversationId: Uuid) {
  const conversation =
    await DirectMessageRepo.getConversationForReview(conversationId)
  if (!conversation) {
    throw new ConversationNotFoundError()
  }
  const [flags, history] = await Promise.all([
    DirectMessageRepo.getPendingReviewFlags(conversationId),
    getDirectMessageReviewMessages(conversationId),
  ])
  return { conversation, flags, ...history }
}

export async function markDirectMessageFlagsReviewed(
  conversationId: Uuid,
  flagIds: Uuid[]
) {
  // Only review the flags the reviewer saw, new flags stay pending
  return DirectMessageRepo.markFlagsReviewed(conversationId, flagIds)
}
