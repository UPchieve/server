import { Job } from 'bull'
import { log } from '../../logger'
import * as MailService from '../../../services/MailService'
import { getNotificationsByVolunteerId } from '../../../models/Notification/queries'
import { getPartnerVolunteerForCollege } from '../../../models/Volunteer/queries'
import { asObjectId } from '../../../utils/type-utils'

/**
 *
 * conditions for sending email:
 * - partner volunteer who completed their onboarding 15 days ago
 * - is only certified in college counseling subjects
 * - has received less than 2 text messages
 *
 */

interface EmailOnlyCollegeCertsJobData {
  volunteerId: string
}

export default async (
  job: Job<EmailOnlyCollegeCertsJobData>
): Promise<void> => {
  const {
    data: { volunteerId },
    name: currentJob,
  } = job

  const volunteer = await getPartnerVolunteerForCollege(asObjectId(volunteerId))

  if (volunteer) {
    const { _id, firstname, email } = volunteer
    const textNotifications = await getNotificationsByVolunteerId(_id)

    if (textNotifications.length < 2) {
      try {
        await MailService.sendPartnerVolunteerOnlyCollegeCerts(email, firstname)
        log(`Sent ${currentJob} to volunteer ${volunteerId}`)
      } catch (error) {
        throw new Error(
          `Failed to send ${currentJob} to volunteer ${volunteerId}: ${error}`
        )
      }
    }
  }
}
