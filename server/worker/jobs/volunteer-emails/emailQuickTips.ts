import { Job } from 'bull'
import { Types } from 'mongoose'
import logger from '../../../logger'
import * as MailService from '../../../services/MailService'
import { getNotifications } from '../../../services/NotificationService'
import { getVolunteer } from '../../../services/UserService'
import countAvailabilitySelected from '../../../utils/count-availability-selected'
import { Volunteer } from '../../../models/Volunteer'

interface EmailQuickTipsJobData {
  volunteerId: string | Types.ObjectId
}

export default async (job: Job<EmailQuickTipsJobData>): Promise<void> => {
  const {
    data: { volunteerId },
    name: currentJob
  } = job
  let volunteer = await getVolunteer(
    {
      _id: volunteerId,
      isDeactivated: false,
      isOnboarded: true
    },
    {
      _id: 1,
      email: 1,
      firstname: 1,
      availability: 1
    }
  )

  if (volunteer !== null) {
    const textNotifications = await getNotifications({ volunteer: volunteer._id })

    if (
      textNotifications.length === 0 &&
      countAvailabilitySelected(volunteer.availability)
    ) {
      try {
        await MailService.sendVolunteerQuickTips(volunteer.email, volunteer.firstname)
        logger.info(`Sent ${currentJob} to volunteer ${volunteerId}`)
      } catch (error) {
        throw new Error(
          `Failed to send ${currentJob} to volunteer ${volunteerId}: ${error}`
        )
      }
    }
  }
}
