import moment from 'moment'
import * as AssociatedPartnerService from './AssociatedPartnerService'
import { Ulid } from '../models/pgUtils'
import * as StudentsRepo from '../models/Student'
import * as SessionRepo from '../models/Session'
import type { NotificationData } from '../models/Session'
import * as VolunteerRepo from '../models/Volunteer'
import * as TwilioService from './TwilioService'
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
import { SUBJECTS } from '../constants'
import { getSessionUrl } from '../utils/session-utils'

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
    {
      sessionId: session.id,
      subject: session.subject,
      subjectDisplayName: session.subjectDisplayName,
      topic: session.topic,
      studentId: session.studentId,
      schoolId: student.schoolId,
      studentPartnerOrg: student.studentPartnerOrg,
      notificationRound: 1,
    },
    { delay: secondsInMs(30) }
  )
}

export async function notifyVolunteer(
  session: SessionRepo.GetSessionByIdResult
): Promise<Ulid | undefined> {
  const student = await StudentsRepo.getStudentContactInfoById(
    session.studentId
  )
  if (!student) return

  const favoriteVolunteers =
    await StudentsRepo.getFavoriteVolunteersByStudentId(student.id)

  const associatedPartner = await AssociatedPartnerService.getAssociatedPartner(
    student.studentPartnerOrg,
    student.schoolId
  )

  const activeSessionVolunteers =
    await SessionRepo.getActiveSessionsWithVolunteers()
  const notifiedForThisSessionId = await getVolunteersNotifiedBySessionId(
    session.id
  )
  const disqualifiedVolunteers = [
    ...activeSessionVolunteers,
    ...notifiedForThisSessionId,
  ]

  // Prioritize volunteers who do not have high-level subjects to avoid
  // lack of volunteers when high-level subjects are requested
  const highLevelSubjects = [
    SUBJECTS.CALCULUS_AB,
    SUBJECTS.CHEMISTRY,
    SUBJECTS.STATISTICS,
  ]

  /**
   * 1. Favorite volunteers - not notified in the last 15 mins
   * 2. Partner volunteers - not notified in the last 3 days AND they don’t have "high level subjects"
   * 3. Regular volunteers - not notified in the last 3 days AND they don’t have "high level subjects"
   * 4. Partner volunteers - not notified in the last 24 hours AND they don’t have "high level subjects"
   * 5. Regular volunteers - not notified in the last 24 hours AND they don’t have " high level subjects"
   * 6. All volunteers - not notified in the last 24 hours
   * 7. All volunteers - not notified in the last 60 mins
   * 8. All volunteers - not notified in the last 15 mins
   */

  const volunteerPriority = [
    {
      groupName: `Favorite volunteers - not notified in the last 15 mins`,
      query: () =>
        VolunteerRepo.getNextVolunteerToNotify({
          subject: session.subject,
          lastNotified: moment().subtract(15, 'minutes').toDate(),
          isPartner: undefined,
          highLevelSubjects: undefined,
          disqualifiedVolunteers,
          specificPartner: undefined,
          favoriteVolunteers,
        }),
    },
    {
      groupName: `${
        associatedPartner ? 'Associated partner' : 'Partner'
      } volunteers - not notified in the last 3 days AND they don\'t have "high level subjects"`,
      query: () =>
        VolunteerRepo.getNextVolunteerToNotify({
          subject: session.subject,
          lastNotified: moment().subtract(3, 'days').toDate(),
          isPartner: true,
          highLevelSubjects,
          disqualifiedVolunteers,
          specificPartner: associatedPartner?.volunteerPartnerOrg,
          favoriteVolunteers: undefined,
        }),
    },
    {
      groupName:
        'Regular volunteers - not notified in the last 3 days AND they don\'t have "high level subjects"',
      query: () =>
        VolunteerRepo.getNextVolunteerToNotify({
          subject: session.subject,
          lastNotified: moment().subtract(3, 'days').toDate(),
          isPartner: false,
          highLevelSubjects,
          disqualifiedVolunteers,
          specificPartner: undefined,
          favoriteVolunteers: undefined,
        }),
    },
    {
      groupName: `${
        associatedPartner ? 'Associated partner' : 'Partner'
      } volunteers - not notified in the last 24 hours AND they don\'t have "high level subjects"`,
      query: () =>
        VolunteerRepo.getNextVolunteerToNotify({
          subject: session.subject,
          lastNotified: moment().subtract(1, 'day').toDate(),
          isPartner: true,
          highLevelSubjects,
          disqualifiedVolunteers,
          specificPartner: associatedPartner?.volunteerPartnerOrg,
          favoriteVolunteers: undefined,
        }),
    },
    {
      groupName:
        'Regular volunteers - not notified in the last 24 hours AND they don\'t have "high level subjects"',
      query: () =>
        VolunteerRepo.getNextVolunteerToNotify({
          subject: session.subject,
          lastNotified: moment().subtract(1, 'day').toDate(),
          isPartner: false,
          highLevelSubjects,
          disqualifiedVolunteers,
          specificPartner: undefined,
          favoriteVolunteers: undefined,
        }),
    },
    {
      groupName: 'All volunteers - not notified in the last 24 hours',
      query: () =>
        VolunteerRepo.getNextVolunteerToNotify({
          subject: session.subject,
          lastNotified: moment().subtract(1, 'day').toDate(),
          isPartner: undefined,
          highLevelSubjects: undefined,
          disqualifiedVolunteers,
          specificPartner: undefined,
          favoriteVolunteers: undefined,
        }),
    },
    {
      groupName: 'All volunteers - not notified in the last 60 mins',
      query: () =>
        VolunteerRepo.getNextVolunteerToNotify({
          subject: session.subject,
          lastNotified: moment().subtract(1, 'hour').toDate(),
          isPartner: undefined,
          highLevelSubjects: undefined,
          disqualifiedVolunteers,
          specificPartner: undefined,
          favoriteVolunteers: undefined,
        }),
    },
    {
      groupName: 'All volunteers - not notified in the last 15 mins',
      query: () =>
        VolunteerRepo.getNextVolunteerToNotify({
          subject: session.subject,
          lastNotified: moment().subtract(15, 'minutes').toDate(),
          isPartner: undefined,
          highLevelSubjects: undefined,
          disqualifiedVolunteers,
          specificPartner: undefined,
          favoriteVolunteers: undefined,
        }),
    },
  ]

  let volunteer: VolunteerContactInfoWithPhoneRequired | undefined
  let priorityGroup: any

  for (const priorityFilter of volunteerPriority) {
    volunteer = await priorityFilter.query()
    if (volunteer) {
      const volunteerMutedSubject =
        await VolunteerRepo.checkIfVolunteerMutedSubject(
          volunteer.id,
          session.subject
        )
      if (volunteerMutedSubject) {
        volunteer = undefined
        continue
      }
      priorityGroup = priorityFilter.groupName
      break
    }
  }

  if (!volunteer) return

  const messageText = buildNotificationContent(
    session,
    volunteer,
    associatedPartner
  )

  let notification: NotificationData = {
    wasSuccessful: false,
    messageId: undefined,
    volunteer: volunteer.id,
    type: 'initial',
    method: 'sms',
    priorityGroup,
  }

  if (volunteer.phone) {
    const messageId = await TwilioService.sendTextMessage(
      volunteer.phone,
      messageText
    )

    if (messageId) {
      notification.wasSuccessful = true
      notification.messageId = messageId
    }
  }

  await SessionRepo.addSessionNotification(session.id, notification)

  return volunteer.id
}

