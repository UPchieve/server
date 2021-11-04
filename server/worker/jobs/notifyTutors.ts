import { Job } from 'bull'

import { getSessionById } from '../../models/Session/queries'
import * as sessionUtils from '../../utils/session-utils'
import QueueService from '../../services/QueueService'
import * as TwilioService from '../../services/TwilioService'
import { getNotificationWithVolunteer } from '../../models/Notification/queries'
import { Volunteer } from '../../models/Volunteer'
import { TOTAL_VOLUNTEERS_TO_TEXT_FOR_HELP } from '../../constants'
import { log } from '../logger'
import { Jobs } from '.'
import { getIdFromModelReference } from '../../utils/model-reference'
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
    job.queue.add(
      Jobs.NotifyTutors,
      { sessionId: sessionId.toString(), notificationSchedule },
      { delay }
    )

  // calculate number of ms since session started
  const createdAt = session.createdAt.getTime()
  const now = Date.now()
  const ageOfSession = now - createdAt
  const sixMinutes = 60 * 1000 * 6

  // calculate number of unique volunteers notified
  const uniqueRecipients = new Set()
  try {
    for (const n of session.notifications) {
      const id = getIdFromModelReference(n)
      const notification = await getNotificationWithVolunteer(id)
      uniqueRecipients.add((notification.volunteer as Volunteer)._id.toString())
    }
  } catch (error) {
    throw new Error(
      `Failed to compute number of unique volunteers notified for session ${session._id}: ${error}`
    )
  }
  const uniqueVolunteersNotified = uniqueRecipients.size

  // if it's been longer than 6 minutes, or if we've notified 15 volunteers, resend notifications in the same order
  // 6 minutes is the point at which we would have notified 15 volunteers if there were 15 to notify
  if (
    uniqueVolunteersNotified === TOTAL_VOLUNTEERS_TO_TEXT_FOR_HELP ||
    ageOfSession >= sixMinutes
  ) {
    // Never send more than 2 texts per person
    if (session.notifications.length >= 2 * uniqueVolunteersNotified) return
    // Wrap around the notifications list to get a notification we've sent before
    const notification =
      session.notifications[
        session.notifications.length % uniqueVolunteersNotified
      ]
    const id = getIdFromModelReference(notification)
    try {
      const notification = await getNotificationWithVolunteer(id)
      const volunteer = notification.volunteer as Volunteer

      await TwilioService.sendFollowupText(
        session._id,
        volunteer._id,
        volunteer.phone as string
      )

      log(
        `Successfully sent follow up for session ${session._id} to volunteer ${volunteer._id}`
      )
    } catch (error) {
      throw new Error(
        `Failed to send follow up for session ${session._id}: ${error}`
      )
    }
  } else {
    try {
      const volunteerNotified = await TwilioService.notifyVolunteer(session)

      if (volunteerNotified) {
        log(
          `Successfully sent notification for session ${session._id} to volunteer ${volunteerNotified}`
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
}
