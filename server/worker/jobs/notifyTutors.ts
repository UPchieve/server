import { Job } from 'bull'

import { getSessionById } from '../../models/Session/queries'
import * as sessionUtils from '../../utils/session-utils'
import QueueService from '../../services/QueueService'
import * as NotifyVolunteerService from '../../services/NotifyVolunteerService'
import { log } from '../logger'
import { Jobs } from '.'
import { asString } from '../../utils/type-utils'
import { minutesInMs } from '../../utils/time-utils'

interface NotifyTutorsJobData {
  sessionId: string
  notificationSchedule: number[]
  currentNotificationRound: number
}

export default async (job: Job<NotifyTutorsJobData>): Promise<void> => {
  const sessionId = asString(job.data.sessionId)
  const notificationSchedule = job.data.notificationSchedule
  const currentNotificationRound = job.data.currentNotificationRound

  const session = await getSessionById(sessionId)
  const fulfilled = sessionUtils.isSessionFulfilled(session)
  if (fulfilled) {
    return log(`Cancel ${Jobs.NotifyTutors} for ${sessionId}: fulfilled`)
  }
  const delay = notificationSchedule.shift()
  if (delay)
    await QueueService.add(
      Jobs.NotifyTutors,
      { delay, removeOnFail: true },
      {
        sessionId: sessionId.toString(),
        notificationSchedule,
        currentNotificationRound: currentNotificationRound + 1,
      }
    )

  try {
    const volunteerNotified =
      await NotifyVolunteerService.notifyVolunteer(session)

    if (volunteerNotified) {
      log(
        `Successfully sent notification for session ${session.id} to volunteer ${volunteerNotified}`
      )
      // send a followup text to the volunteer in 5 mins
      await QueueService.add(
        Jobs.SendFollowupText,
        { delay: minutesInMs(5), removeOnFail: true },
        {
          sessionId: sessionId.toString(),
          volunteerId: volunteerNotified.toString(),
        }
      )
    } else {
      log(
        `No volunteers available for session in ${session.subject}, on notification round ${currentNotificationRound} (session ID ${session.id})`
      )
    }
  } catch (error) {
    throw new Error(
      `Failed to send notification for session ${session.id}: ${error}`
    )
  }
}
