import { Ulid } from '../models/pgUtils'
import { Job } from 'bull'

export interface ModerateSessionTranscriptJobData {
  sessionId: Ulid
}

export default async function(jobData: Job<ModerateSessionTranscriptJobData>) {
  console.log('Executing moderateSessionTranscript')
}
