import type { DirectMessagePublic } from './direct-messages'
import type { DirectMessage } from '../types/direct-messages'

export function toDirectMessagePublic(
  message: DirectMessage
): DirectMessagePublic {
  return {
    id: message.id,
    conversationId: message.conversationId,
    senderId: message.senderId,
    contents: message.contents,
    createdAt: message.createdAt.toISOString(),
  }
}
