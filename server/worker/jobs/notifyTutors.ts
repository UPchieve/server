import { Job } from 'bull'
import Session from '../../models/Session'
import SessionService from '../../services/SessionService'
import TwilioService from '../../services/twilio'
import { getNotificationWithVolunteer } from '../../services/NotificationService'
import { Volunteer } from '../../models/Volunteer'
import logger from '../../logger'
import { TOTAL_VOLUNTEERS_TO_TEXT_FOR_HELP } from '../../constants'
import { Jobs } from '.'

interface NotifyTutorsJobData {
  sessionId: string
  notificationSchedule: number[]
}

export default async (job: Job<NotifyTutorsJobData>): Promise<void> => {
  const { sessionId, notificationSchedule } = job.data
  const session = await Session.findById(sessionId)
  if (!session) return logger.info(`session ${sessionId} not found`)
  const fulfilled = SessionService.isSessionFulfilled(session)
  if (fulfilled)
    return logger.info(`session ${sessionId} fulfilled, cancelling notifications`)
  const delay = notificationSchedule.shift()
  if (delay)
    job.queue.add(
      Jobs.NotifyTutors,
      { sessionId, notificationSchedule },
      { delay }
    )

  // After 15 text notifications are sent, start contacting the same volunteers again in order
  if (session.notifications.length >= TOTAL_VOLUNTEERS_TO_TEXT_FOR_HELP) {
    // Wrap around the notifications list to get a notification we've sent before
    const notificationId =
      session.notifications[
        session.notifications.length % TOTAL_VOLUNTEERS_TO_TEXT_FOR_HELP
      ]
    const notification = await getNotificationWithVolunteer(notificationId)
    const volunteer = notification.volunteer as Volunteer

    await TwilioService.sendFollowupText({
      session,
      volunteerId: volunteer._id,
      volunteerPhone: volunteer.phone
    })
    logger.info(`Sent follow-up notification to: ${volunteer._id}`)
  } else {
    const volunteerNotified = await TwilioService.notifyVolunteer(session)

    if (volunteerNotified) logger.info(`Volunteer notified: ${volunteerNotified._id}`)
    else logger.info('No volunteer notified')
  }
}
