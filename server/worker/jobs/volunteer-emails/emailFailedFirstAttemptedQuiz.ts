import { Job } from 'bull'
import { Types } from 'mongoose'
import logger from '../../../logger'
import * as MailService from '../../../services/MailService'
import { getVolunteerContactInfoById } from '../../../models/Volunteer/queries'
import { asObjectId } from '../../../utils/type-utils'

interface EmailFailedFirstAttemptedQuizJobData {
  category: string
  email: string
  firstName: string
  volunteerId: Types.ObjectId
}

export default async (
  job: Job<EmailFailedFirstAttemptedQuizJobData>
): Promise<void> => {
  const {
    data: { category, email, firstName },
    name: currentJob,
  } = job
  const volunteerId = asObjectId(job.data.volunteerId)
  try {
    const volunteer = await getVolunteerContactInfoById(volunteerId)
    // Only send email if vounteer is found to be a recipient
    if (volunteer) {
      await MailService.sendFailedFirstAttemptedQuiz(category, email, firstName)
      logger.info(`Sent ${currentJob} to volunteer ${volunteerId}`)
    }
  } catch (error) {
    throw new Error(
      `Failed to send ${currentJob} to volunteer ${volunteerId}: ${error}`
    )
  }
}
