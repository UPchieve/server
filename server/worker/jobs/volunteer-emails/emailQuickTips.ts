import { Job } from 'bull'
import { log } from '../../logger'
import * as MailService from '../../../services/MailService'
import { getNotificationsByVolunteerId } from '../../../models/Notification/queries'
import { getVolunteerForQuickTips } from '../../../models/Volunteer/queries'
import countAvailabilitySelected from '../../../utils/count-availability-selected'
import { asString } from '../../../utils/type-utils'

interface EmailQuickTipsJobData {
  volunteerId: string
}

export default async (job: Job<EmailQuickTipsJobData>): Promise<void> => {
  const { name: currentJob } = job
  const volunteerId = asString(job.data.volunteerId)
  const volunteer = await getVolunteerForQuickTips(volunteerId)

  if (volunteer) {
    const { id, firstName, email, availability } = volunteer
    const textNotifications = await getNotificationsByVolunteerId(id)

    if (
      textNotifications.length === 0 &&
      countAvailabilitySelected(availability)
    ) {
      try {
        await MailService.sendVolunteerQuickTips(email, firstName)
        log(`Sent ${currentJob} to volunteer ${volunteerId}`)
      } catch (error) {
        throw new Error(
          `Failed to send ${currentJob} to volunteer ${volunteerId}: ${error}`
        )
      }
    }
  }
}
