import { Job } from 'bull'
import { Types } from 'mongoose'
import logger from '../../../logger'
import * as MailService from '../../../services/MailService'
import { getNotificationsByVolunteerId } from '../../../models/Notification/queries'
import { getPartnerVolunteerForCollege } from '../../../models/Volunteer/queries'

/**
 *
 * conditions for sending email:
 * - partner volunteer who completed their onboarding 15 days ago
 * - is only certified in college counseling subjects
 * - has received less than 2 text messages
 *
 */

interface EmailOnlyCollegeCertsJobData {
  volunteerId: string | Types.ObjectId
}

export default async (
  job: Job<EmailOnlyCollegeCertsJobData>
): Promise<void> => {
  const {
    data: { volunteerId },
    name: currentJob
  } = job

  const volunteer = await getPartnerVolunteerForCollege(volunteerId)

  if (volunteer) {
    const { _id, firstname, email } = volunteer
    const textNotifications = await getNotificationsByVolunteerId(_id)

    if (textNotifications.length < 2) {
      try {
        await MailService.sendPartnerVolunteerOnlyCollegeCerts(email, firstname)
        logger.info(`Sent ${currentJob} to volunteer ${volunteerId}`)
      } catch (error) {
        throw new Error(
          `Failed to send ${currentJob} to volunteer ${volunteerId}: ${error}`
        )
      }
    }
  }
}
