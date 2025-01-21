import { Job } from 'bull'
import { CensoredSessionMessage } from '../models/CensoredSessionMessage'
import { getIndividualSessionMessageModerationResponse } from '../services/ModerationService'

export interface ModerationSessionMessageJobData {
  censoredSessionMessage: CensoredSessionMessage
  isVolunteer: boolean
}

/**
 * Sends the given message to OpenAI to get back a moderation decision
 * and reason.
 * Also logs the decision reason(s) to NR.
 */
export default async function moderateSessionMessage(
  job: Job<ModerationSessionMessageJobData>
) {
  await getIndividualSessionMessageModerationResponse({
    censoredSessionMessage: job.data.censoredSessionMessage,
    isVolunteer: job.data.isVolunteer,
  })
}
