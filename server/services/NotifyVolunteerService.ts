import type { Uuid } from '../types/shared'
import * as StudentsRepo from '../models/Student'
import * as SessionRepo from '../models/Session'
import * as VolunteerRepo from '../models/Volunteer'
import { sendTextMessage } from '../clients/twilio'
import { CurrentSession } from '../types/session'
import QueueService from './QueueService'
import { secondsInMs } from '../utils/time-utils'
import { EVENTS } from '../constants'
import { getSessionUrl } from '../utils/session-utils'
import logger from '../logger'
import { captureEvent } from './AnalyticsService'

export async function beginRegularNotifications(
  session: CurrentSession,
  delay = secondsInMs(30)
): Promise<void> {
  const student = await StudentsRepo.getStudentContactInfoById(
    session.studentId
  )
  if (!student) return

  // Delay initial wave of notifications by 30 seconds to give
  // volunteers on the dashboard time to pick up the request.
  // Skip the delay when opening a requested-tutor session to all volunteers,
  // since the student has already been waiting.
  await QueueService.add(
    'TextVolunteers',
    { delay, jobId: `TextVolunteers:${session.id}` },
    {
      sessionId: session.id,
      subject: session.subject,
      subjectDisplayName: session.subjectDisplayName,
      topic: session.topic,
      studentId: session.studentId,
      schoolId: student.schoolId,
      studentPartnerOrg: student.studentPartnerOrg,
      notificationRound: 1,
    }
  )
}

// Notify a single volunteer that a student has specifically requested them.
export async function notifyRequestedVolunteer(
  session: CurrentSession,
  volunteerId: Uuid
): Promise<void> {
  const volunteer = await VolunteerRepo.getVolunteerContactInfoById(
    volunteerId,
    { banned: false, deactivated: false, testUser: false }
  )

  if (!volunteer) {
    logger.error('notifyRequestedVolunteer: No volunteer found', {
      err: 'No volunteer found',
      volunteerId,
    })
    return
  }

  if (!volunteer.phone) {
    logger.warn(
      'notifyRequestedVolunteer: volunteer has no phone or is not eligible; skipping SMS',
      { sessionId: session.id, volunteerId }
    )
    return
  }

  if (!volunteer.smsConsent) {
    logger.info('Skipping requested-tutor SMS: volunteer has not consented', {
      sessionId: session.id,
      volunteerId,
    })
    return
  }

  const sessionUrl = getSessionUrl({
    id: session.id,
    subject: session.subject,
    topic: session.topic,
  })
  const studentFirstName = session.student?.firstName ?? 'a student'
  const content = `Hi ${volunteer.firstName}, ${studentFirstName} is specifically requesting your help on UPchieve for ${session.subjectDisplayName}! ${sessionUrl}`
  let carrierMessageId: string | undefined
  try {
    carrierMessageId = await sendTextMessage(
      volunteer.phone,
      content,
      session.id
    )
  } catch (err) {
    logger.error('notifyRequestedVolunteer: SMS send failed', {
      sessionId: session.id,
      volunteerId,
      err,
    })
  }

  // Audit row — admin notifications panel + recently-notified guards depend
  // on this. priorityGroup reuses the existing 'Favorite volunteers' enum
  // value to avoid a DB schema change.
  try {
    await SessionRepo.addSessionNotification(session.id, {
      wasSuccessful: !!carrierMessageId,
      messageId: carrierMessageId,
      volunteer: volunteerId,
      type: 'initial',
      method: 'sms',
      priorityGroup: 'Favorite volunteers',
    })
  } catch (err) {
    logger.error(
      'notifyRequestedVolunteer: failed to write notification audit row',
      { sessionId: session.id, volunteerId, err }
    )
  }

  captureEvent(volunteerId, EVENTS.VOLUNTEER_RECEIVED_EXCLUSIVE_REQUEST, {
    sessionId: session.id,
    studentId: session.studentId,
    subject: session.subject,
    topic: session.topic,
    volunteerId,
    smsSent: !!carrierMessageId,
  })
}
