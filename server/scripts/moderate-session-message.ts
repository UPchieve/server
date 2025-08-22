import { Job } from 'bull'
import { CensoredSessionMessage } from '../models/CensoredSessionMessage'
import {
  getIndividualSessionMessageModerationResponse,
  LangfuseTraceName,
} from '../services/ModerationService'
import * as LangfuseService from '../services/LangfuseService'

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
  const trace = LangfuseService.getClient().trace({
    name: LangfuseTraceName.MODERATE_SESSION_MESSAGE,
    metadata: {
      sessionId: job.data.censoredSessionMessage.sessionId,
      userId: job.data.censoredSessionMessage.senderId,
      isVolunteer: job.data.isVolunteer,
    },
  })
  await getIndividualSessionMessageModerationResponse({
    censoredSessionMessage: job.data.censoredSessionMessage,
    isVolunteer: job.data.isVolunteer,
    trace,
  })
}
