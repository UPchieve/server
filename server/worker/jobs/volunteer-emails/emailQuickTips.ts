import { Job } from 'bull'
import { Types } from 'mongoose'
import logger from '../../../logger'
import * as MailService from '../../../services/MailService'
import { getNotificationsByVolunteerId } from '../../../models/Notification/queries'
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
    const { _id, firstname, email, availability } = volunteer
    const textNotifications = await getNotificationsByVolunteerId(_id)

    if (
      textNotifications.length === 0 &&
      countAvailabilitySelected(availability)
    ) {
      try {
        await MailService.sendVolunteerQuickTips(email, firstname)
        logger.info(`Sent ${currentJob} to volunteer ${volunteerId}`)
      } catch (error) {
        throw new Error(
          `Failed to send ${currentJob} to volunteer ${volunteerId}: ${error}`
        )
      }
    }
  }
}
