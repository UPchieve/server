import { Ulid } from '../../models/pgUtils'
import { Job } from 'bull'
import * as SessionService from '../../services/SessionService'
import * as ModerationService from '../../services/ModerationService'

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
    if (moderationResults.reasons.length) {
      const sessionFlags = moderationResults.reasons.map((r) =>
        ModerationService.getSessionFlagByModerationReason(r)
      )
      await ModerationService.markSessionForReview(
        job.data.sessionId,
        sessionFlags
      )
    }
  } catch (err) {
    throw new Error(
      `Failed to moderate transcript for session ${job.data.sessionId}. Error: ${err}`
    )
  }
}
