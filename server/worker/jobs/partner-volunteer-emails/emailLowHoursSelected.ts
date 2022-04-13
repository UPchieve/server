import { Job } from 'bull'
import { log } from '../../logger'
import * as MailService from '../../../services/MailService'
import { getNotificationsByVolunteerId } from '../../../models/Notification/queries'
import { getPartnerVolunteerForLowHours } from '../../../models/Volunteer/queries'
import countAvailabilitySelected from '../../../utils/count-availability-selected'
import { asString } from '../../../utils/type-utils'

/**
 *
 * conditions for sending email:
 * - partner-referred volunteer who completed their onboarding 10 days ago
 * - has less than 5 hours of availability selected
 * - has received less than 2 text messages
 * - has had less than 2 sessions
 *
 */

interface EmailLowHoursJobData {
  volunteerId: string
}

export default async (job: Job<EmailLowHoursJobData>): Promise<void> => {
  const {
    data: { volunteerId },
    name: currentJob,
  } = job
  const volunteer = await getPartnerVolunteerForLowHours(asString(volunteerId))

  if (volunteer) {
    const { id, firstName, email, availability } = volunteer
    const textNotifications = await getNotificationsByVolunteerId(id)
    const totalHoursSelected = countAvailabilitySelected(availability)

    if (textNotifications.length < 2 && totalHoursSelected < 5) {
      try {
        await MailService.sendPartnerVolunteerLowHoursSelected(email, firstName)
        log(`Sent ${currentJob} to volunteer ${volunteerId}`)
      } catch (error) {
        throw new Error(
          `Failed to send ${currentJob} to volunteer ${volunteerId}: ${error}`
        )
      }
    }
  }
}
