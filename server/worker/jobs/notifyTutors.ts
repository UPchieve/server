import { Job } from 'bull'

import { getSessionById } from '../../models/Session/queries'
import * as sessionUtils from '../../utils/session-utils'
import QueueService from '../../services/QueueService'
import * as TwilioService from '../../services/TwilioService'
import { log } from '../logger'
import { Jobs } from '.'
import { asObjectId } from '../../utils/type-utils'

interface NotifyTutorsJobData {
  sessionId: string
  notificationSchedule: number[]
}

export default async (job: Job<NotifyTutorsJobData>): Promise<void> => {
  const sessionId = asObjectId(job.data.sessionId)
  const notificationSchedule = job.data.notificationSchedule
  const session = await getSessionById(sessionId)
  if (!session) return
  const fulfilled = sessionUtils.isSessionFulfilled(session)
  if (fulfilled) {
    QueueService.add(Jobs.EmailVolunteerGentleWarning, {
      sessionId,
      notifications: session.notifications,
    })
    return log(`Cancel ${Jobs.NotifyTutors} for ${sessionId}: fulfilled`)
  }
  const delay = notificationSchedule.shift()
  if (delay)
    QueueService.add(
      Jobs.NotifyTutors,
      { sessionId: sessionId.toString(), notificationSchedule },
      { delay }
    )

  try {
    const volunteerNotified = await TwilioService.notifyVolunteer(session)

    if (volunteerNotified) {
      log(
        `Successfully sent notification for session ${session._id} to volunteer ${volunteerNotified}`
      )
      // send a followup text to the volunteer in 5 mins
      QueueService.add(
        Jobs.SendFollowupText,
        {
          sessionId: sessionId.toString(),
          volunteerId: volunteerNotified.toString(),
        },
        { delay: 1000 * 60 * 5 }
      )
    } else
      log(
        `Unable to send notification for session ${session._id}: no volunteers available`
      )
  } catch (error) {
    throw new Error(
      `Failed to send notification for session ${session._id}: ${error}`
    )
  }
}
