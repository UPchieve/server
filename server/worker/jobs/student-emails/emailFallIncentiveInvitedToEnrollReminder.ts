import { Job } from 'bull'
import { log } from '../../logger'
import * as MailService from '../../../services/MailService'
import { asString } from '../../../utils/type-utils'
import { Ulid } from '../../../models/pgUtils'
import { getUserContactInfoById } from '../../../models/User'
import { Jobs } from '..'

export type EmailFallIncentiveInvitedToEnrollReminderJobData = {
  userId: Ulid
}

export default async (
  job: Job<EmailFallIncentiveInvitedToEnrollReminderJobData>
): Promise<void> => {
  const userId = asString(job.data.userId)
  const user = await getUserContactInfoById(userId)
  if (!user) return

  const { firstName, email } = user
  try {
    await MailService.sendFallIncentiveInvitedToEnrollReminderEmail(
      email,
      firstName
    )
    log(
      `Sent ${Jobs.EmailFallIncentiveInvitedToEnrollReminder} to student ${userId}`
    )
  } catch (error) {
    throw new Error(
      `Failed to send ${Jobs.EmailFallIncentiveInvitedToEnrollReminder} to student ${userId}: ${error}`
    )
  }
}
