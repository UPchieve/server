import * as DirectMessageRepo from '../models/DirectMessage'
import {
  DirectMessageModerationError,
  InputError,
  NotAllowedError,
} from '../models/Errors'
import type { Ulid } from '../models/pgUtils'
import type { UserContactInfo } from '../models/User'
import type {
  DirectMessage,
  DirectMessageConversation,
  DirectMessageModerationResult,
} from '../types/direct-messages'
import type { Uuid } from '../types/shared'
import { ConversationNotFoundError } from './Errors'
import * as DirectMessageModerationService from './DirectMessageModerationService'
import * as ModerationRepo from '../models/DirectMessageModeration/queries'
import { getSessionFlagByModerationReason } from './ModerationService'
import { runInTransaction } from '../db'
import logger from '../logger'
import { EVENTS } from '../constants'
import { captureEvent } from './AnalyticsService'

function reviewCategory(reason: string) {
  const normalized = reason.toUpperCase().replaceAll(' ', '_')
  if (['EMAIL', 'PHONE', 'ADDRESS'].includes(normalized))
    return getSessionFlagByModerationReason('PII')
  if (normalized === 'LINK')
    return getSessionFlagByModerationReason('PLATFORM_CIRCUMVENTION')
  if (normalized === 'PROFANITY')
    return getSessionFlagByModerationReason('INAPPROPRIATE_CONTENT')
  return getSessionFlagByModerationReason(normalized)
}

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

  let moderation: DirectMessageModerationResult
  try {
    moderation = await DirectMessageModerationService.moderateMessage({
      conversationId,
      studentId: conversation.studentId,
      volunteerId: conversation.volunteerId,
      senderId: user.id,
      message: trimmedContents,
    })
  } catch (err) {
    logger.error('Could not moderate direct message', { err, conversationId })
    moderation = {
      blocked: true,
      reasons: ['MODERATION_UNAVAILABLE'],
      censoredBy: 'ai',
      unavailable: true,
    }
  }

  const message = await runInTransaction(async (client) => {
    if (moderation.censoredBy) {
      const censoredMessageId =
        await ModerationRepo.createCensoredDirectMessage(
          {
            conversationId,
            senderId: user.id,
            message: trimmedContents,
            censoredBy: moderation.censoredBy,
            reasons: moderation.reasons,
            blocked: moderation.blocked,
          },
          client
        )
      if (moderation.blocked && !moderation.unavailable) {
        const categories = new Set(moderation.reasons.map(reviewCategory))
        for (const flagName of categories) {
          await ModerationRepo.createDirectMessageFlag(
            { conversationId, censoredMessageId, flagName },
            client
          )
        }
      }
    }
    if (moderation.blocked) return
    return DirectMessageRepo.createDirectMessage(
      { conversationId, senderId: user.id, contents: trimmedContents },
      client
    )
  })

  // Let the sender know the message was blocked, but keep the moderation records saved
  if (!message) {
    throw new DirectMessageModerationError(
      moderation.reasons,
      moderation.unavailable
    )
  }

  captureEvent(user.id, EVENTS.DIRECT_MESSAGE_SENT, {
    conversationId,
    messageId: message.id,
    studentId: conversation.studentId,
    volunteerId: conversation.volunteerId,
    senderRole: user.id === conversation.studentId ? 'student' : 'volunteer',
    messageLength: trimmedContents.length,
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
