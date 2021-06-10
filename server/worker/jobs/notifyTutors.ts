import { Job } from 'bull'
import Session from '../../models/Session'
import * as SessionService from '../../services/SessionService'
import QueueService from '../../services/QueueService'
import TwilioService from '../../services/twilio'
import { getNotificationWithVolunteer } from '../../services/NotificationService'
import { Volunteer } from '../../models/Volunteer'
import { TOTAL_VOLUNTEERS_TO_TEXT_FOR_HELP } from '../../constants'
import { log } from '../logger'
import { Jobs } from '.'

interface NotifyTutorsJobData {
  sessionId: string
  notificationSchedule: number[]
}

export default async (job: Job<NotifyTutorsJobData>): Promise<void> => {
  const { sessionId, notificationSchedule } = job.data
  const session = await Session.findById(sessionId)
  if (!session) return
  const fulfilled = SessionService.isSessionFulfilled(session)
  if (fulfilled) {
    QueueService.add(Jobs.EmailVolunteerGentleWarning, {
      sessionId,
      notifications: session.notifications
    })
    return log(`Cancel ${Jobs.NotifyTutors} for ${sessionId}: fulfilled`)
  }
  const delay = notificationSchedule.shift()
  if (delay)
    job.queue.add(
      Jobs.NotifyTutors,
      { sessionId, notificationSchedule },
      { delay }
    )

  // calculate number of ms since session started
  const createdAt = session.createdAt.getTime()
  const now = Date.now()
  const ageOfSession = now - createdAt
  const sixMinutes = 60 * 1000 * 6

  // if it's been longer than 6 minutes, or if we've notified 15 volunteers, resend notifications in the same order
  // 6 minutes is the point at which we would have notified 15 volunteers if there were 15 to notify
  if (
    session.notifications.length >= TOTAL_VOLUNTEERS_TO_TEXT_FOR_HELP ||
    ageOfSession >= sixMinutes
  ) {
    // Wrap around the notifications list to get a notification we've sent before
    const notificationId =
      session.notifications[
        session.notifications.length % TOTAL_VOLUNTEERS_TO_TEXT_FOR_HELP
      ]
    const notification = await getNotificationWithVolunteer(notificationId)
    const volunteer = notification.volunteer as Volunteer

    try {
      await TwilioService.sendFollowupText({
        session,
        volunteerId: volunteer._id,
        volunteerPhone: volunteer.phone
      })
      log(
        `Successfully ${Jobs.NotifyTutors} for session ${session._id}: follow-up to volunteer ${volunteer._id}`
      )
    } catch (error) {
      throw new Error(
        `Failed to ${Jobs.NotifyTutors} for session ${session._id}: ${error}`
      )
    }
  } else {
    try {
      const volunteerNotified = await TwilioService.notifyVolunteer(session)

      if (volunteerNotified)
        log(
          `Successfully ${Jobs.NotifyTutors} for session ${session._id}: volunteer ${volunteerNotified._id}`
        )
      else
        log(
          `Unable to ${Jobs.NotifyTutors} for session ${session._id}: no volunteers available`
        )
    } catch (error) {
      throw new Error(
        `Failed to ${Jobs.NotifyTutors} for session ${session._id}: ${error}`
      )
    }
  }
}
