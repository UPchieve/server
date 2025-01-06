import { Ulid } from '../models/pgUtils'
import { Job } from 'bull'
import * as SessionService from '../services/SessionService'
import * as ModerationService from '../services/ModerationService'

export interface ModerateSessionTranscriptJobData {
  sessionId: Ulid
}

export default async function(jobData: Job<ModerateSessionTranscriptJobData>) {
  const transcript = await SessionService.getSessionTranscript(
    jobData.data.sessionId
  )
  // @TODO batch transcript into chunks
  const result = await ModerationService.moderateTranscript(transcript)
  console.log('Transcript moderation result', JSON.stringify(result, null, 2))
}
