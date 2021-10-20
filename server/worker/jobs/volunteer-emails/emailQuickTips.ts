import { Job } from 'bull'
import { Types } from 'mongoose'
import logger from '../../../logger'
import MailService from '../../../services/MailService'
import { getNotifications } from '../../../services/NotificationService'
import { getVolunteerForQuickTips } from '../../../models/Volunteer/queries'
import countAvailabilitySelected from '../../../utils/count-availability-selected'

interface EmailQuickTipsJobData {
  volunteerId: string | Types.ObjectId
}

export default async (job: Job<EmailQuickTipsJobData>): Promise<void> => {
  const {
    data: { volunteerId },
    name: currentJob
  } = job
  const volunteer = await getVolunteerForQuickTips(volunteerId)

  if (volunteer) {
    const { _id, firstname: firstName, email, availability } = volunteer
    const textNotifications = await getNotifications({ volunteer: _id })

    if (
      textNotifications.length === 0 &&
      countAvailabilitySelected(availability)
    ) {
      try {
        const contactInfo = { firstName, email }
        await MailService.sendVolunteerQuickTips(contactInfo)
        logger.info(`Sent ${currentJob} to volunteer ${volunteerId}`)
      } catch (error) {
        throw new Error(
          `Failed to send ${currentJob} to volunteer ${volunteerId}: ${error}`
        )
      }
    }
  }
}
