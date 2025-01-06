import { Ulid } from '../models/pgUtils'
import { Job } from 'bull'
import * as SessionService from '../services/SessionService'
import * as ModerationService from '../services/ModerationService'
import config from '../config'

export interface ModerateSessionTranscriptJobData {
  sessionId: Ulid
}

export default async function(jobData: Job<ModerateSessionTranscriptJobData>) {
  const transcript = await SessionService.getSessionTranscript(
    jobData.data.sessionId
  )
  const result = await ModerationService.moderateTranscript(transcript)
  console.log('Transcript moderation result', JSON.stringify(result, null, 2))
  const confidenceThreshold = config.contextualModerationConfidenceThreshold
  if (result.confidence >= confidenceThreshold) {
    console.log('Flagging session for review')
    // @TODO: Flag the session and mark for review
  }
}
