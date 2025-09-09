import { Ulid } from '../../models/pgUtils'
import logger from '../../logger'
import * as UserService from '../../services/UserService'
import { sendAmbassadorCongratsEmail } from '../../services/MailService'
import { Job } from 'bull'
import { createEmailNotification } from '../../services/NotificationService'
import config from '../../config'

export type EmailAmbassadorCongratsJobData = {
  userId: Ulid
  firstName: string
  referralLink: string
}

export default async function (
  job: Job<EmailAmbassadorCongratsJobData>
): Promise<void> {
  const jobName = 'SendAmbassadorCongratsEmail'
  const emailTemplateId = config.sendgrid.ambassadorCongratsTemplate

  try {
    const user = await UserService.getUserContactInfo(job.data.userId)

    if (!user) {
      throw new Error(`${jobName}: No user exists with ID ${job.data.userId}`)
    }

    await sendAmbassadorCongratsEmail({
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      referralLink: UserService.getReferralSignUpLink(user.referralCode),
    })

    await createEmailNotification({
      userId: user.id,
      emailTemplateId,
    })
  } catch (err) {
    logger.error(
      {
        error: err,
        userId: job.data.userId,
      },
      `${jobName}: Failed to send Ambassador Congratulations Email to user: ${err}`
    )
  }
}
