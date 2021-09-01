import { Job } from 'bull'
import logger from '../../../logger'
import MailService from '../../../services/MailService'
import { getVolunteers } from '../../../services/VolunteerService'
import { EMAIL_RECIPIENT } from '../../../utils/aggregation-snippets'

interface EmailFailedFirstAttemptedQuizJobData {
  category: string
  email: string
  firstName: string
  volunteerId: string
}

export default async (
  job: Job<EmailFailedFirstAttemptedQuizJobData>
): Promise<void> => {
  const {
    data: { category, email, firstName, volunteerId },
    name: currentJob
  } = job

  try {
    const [volunteer] = await getVolunteers({
      ...EMAIL_RECIPIENT,
      _id: volunteerId
    })
    // Only send email if vounteer is found to be a recipient
    if (volunteer) {
      await MailService.sendFailedFirstAttemptedQuiz({
        category,
        email,
        firstName
      })
      logger.info(`Sent ${currentJob} to volunteer ${volunteerId}`)
    }
  } catch (error) {
    throw new Error(
      `Failed to send ${currentJob} to volunteer ${volunteerId}: ${error}`
    )
  }
}