export async function sendFollowupText(
  sessionId: Ulid,
  volunteerId: Ulid,
  volunteerPhone: string
): Promise<void> {
  const messageText = 'Heads up: this student is still waiting for help!'

  let notification: NotificationData = {
    wasSuccessful: false,
    messageId: undefined,
    volunteer: volunteerId,
    type: 'followup',
    method: 'sms',
    priorityGroup: 'follow-up',
  }
  const messageId = await TwilioService.sendTextMessage(
    volunteerPhone,
    messageText
  )
  if (messageId) {
    notification.wasSuccessful = true
    notification.messageId = messageId
  }

  await SessionRepo.addSessionNotification(sessionId, notification)
}

function buildTargetStudentContent(
  volunteer: VolunteerContactInfoWithPhoneRequired,
  associatedPartner: AssociatedPartner | undefined
) {
  return associatedPartner &&
    associatedPartner.studentOrgDisplay &&
    volunteer.volunteerPartnerOrg === associatedPartner.volunteerPartnerOrg
    ? startsWithVowel(associatedPartner.studentOrgDisplay)
      ? `an ${associatedPartner.studentOrgDisplay} student`
      : `a ${associatedPartner.studentOrgDisplay} student`
    : 'a student'
}

function buildNotificationContent(
  session: SessionRepo.GetSessionByIdResult,
  volunteer: VolunteerContactInfoWithPhoneRequired,
  associatedPartner: AssociatedPartner | undefined
) {
  const sessionUrl = getSessionUrl(session)
  return `Hi ${volunteer.firstName}, ${buildTargetStudentContent(
    volunteer,
    associatedPartner
  )} needs help in ${session.subjectDisplayName} on UPchieve! ${sessionUrl}`
}
