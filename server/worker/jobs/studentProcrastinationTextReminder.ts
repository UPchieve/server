import { Job } from 'bull'
import { getUserContactInfoById } from '../../models/User'
import * as TwilioService from '../../services/TwilioService'
import { asString } from '../../utils/type-utils'

type ProcrastinationTextReminderJob = {
  userId: string
}

export default async (
  job: Job<ProcrastinationTextReminderJob>
): Promise<void> => {
  const userId = asString(job.data.userId)
  const user = await getUserContactInfoById(userId)
  if (!user || !user.phone) return

  try {
    await TwilioService.sendProcrastinationTextReminder(
      user.id,
      user.firstName,
      user.phone
    )
  } catch (error) {
    throw new Error(
      `Failed to send reminder text to student: ${user.id}. Error: ${error}`
    )
  }
}
