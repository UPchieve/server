import { Ulid } from '../models/pgUtils'
import { Job } from 'bull'
import * as SessionService from '../services/SessionService'
import * as ModerationService from '../services/ModerationService'
import config from '../config'
import { runInTransaction, TransactionClient } from '../db'
import logger from '../logger'
import {
  updateSessionFlagsById,
  updateSessionReviewReasonsById,
} from '../models/Session'
import { USER_SESSION_METRICS } from '../constants'

export interface ModerateSessionTranscriptJobData {
  sessionId: Ulid
}

export default async function(job: Job<ModerateSessionTranscriptJobData>) {
  const transcript = await SessionService.getSessionTranscript(
    job.data.sessionId
  )
  const result = await ModerationService.moderateTranscript(transcript)
  console.log('Transcript moderation result', JSON.stringify(result, null, 2))
  const confidenceThreshold = config.contextualModerationConfidenceThreshold
  if (result.confidence >= confidenceThreshold) {
    console.log('Flagging session for review')
    await runInTransaction(async (tc: TransactionClient) => {
      await updateSessionFlagsById(job.data.sessionId, [
        USER_SESSION_METRICS.flaggedByModerationJob,
      ])
      // @TODO Can get more specific reasons from the model if we want.
      await updateSessionReviewReasonsById(
        job.data.sessionId,
        [USER_SESSION_METRICS.flaggedByModerationJob],
        false
      ) // this also sets sessions.to_review = true
    })
    logger.info(
      { sessionId: job.data.sessionId },
      'Contextual moderation job flagged session for review'
    )
  }
}
