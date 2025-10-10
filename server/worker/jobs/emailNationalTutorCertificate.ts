import { Ulid } from '../../models/pgUtils'
import logger from '../../logger'
import * as UserService from '../../services/UserService'
import { sendNationalTutorCertificateEmail } from '../../services/MailService'
import { Job } from 'bull'

export type EmailNationalTutordCertificateJobData = {
  userId: Ulid
}

export default async function (
  job: Job<EmailNationalTutordCertificateJobData>
): Promise<void> {
  const jobName = job.name

  try {
    const user = await UserService.getUserContactInfo(job.data.userId)

    if (!user) {
      throw new Error(`${jobName}: No user exists with ID ${job.data.userId}`)
    }

    await sendNationalTutorCertificateEmail({
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
    })
  } catch (err) {
    logger.error(
      {
        error: err,
        userId: job.data.userId,
      },
      `${jobName}: Failed to send National Tutor Certification Email to user: ${err}`
    )
  }
}
