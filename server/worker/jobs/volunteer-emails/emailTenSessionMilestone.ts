import { Job } from 'bull'
import { log } from '../../logger'
import * as MailService from '../../../services/MailService'
import { getSessionsVolunteerRating } from '../../../models/Session'
import { getVolunteerContactInfoById } from '../../../models/Volunteer'
import { asString } from '../../../utils/type-utils'
import {
  createEmailNotification,
  hasUserBeenSentEmail,
} from '../../../services/NotificationService'
import config from '../../../config'
import { Uuid } from '../../../models/pgUtils'

/**
 *
 * conditions for sending the email:
 * - volunteer who has had 10 sessions
 *
 */

interface EmailTenSessionJobData {
  volunteerId: Uuid
}

export default async (job: Job<EmailTenSessionJobData>): Promise<void> => {
  const currentJob = job.name
  const volunteerId = asString(job.data.volunteerId)
  const volunteer = await getVolunteerContactInfoById(volunteerId, {
    deactivated: false,
    testUser: false,
    banned: false,
  })
  // Do not send email if volunteer does not match email recipient spec
  if (!volunteer) return log(`No volunteer found with id ${volunteerId}`)

  const emailTemplateId = config.sendgrid.volunteerTenSessionMilestoneTemplate
  const hasReceivedEmail = await hasUserBeenSentEmail({
    userId: volunteer.id,
    emailTemplateId,
  })
  if (hasReceivedEmail)
    return log(`Volunteer ${volunteer.id} has already received ${currentJob}`)

  const sessions = await getSessionsVolunteerRating(volunteerId)
  if (sessions.length === 10) {
    try {
      await MailService.sendVolunteerTenSessionMilestone(
        volunteer.email,
        volunteer.firstName
      )
      await createEmailNotification({
        userId: volunteer.id,
        emailTemplateId,
      })
      log(`Sent ${currentJob} to volunteer ${volunteerId}`)
    } catch (error) {
      throw new Error(
        `Failed to send ${currentJob} to volunteer ${volunteerId}: ${error}`
      )
    }
  }
}
