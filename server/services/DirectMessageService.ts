import * as DirectMessageRepo from '../models/DirectMessage'
import { InputError, NotAllowedError } from '../models/Errors'
import type { Ulid } from '../models/pgUtils'
import type { UserContactInfo } from '../models/User'
import type {
  DirectMessage,
  DirectMessageConversation,
} from '../types/direct-messages'
import type { Uuid } from '../types/shared'
import { ConversationNotFoundError } from './Errors'

export async function getOrCreateConversation(
  user: UserContactInfo,
  partnerId: Uuid
): Promise<DirectMessageConversation> {
  let studentId: Uuid
  let volunteerId: Uuid
  if (user.roleContext.isActiveRole('student')) {
    studentId = user.id
    volunteerId = partnerId
  } else if (user.roleContext.isActiveRole('volunteer')) {
    studentId = partnerId
    volunteerId = user.id
  } else {
    throw new NotAllowedError('Only students and coaches can send messages')
  }

  const conversation = await DirectMessageRepo.getOrCreateConversation(
    studentId,
    volunteerId
  )

  if (!conversation) throw new ConversationNotFoundError()
  return conversation
}

async function ensureIsParticipant(conversationId: Ulid, userId: Ulid) {
  const conversation = await DirectMessageRepo.getConversationForParticipant(
    conversationId,
    userId
  )
  if (!conversation) throw new ConversationNotFoundError()
  return conversation
}

export async function getMessages(
  conversationId: Ulid,
  user: UserContactInfo
): Promise<DirectMessage[]> {
  await ensureIsParticipant(conversationId, user.id)
  return DirectMessageRepo.getDirectMessagesForConversation(conversationId)
}

export async function sendMessage(
  conversationId: Ulid,
  user: UserContactInfo,
  contents: string
): Promise<{
  conversation: DirectMessageConversation
  message: DirectMessage
}> {
  const trimmedContents = contents.trim()
  if (!trimmedContents) throw new InputError('Message cannot be empty')

  const conversation = await ensureIsParticipant(conversationId, user.id)

  // TODO: moderate the message before saving it
  const message = await DirectMessageRepo.createDirectMessage({
    conversationId,
    senderId: user.id,
    contents: trimmedContents,
  })
  return { conversation, message }
}

export async function markConversationSeen(
  conversationId: Ulid,
  user: UserContactInfo
): Promise<void> {
  const wasUpdated = await DirectMessageRepo.updateConversationLastSeen(
    conversationId,
    user.id
  )
  if (!wasUpdated) throw new ConversationNotFoundError()
}

export async function getUnreadMessageSenderIds(
  user: UserContactInfo
): Promise<Ulid[]> {
  return DirectMessageRepo.getUnreadDirectMessageSenderIds(user.id)
}
