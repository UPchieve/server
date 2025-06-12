import { Ulid } from '../../models/pgUtils'
import logger from '../../logger'
import * as UserService from '../../services/UserService'
import { sendReferralSignupCelebrationEmail } from '../../services/MailService'
import { Job } from 'bull'
import config from '../../config'

export type EmailReferralSignupCelebrationJobData = {
  userId: Ulid
  referredFirstName: string
}

export default async function (
  job: Job<EmailReferralSignupCelebrationJobData>
): Promise<void> {
  const jobName = 'SendReferralSignupCelebrationEmail'

  try {
    const user = await UserService.getUserContactInfo(job.data.userId)

    if (!user) {
      throw new Error(`${jobName}: No user exists with ID ${job.data.userId}`)
    }

    await sendReferralSignupCelebrationEmail({
      userId: user.id,
      email: user.email,
      referrerFirstName: user.firstName,
      referredFirstName: job.data.referredFirstName,
      referralSignupLink: getReferralSignUpLink(user.referralCode),
    })
  } catch (err) {
    logger.error(
      {
        error: err,
        userId: job.data.userId,
      },
      `${jobName}: Failed to send Referral Signup Celebration Email to user: ${err}`
    )
  }
}

function getReferralSignUpLink(referralCode: string): string {
  return `${config.protocol}://${config.host}/referral/${referralCode}`
}
