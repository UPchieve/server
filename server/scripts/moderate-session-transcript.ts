import { Ulid } from '../models/pgUtils'
import { Job } from 'bull'
import * as SessionService from '../services/SessionService'
import * as ModerationService from '../services/ModerationService'
import config from '../config'
import logger from '../logger'

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
    const moderationResults = await ModerationService.moderateTranscript(
      transcript
    )
    const confidenceThreshold = config.contextualModerationConfidenceThreshold
    const flaggedChunks = moderationResults.filter(
      chunk => chunk.confidence >= confidenceThreshold
    )
    if (flaggedChunks.length) {
      logger.info(
        {
          sessionId: job.data.sessionId,
        },
        'Contextual moderation job flagged session for review'
      )

      // @TODO - Uncomment when we're ready to dump these sessions in the review queue
      // await runInTransaction(async (tc: TransactionClient) => {
      //   await updateSessionFlagsById(job.data.sessionId, [
      //     USER_SESSION_METRICS.flaggedByModerationJob,
      //   ])
      //   await updateSessionReviewReasonsById(
      //     job.data.sessionId,
      //     [USER_SESSION_METRICS.flaggedByModerationJob],
      //     false
      //   ) // this also sets sessions.to_review = true
      // })
    }
  } catch (err) {
    throw new Error(
      `Failed to moderate transcript for session ${job.data.sessionId}. Error: ${err}`
    )
  }
}
