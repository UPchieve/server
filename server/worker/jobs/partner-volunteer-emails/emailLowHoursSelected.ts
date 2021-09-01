import { Job } from 'bull'
import { Types } from 'mongoose'
import logger from '../../../logger'
import MailService from '../../../services/MailService'
import { getNotifications } from '../../../services/NotificationService'
import { getVolunteer } from '../../../services/UserService'
import countAvailabilitySelected from '../../../utils/count-availability-selected'
import { EMAIL_RECIPIENT } from '../../../utils/aggregation-snippets'

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
  volunteerId: string | Types.ObjectId
}

export default async (job: Job<EmailLowHoursJobData>): Promise<void> => {
  const {
    data: { volunteerId },
    name: currentJob
  } = job
  const volunteer = await getVolunteer(
    {
      _id: volunteerId,
      isOnboarded: true,
      'pastSessions.1': { $exists: false },
      volunteerPartnerOrg: { $exists: true },
      ...EMAIL_RECIPIENT
    },
    {
      _id: 1,
      email: 1,
      firstname: 1,
      availability: 1
    }
  )

  if (volunteer) {
    const { _id, firstname: firstName, email, availability } = volunteer
    const textNotifications = await getNotifications({ volunteer: _id })
    const totalHoursSelected = countAvailabilitySelected(
      // @ts-expect-error
      availability.toObject()
    )

    if (textNotifications.length < 2 && totalHoursSelected < 5) {
      try {
        const contactInfo = { firstName, email }
        await MailService.sendPartnerVolunteerLowHoursSelected(contactInfo)
        logger.info(`Sent ${currentJob} to volunteer ${volunteerId}`)
      } catch (error) {
        throw new Error(
          `Failed to send ${currentJob} to volunteer ${volunteerId}: ${error}`
        )
      }
    }
  }
}
