import { Job } from 'bull'
import { EVENTS } from '../../constants'
import { getUserContactInfoById } from '../../models/User'
import { captureEvent } from '../../services/AnalyticsService'
import * as TwilioService from '../../services/TwilioService'
import { asString } from '../../utils/type-utils'

export type ProcrastinationTextReminderJob = {
  userId: string
}

export default async (
  job: Job<ProcrastinationTextReminderJob>
): Promise<void> => {
  const userId = asString(job.data.userId)
  const user = await getUserContactInfoById(userId)
  if (!user || !user.phone) return

  try {
    const messageId = await TwilioService.sendProcrastinationTextReminder(
      user.id,
      user.firstName,
      user.phone
    )
    if (messageId)
      captureEvent(
        user.id,
        EVENTS.STUDENT_PROCRASTINATION_PREVENTION_REMINDER_SENT,
        {
          event: EVENTS.STUDENT_PROCRASTINATION_PREVENTION_REMINDER_SENT,
        }
      )
  } catch (error) {
    throw new Error(
      `Failed to send procrastination reminder text to student: ${user.id}. Error: ${error}`
    )
  }
}
