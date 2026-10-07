import { Ulid } from '../../models/pgUtils'
import logger from '../../logger'
import * as UserService from '../../services/UserService'
import { sendBecomeAnAmbassadorEmail } from '../../services/MailService'
import { Job } from 'bull'

export type EmailBecomeAnAmbassadorJobData = {
  userId: Ulid
}

export default async function (
  job: Job<EmailBecomeAnAmbassadorJobData>
): Promise<void> {
  const jobName = 'SendBecomeAnAmbassadorEmail'
  try {
    const user = await UserService.getUserContactInfo(job.data.userId)
    if (!user) {
      throw new Error(
        `${jobName}: No active user exists with ID ${job.data.userId}`
      )
    }
    await sendBecomeAnAmbassadorEmail({
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      referralSignUpLink: UserService.getReferralSignUpLink(user.referralCode),
    })
  } catch (err) {
    logger.error(
      {
        error: err,
        userId: job.data.userId,
      },
      `${jobName}: Failed to send Become An Ambassador email to user: ${err}`
    )
    throw err
  }
}
