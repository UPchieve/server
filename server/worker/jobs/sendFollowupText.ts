import { Job } from 'bull'
import { Jobs } from '.'
import { getSessionById } from '../../models/Session/queries'
import { Volunteer } from '../../models/Volunteer'
import { getVolunteerContactInfoById } from '../../models/Volunteer/queries'
import * as TwilioService from '../../services/TwilioService'
import * as sessionUtils from '../../utils/session-utils'
import { asObjectId } from '../../utils/type-utils'
import { log } from '../logger'

interface SendFollowupTextData {
  sessionId: string
  volunteerId: string
}

export default async (job: Job<SendFollowupTextData>): Promise<void> => {
  const sessionId = asObjectId(job.data.sessionId)
  const volunteerId = asObjectId(job.data.volunteerId)
  const session = await getSessionById(sessionId)
  if (!session) return
  const fulfilled = sessionUtils.isSessionFulfilled(session)
  if (fulfilled)
    return log(
      `Cancel ${Jobs.SendFollowupText} for ${sessionId} to ${volunteerId}: fulfilled`
    )
  const volunteer = await getVolunteerContactInfoById(volunteerId)
  if (!volunteer) return

  try {
    await TwilioService.sendFollowupText(
      sessionId,
      volunteerId,
      volunteer.phone as string
    )
    log(
      `Successfully sent followup for session ${session._id} to volunteer ${volunteer._id}`
    )
  } catch (error) {
    throw new Error(
      `Failed to send followup for session ${session._id} to volunteer ${volunteer._id}: ${error}`
    )
  }
}
