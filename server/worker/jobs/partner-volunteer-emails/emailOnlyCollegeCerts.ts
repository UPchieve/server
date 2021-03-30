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

/**
 *
 * conditions for sending email:
 * - partner volunteer who completed their onboarding 15 days ago
 * - is only certified in college counseling subjects
 * - has received less than 2 text messages
 *
 */
export default async (
  job: Job<{
    volunteerId: string | Types.ObjectId
  }>
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
      isDeactivated: false,
      isOnboarded: true,
      subjects: { $nin: nonCollegeSubjects },
      volunteerPartnerOrg: { $exists: true }
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
        logger.error(
          `Failed to send ${currentJob} to volunteer ${volunteerId}: ${error}`
        )
      }
    }
  }
}
