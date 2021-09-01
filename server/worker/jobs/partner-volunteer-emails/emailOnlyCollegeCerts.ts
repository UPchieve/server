import { Job } from 'bull'
import { Types } from 'mongoose'
import {
  MATH_SUBJECTS,
  SCIENCE_SUBJECTS,
  SAT_SUBJECTS
} from '../../../constants'
import logger from '../../../logger'
import MailService from '../../../services/MailService'
import { getNotifications } from '../../../services/NotificationService'
import { getVolunteer } from '../../../services/UserService'
import { EMAIL_RECIPIENT } from '../../../utils/aggregation-snippets'

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
  const nonCollegeSubjects = [
    ...Object.values(MATH_SUBJECTS),
    ...Object.values(SCIENCE_SUBJECTS),
    ...Object.values(SAT_SUBJECTS)
  ]
  const volunteer = await getVolunteer(
    {
      _id: volunteerId,
      isOnboarded: true,
      subjects: { $nin: nonCollegeSubjects },
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
    const { _id, firstname: firstName, email } = volunteer
    const textNotifications = await getNotifications({ volunteer: _id })

    if (textNotifications.length < 2) {
      try {
        const contactInfo = { firstName, email }
        await MailService.sendPartnerVolunteerOnlyCollegeCerts(contactInfo)
        logger.info(`Sent ${currentJob} to volunteer ${volunteerId}`)
      } catch (error) {
        throw new Error(
          `Failed to send ${currentJob} to volunteer ${volunteerId}: ${error}`
        )
      }
    }
  }
}
