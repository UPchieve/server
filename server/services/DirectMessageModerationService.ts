import { client as langfuseClient } from '../clients/langfuse'
import * as ModerationService from './ModerationService'
import * as Regex from './ModerationService/regex'
import * as ModerationRepo from '../models/DirectMessageModeration/queries'
import { timeLimit } from '../utils/time-limit'
import { secondsInMs } from '../utils/time-utils'
import type {
  DirectMessageModerationContext,
  DirectMessageModerationResult,
} from '../types/direct-messages'

const MODERATION_CONTEXT_SIZE = 50
const MODERATION_TIMEOUT_MS = secondsInMs(10)

export async function moderateMessage(
  data: DirectMessageModerationContext
): Promise<DirectMessageModerationResult> {
  const { message, senderId, conversationId, volunteerId } = data
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
  const reasons = await timeLimit({
    promise: ModerationService.moderatePendingMessage(
      data,
      recentMessages,
      trace
    ),
    fallbackReturnValue: null,
    timeLimitReachedErrorMessage: 'DM context moderation unavailable',
    waitInMs: MODERATION_TIMEOUT_MS,
  })
  if (!Array.isArray(reasons)) {
    return {
      blocked: true,
      reasons: ['MODERATION_UNAVAILABLE'],
      censoredBy: 'ai',
      unavailable: true,
    }
  }

  return {
    blocked: reasons.length > 0,
    reasons,
    ...(reasons.length ? { censoredBy: 'ai' as const } : {}),
  }
}
