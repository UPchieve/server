import moment from 'moment'
import * as AssociatedPartnerService from './AssociatedPartnerService'
import type { Uuid } from '../types/shared'
import * as StudentsRepo from '../models/Student'
import * as SessionRepo from '../models/Session'
import type { NotificationData } from '../models/Session'
import * as VolunteerRepo from '../models/Volunteer'
import { sendTextMessage } from '../clients/twilio'
import {
  VolunteerContactInfoWithPhoneRequired,
  getVolunteersNotifiedBySessionId,
} from '../models/Volunteer'
import startsWithVowel from '../utils/starts-with-vowel'
import { AssociatedPartner } from '../models/AssociatedPartner'
import { CurrentSession } from '../types/session'
import QueueService from './QueueService'
import { Jobs } from '../worker/jobs'
import { secondsInMs } from '../utils/time-utils'
import { EVENTS, SUBJECTS } from '../constants'
import { getSessionUrl } from '../utils/session-utils'
import * as cache from '../cache'
import logger from '../logger'
import { captureEvent } from './AnalyticsService'

export async function beginRegularNotifications(
  session: CurrentSession
): Promise<void> {
  const student = await StudentsRepo.getStudentContactInfoById(
    session.studentId
  )
  if (!student) return

  // Delay initial wave of notifications by 30 seconds to give
  // volunteers on the dashboard time to pick up the request.
  await QueueService.add(
    Jobs.TextVolunteers,
    { delay: secondsInMs(30), jobId: `${Jobs.TextVolunteers}:${session.id}` },
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
export async function notifyExclusiveVolunteer(
  session: CurrentSession,
  volunteerId: Uuid
): Promise<void> {
  const volunteer = await VolunteerRepo.getVolunteerContactInfoById(
    volunteerId,
    { banned: false, deactivated: false, testUser: false }
  )

  if (!volunteer) {
    logger.error(
      { volunteerId },
      'notifyExclusiveVolunteer: No volunteer found'
    )
    return
  }

  if (!volunteer.phone) {
    logger.warn(
      { sessionId: session.id, volunteerId },
      'notifyExclusiveVolunteer: volunteer has no phone or is not eligible; skipping SMS'
    )
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
    logger.error(
      { sessionId: session.id, volunteerId, err },
      'notifyExclusiveVolunteer: SMS send failed'
    )
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
      { sessionId: session.id, volunteerId, err },
      'notifyExclusiveVolunteer: failed to write notification audit row'
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

// Atomically clear a session's exclusive-request state and notify the
// targeted volunteer's open frontends.
export async function clearExclusiveRequest(sessionId: Uuid): Promise<boolean> {
  let volunteerId: Uuid | null
  try {
    volunteerId = await cache.hget('exclusiveRequestSessions', sessionId)
  } catch (err) {
    logger.error(
      { sessionId, err },
      'clearExclusiveRequest: HGET failed; failing open (no cleanup)'
    )
    return false
  }
  if (!volunteerId) return false
  let removed: number = 0
  try {
    removed = await cache.hdel('exclusiveRequestSessions', sessionId)
  } catch (err) {
    logger.error({ sessionId, err }, 'clearExclusiveRequest: HDEL failed')
    return false
  }
  if (removed === 0) return false // raced — someone else already cleared it
  return true
}
