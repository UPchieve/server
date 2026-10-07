import { Job } from 'bull'
import logger from '../../../logger'
import * as MailService from '../../../services/MailService'
import { asString } from '../../../utils/type-utils'
import { Ulid } from '../../../models/pgUtils'
import { getUserContactInfo } from '../../../services/UserService'

export type EmailFallIncentiveEnrollmentWelcomeJobData = {
  userId: Ulid
}

export default async (
  job: Job<EmailFallIncentiveEnrollmentWelcomeJobData>
): Promise<void> => {
  const userId = asString(job.data.userId)
  const user = await getUserContactInfo(userId)
  if (!user) return

  const { firstName, email, proxyEmail } = user
  try {
    await MailService.sendFallIncentiveEnrollmentWelcomeEmail(
      proxyEmail ?? email,
      firstName
    )
    logger.info(`Sent ${job.name} to student ${userId}`)
  } catch (error) {
    throw new Error(`Failed to send ${job.name} to student ${userId}: ${error}`)
  }
}
