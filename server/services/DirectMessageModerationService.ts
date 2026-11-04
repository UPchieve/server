import { client as langfuseClient } from '../clients/langfuse'
import * as ModerationService from './ModerationService'
import * as Regex from './ModerationService/regex'
import * as ModerationRepo from '../models/DirectMessageModeration/queries'
import { timeLimit } from '../utils/time-limit'
import { secondsInMs } from '../utils/time-utils'
import type { SessionTranscript } from '../models/Session'
import type {
  DirectMessageModerationContext,
  DirectMessageModerationResult,
} from '../types/direct-message-moderation'

const MODERATION_CONTEXT_SIZE = 50
const MODERATION_TIMEOUT_MS = secondsInMs(10)

export async function moderateMessage(
  data: DirectMessageModerationContext
): Promise<DirectMessageModerationResult> {
  const { message, senderId, conversationId, studentId, volunteerId } = data
  const regex = await Regex.regexModerate(message)
  const trace = langfuseClient.trace({
    name: 'moderateDirectMessage',
    metadata: { conversationId, userId: senderId },
  })

  if (!regex.isClean) {
    const response = await ModerationService.getAiModerationResult(
      { message },
      senderId === volunteerId,
      trace
    )
    const decision = response?.results
    const blocked = decision?.appropriate !== true
    const aiReasons = decision?.reasons
    const reasons = blocked && aiReasons ? Object.keys(aiReasons) : []
    return {
      blocked,
      censoredBy: 'regex',
      // Keep the regex reasons if AI allows the message or cannot check it
      reasons: reasons.length ? reasons : Object.keys(regex.failures.failures),
    }
  }

  const recentMessages = await ModerationRepo.getRecentMessages(
    conversationId,
    MODERATION_CONTEXT_SIZE
  )
  const transcript: SessionTranscript = {
    // Reuse the transcript type with the conversation ID
    sessionId: conversationId,
    messages: [
      ...recentMessages.map((item) => ({
        messageId: item.id,
        userId: item.senderId,
        message: item.contents,
        createdAt: item.createdAt,
        messageType: 'direct_message' as const,
        role:
          item.senderId === studentId
            ? ('student' as const)
            : ('volunteer' as const),
      })),
      {
        // This message has not been saved yet
        messageId: 'pending',
        userId: senderId,
        message,
        createdAt: new Date(),
        messageType: 'direct_message',
        role: senderId === studentId ? 'student' : 'volunteer',
      },
    ],
  }
  const moderationResults = await timeLimit({
    promise: ModerationService.moderateTranscript(transcript, trace),
    fallbackReturnValue: null,
    timeLimitReachedErrorMessage: 'DM context moderation unavailable',
    waitInMs: MODERATION_TIMEOUT_MS,
  })
  if (!Array.isArray(moderationResults)) {
    return {
      blocked: true,
      reasons: ['MODERATION_UNAVAILABLE'],
      censoredBy: 'ai',
      unavailable: true,
    }
  }

  const reasons = [
    ...new Set<string>(moderationResults.map((item) => item.reason)),
  ]
  return {
    blocked: reasons.length > 0,
    reasons,
    ...(reasons.length ? { censoredBy: 'ai' as const } : {}),
  }
}
