import { Ulid } from '../../models/pgUtils'
import logger from '../../logger'
import * as UserService from '../../services/UserService'
import { sendReferralSignUpCelebrationEmail } from '../../services/MailService'
import { Job } from 'bull'

export type EmailReferralSignUpCelebrationJobData = {
  userId: Ulid
  referredFirstName: string
}

export default async function (
  job: Job<EmailReferralSignUpCelebrationJobData>
): Promise<void> {
  const jobName = 'SendReferralSignUpCelebrationEmail'

  try {
    const user = await UserService.getUserContactInfo(job.data.userId)

    if (!user) {
      throw new Error(
        `${jobName}: No active user exists with ID ${job.data.userId}`
      )
    }

    await sendReferralSignUpCelebrationEmail({
      userId: user.id,
      email: user.email,
      referrerFirstName: user.firstName,
      referredFirstName: job.data.referredFirstName,
      referralSignUpLink: UserService.getReferralSignUpLink(user.referralCode),
    })
  } catch (err) {
    logger.error(
      {
        error: err,
        userId: job.data.userId,
      },
      `${jobName}: Failed to send Referral SignUp Celebration Email to user: ${err}`
    )
  }
}
