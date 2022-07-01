import { Job } from 'bull'
import { log } from '../../logger'
import * as MailService from '../../../services/MailService'
import { getSessionsVolunteerRating } from '../../../models/Session'
import { getVolunteerContactInfoById } from '../../../models/Volunteer'
import { USER_SESSION_METRICS, FEEDBACK_VERSIONS } from '../../../constants'
import { asString } from '../../../utils/type-utils'

/**
 *
 * conditions for sending the email:
 * - volunteer who has had 10 sessions
 *
 */

interface EmailTenSessionJobData {
  volunteerId: string
}

export default async (job: Job<EmailTenSessionJobData>): Promise<void> => {
  const currentJob = job.name
  const volunteerId = asString(job.data.volunteerId)
  const volunteer = await getVolunteerContactInfoById(volunteerId)
  // Do not send email if volunteer does not match email recipient spec
  if (!volunteer) return

  const sessions = await getSessionsVolunteerRating(volunteerId)

  if (sessions.length === 10) {
    try {
      await MailService.sendVolunteerTenSessionMilestone(
        volunteer.email,
        volunteer.firstName
      )
      log(`Sent ${currentJob} to volunteer ${volunteerId}`)
    } catch (error) {
      throw new Error(
        `Failed to send ${currentJob} to volunteer ${volunteerId}: ${error}`
      )
    }
  }
}
