import { Ulid } from '../models/pgUtils'
import { Job } from 'bull'
import * as SessionService from '../services/SessionService'
import * as ModerationService from '../services/ModerationService'
import { ModerationSessionReviewFlagReason } from '../services/ModerationService'
import config from '../config'
import { runInTransaction, TransactionClient } from '../db'
import {
  updateSessionFlagsById,
  updateSessionReviewReasonsById,
} from '../models/Session'
import { USER_SESSION_METRICS } from '../constants'

export interface ModerateSessionTranscriptJobData {
  sessionId: Ulid
}

export default async function moderateSessionTranscript(
  job: Job<ModerateSessionTranscriptJobData>
) {
  try {
    const transcript = await SessionService.getSessionTranscript(
      job.data.sessionId
    )
    const moderationResults =
      await ModerationService.moderateTranscript(transcript)
    const confidenceThreshold = config.contextualModerationConfidenceThreshold
    const flaggedChunks = moderationResults.filter(
      (chunk) => chunk.confidence >= confidenceThreshold
    )
    const flagReasons = new Set<string>(
      flaggedChunks.flatMap((chunk) => chunk.reasons)
    )
    const sessionFlags = Array.from(flagReasons).map((r) => getSessionFlag(r))
    if (flaggedChunks.length) {
      await runInTransaction(async (tc: TransactionClient) => {
        await updateSessionFlagsById(job.data.sessionId, sessionFlags)
        await updateSessionReviewReasonsById(
          job.data.sessionId,
          sessionFlags,
          false
        )
      })
    }
  } catch (err) {
    throw new Error(
      `Failed to moderate transcript for session ${job.data.sessionId}. Error: ${err}`
    )
  }
}

const getSessionFlag = (
  reason: ModerationSessionReviewFlagReason | string
): USER_SESSION_METRICS => {
  let flag = USER_SESSION_METRICS.generalModerationIssue
  switch (reason) {
    case 'PII':
      flag = USER_SESSION_METRICS.pii
      break
    case 'INAPPROPRIATE_CONTENT':
      flag = USER_SESSION_METRICS.inappropriateConversation
      break
    case 'PLATFORM_CIRCUMVENTION':
      flag = USER_SESSION_METRICS.platformCircumvention
      break
    case 'HATE_SPEECH':
      flag = USER_SESSION_METRICS.hateSpeech
      break
    case 'SAFETY':
      flag = USER_SESSION_METRICS.safetyConcern
      break
  }
  return flag
}
