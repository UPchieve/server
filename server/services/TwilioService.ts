import twilio from 'twilio'
import { getCurrentNewYorkTime } from '../utils/get-times'
import config from '../config'
import moment from 'moment'
import {
  getStudentContactInfoById,
  getTestStudentExistsById,
} from '../models/Student'
import {
  VolunteerContactInfo,
  getVolunteersFailsafe,
  getVolunteersNotifiedSinceDate,
  getVolunteersNotifiedBySessionId,
  getNextVolunteerToNotify,
} from '../models/Volunteer/queries'
import queue from './QueueService'
import * as SessionRepo from '../models/Session'
import * as VolunteerRepo from '../models/Volunteer'
import {
  Notification,
} from '../models/Notification'
import formatMultiWordSubject from '../utils/format-multi-word-subject'
import Case from 'case'
import logger from '../logger'
import { MATH_CERTS, VERIFICATION_METHOD, SUBJECTS } from '../constants'
import {
  AssociatedPartnerManifest,
  associatedPartnerManifests,
  sponsorOrgManifests,
} from '../partnerManifests'
import startsWithVowel from '../utils/starts-with-vowel'
import { Ulid } from '../models/pgUtils'

const protocol = config.NODE_ENV === 'production' ? 'https' : 'http'
const apiRoot =
  config.NODE_ENV === 'production'
    ? `https://${config.host}/twiml`
    : `http://${config.host}/twiml`

const twilioClient =
  config.accountSid && config.authToken
    ? twilio(config.accountSid, config.authToken)
    : null

// get the availability field to query for the current time
export function getCurrentAvailabilityPath(): string {
  const date = getCurrentNewYorkTime()
  const day = date.isoWeekday() - 1
  let baseHour = date.hour()
  let hour: string

  if (baseHour >= 12) {
    if (baseHour > 12) {
      baseHour -= 12
    }
    hour = `${baseHour}p`
  } else {
    if (baseHour === 0) {
      baseHour = 12
    }
    hour = `${baseHour}a`
  }

  const days = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ]

  return `availability.${days[day]}.${hour}`
}

export async function getNextVolunteer(
  priorityFilter = {}
): Promise<VolunteerContactInfo | undefined> {
  const availabilityPath = getCurrentAvailabilityPath()

  const filter = {
    isApproved: true,
    [availabilityPath]: true,
    phone: { $exists: true },
    isTestUser: false,
    isFakeUser: false,
    isDeactivated: false,
    isFailsafeVolunteer: false,
    isBanned: false,
    ...priorityFilter,
  }

  return getNextVolunteerToNotify(filter)
}

export async function sendTextMessage(
  phoneNumber: string,
  messageText: string
): Promise<string> {
  logger.info(`Sending text message "${messageText}" to ${phoneNumber}`)

  // If stored phone number doesn't have international calling code (E.164 formatting)
  // then default to US number
  // TODO: normalize previously stored US phone numbers
  const fullPhoneNumber =
    phoneNumber[0] === '+' ? phoneNumber : `+1${phoneNumber}`

  if (!twilioClient) {
    logger.warn('Twilio client not loaded.')
    return '0'
  }
  const message = await twilioClient.messages.create({
    to: fullPhoneNumber,
    from: config.sendingNumber,
    body: messageText,
  })
  logger.info(
    `Message sent to ${phoneNumber} with message id \n ${message.sid}`
  )
  return message.sid
}

export async function sendVoiceMessage(
  phoneNumber: string,
  messageText: string
): Promise<string> {
  logger.info(`Sending voice message "${messageText}" to ${phoneNumber}`)

  // URL for Twilio to retrieve the TwiML with the message text and voice
  const url = apiRoot + '/message/' + encodeURIComponent(messageText)

  // If stored phone number doesn't have international calling code (E.164 formatting)
  // then default to US number
  // TODO: normalize previously stored US phone numbers
  const fullPhoneNumber =
    phoneNumber[0] === '+' ? phoneNumber : `+1${phoneNumber}`

  // initiate call, giving Twilio the aforementioned URL which Twilio
  // opens when the call is answered to get the TwiML instructions
  if (!twilioClient) {
    logger.warn('Twilio client not loaded.')
    return '0'
  }
  const call = await twilioClient.calls.create({
    url: url,
    to: fullPhoneNumber,
    from: config.sendingNumber,
  })
logger.info(`Voice call to ${phoneNumber} with id ${call.sid}`)
  return call.sid
}

// the URL that the volunteer can use to join the session on the client
export function getSessionUrl(session: Session): string {
  return `${protocol}://${config.client.host}/session/${Case.kebab(
    session.topic
  )}/${Case.kebab(session.subject)}/${session.id}`
}

export async function getActiveSessionVolunteers(): Promise<Ulid[]> {
  const volunteerIds = await SessionRepo.getActiveSessionsWithVolunteers()
  return volunteerIds
}

export function relativeDate(msAgo: number): Date {
  return new Date(new Date().getTime() - msAgo)
}

export async function sendFollowupText(
  sessionId: Ulid,
  volunteerId: Ulid,
  volunteerPhone: string
): Promise<void> {
  const messageText = 'Heads up: this student is still waiting for help!'
  const sidPromise = sendTextMessage(volunteerPhone, messageText)
  // TODO: repo pattern
  const notification = new NotificationModel({
    volunteer: volunteerId,
    type: 'REGULAR',
    method: 'SMS',
    priorityGroup: 'follow-up',
    sessionId,
  })

  await recordNotification(sidPromise, notification)
  await SessionRepo.addSessionNotifications(sessionId, [
    notification.toObject(),
  ])
}

export function buildTargetStudentContent(
  volunteer: VolunteerContactInfo,
  associatedPartner: AssociatedPartnerManifest | undefined
) {
  return associatedPartner &&
    volunteer.volunteerPartnerOrg === associatedPartner.volunteerPartnerOrg
    ? startsWithVowel(associatedPartner.studentOrgDisplay)
      ? `an ${associatedPartner.studentOrgDisplay} student`
      : `a ${associatedPartner.studentOrgDisplay} student`
    : 'a student'
}

export function buildNotificationContent(
  session: Session,
  volunteer: VolunteerContactInfo,
  associatedPartner: AssociatedPartnerManifest | undefined
) {
  // Format multi-word subtopics from a key name to a display name
  // ex: physicsOne -> Physics 1
  const subtopic = formatMultiWordSubject(session.subject)
  const sessionUrl = getSessionUrl(session)
  return `Hi ${volunteer.firstName}, ${buildTargetStudentContent(
    volunteer,
    associatedPartner
  )} needs help in ${subtopic} on UPchieve! ${sessionUrl}`
}

export function getAssociatedPartner(
  partnerOrg: string,
  highSchool: Ulid | undefined
): AssociatedPartnerManifest | undefined {
  // Determine if the student's partner org is one of the orgs that
  // should have priority matching with its partner volunteer org counterpart
  if (config.priorityMatchingPartnerOrgs.some(org => partnerOrg === org))
    return associatedPartnerManifests[partnerOrg]

  for (const sponsorOrg of config.priorityMatchingSponsorOrgs) {
    // Determine if the student's school belongs to a sponsor org that
    // should have priority matching with its partner volunteer org counterpart
    if (
      highSchool &&
      sponsorOrgManifests[sponsorOrg] &&
      Array.isArray(sponsorOrgManifests[sponsorOrg].schools) &&
      sponsorOrgManifests[sponsorOrg].schools.some(school =>
        school.equals(highSchool)
      )
    )
      return associatedPartnerManifests[sponsorOrg]

    // Determine if the student's partner org belongs to a sponsor org that
    // should have priority matching with its partner volunteer org counterpart
    if (
      sponsorOrgManifests[sponsorOrg] &&
      Array.isArray(sponsorOrgManifests[sponsorOrg].partnerOrgs) &&
      sponsorOrgManifests[sponsorOrg].partnerOrgs.includes(partnerOrg)
    )
      return associatedPartnerManifests[sponsorOrg]
  }

  return undefined
}

export async function notifyVolunteer(
  session: Session
): Promise<Ulid | undefined> {
  // Replace with getStudentPartnerInfoById from Student Repo
  const student = await getStudentContactInfoById(session.studentId)
  if (!student) return
  const associatedPartner = getAssociatedPartner(
    student.studentPartnerOrg,
    student.schoolId
  )

  // typed as `any` because `subtopic` gets reassigned as a regex query object if `subtopic` is algebraTwo
  let subtopic: any = session.subject
  const activeSessionVolunteers = await getActiveSessionVolunteers()
  const notifiedLastFifteenMins = await getVolunteersNotifiedSinceDate(
    relativeDate(15 * 60 * 1000)
  )
  const notifiedLastSixtyMins = await getVolunteersNotifiedSinceDate(
    relativeDate(60 * 60 * 1000)
  )
  const notifiedLastTwentyFourHours = await getVolunteersNotifiedSinceDate(
    relativeDate(24 * 60 * 60 * 1000)
  )
  const notifiedLastThreeDays = await getVolunteersNotifiedSinceDate(
    relativeDate(3 * 24 * 60 * 60 * 1000)
  )

  const notifiedForThisSessionId = await getVolunteersNotifiedBySessionId(
    session.id
  )

  // Prioritize volunteers who do not have high-level subjects to avoid
  // lack of volunteers when high-level subjects are requested
  const highLevelSubjects = [
    SUBJECTS.CALCULUS_AB,
    SUBJECTS.CHEMISTRY,
    SUBJECTS.STATISTICS,
  ]
  const isHighLevelSubject = highLevelSubjects.includes(subtopic)
  // Temporarily notify tutors with algebraTwo-temporary as subject
  // TODO: remove regex check for algebraTwo in algebra 2 launch cleanup
  if (subtopic === MATH_CERTS.ALGEBRA_TWO) {
    subjectsFilter = { $regex: MATH_CERTS.ALGEBRA_TWO }
    subtopic = { $regex: MATH_CERTS.ALGEBRA_TWO }
  }

  /**
   * 1. Partner volunteers - not notified in the last 3 days AND they don’t have "high level subjects"
   * 2. Regular volunteers - not notified in the last 3 days AND they don’t have "high level subjects"
   * 3. Partner volunteers - not notified in the last 24 hours AND they don’t have "high level subjects"
   * 4. Regular volunteers - not notified in the last 24 hours AND they don’t have " high level subjects"
   * 5. All volunteers - not notified in the last 24 hours
   * 6. All volunteers - not notified in the last 60 mins
   * 7. All volunteers - not notified in the last 15 mins
   */

  const volunteerPriority = [
    {
      groupName: `${
        associatedPartner ? associatedPartner.volunteerOrgDisplay : 'Partner'
      } volunteers - not notified in the last 3 days AND they don\'t have "high level subjects"`,
      query: associatedPartner ? 
        () => VolunteerRepo.getNextSpecificPartnerVolunteerToNotify(session.subject, moment().subtract(3, 'days').toDate(), associatedPartner.volunteerPartnerOrg) :
        () => VolunteerRepo.getNextAnyPartnerVolunteerToNotify(session.subject, moment().subtract(3, 'days').toDate())
    },
    {
      groupName:
        'Regular volunteers - not notified in the last 3 days AND they don\'t have "high level subjects"',
      query: () => VolunteerRepo.getNextOpenVolunteerToNotify(session.subject, moment().subtract(3, 'days').toDate())
    },
    {
      groupName: `${
        associatedPartner ? associatedPartner.volunteerOrgDisplay : 'Partner'
      } volunteers - not notified in the last 24 hours AND they don\'t have "high level subjects"`,
      query: associatedPartner ? 
        () => VolunteerRepo.getNextSpecificPartnerVolunteerToNotify(session.subject, moment().subtract(1, 'days').toDate(), associatedPartner.volunteerPartnerOrg) :
        () => VolunteerRepo.getNextAnyPartnerVolunteerToNotify(session.subject, moment().subtract(1, 'days').toDate())
    },
    {
      groupName:
        'Regular volunteers - not notified in the last 24 hours AND they don\'t have "high level subjects"',
        query: () => VolunteerRepo.getNextOpenVolunteerToNotify(session.subject,moment().subtract(1, 'days').toDate())
    },
    {
      groupName: 'All volunteers - not notified in the last 24 hours',
      query: () => VolunteerRepo.getNextAnyVolunteerToNotify(session.subject,moment().subtract(1, 'days').toDate())
    },
    {
      groupName: 'All volunteers - not notified in the last 60 mins',
      query: () => VolunteerRepo.getNextAnyVolunteerToNotify(session.subject,moment().subtract(1, 'hour').toDate())
    },
    {
      groupName: 'All volunteers - not notified in the last 15 mins',
      query: () => VolunteerRepo.getNextAnyVolunteerToNotify(session.subject,moment().subtract(15, 'minutes').toDate())
    },
  ]

  let volunteer: VolunteerContactInfo | undefined, priorityGroup: any

  for (const priorityFilter of volunteerPriority) {
    volunteer = await priorityFilter.query()

    if (volunteer) {
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
  const sidPromise = sendTextMessage(volunteer.phone as string, messageText)

  // TODO: repo pattern
  const notification = new NotificationModel({
    volunteer,
    type: 'REGULAR',
    method: 'SMS',
    priorityGroup,
    sessionId: session._id,
  })

  await recordNotification(sidPromise, notification)
  await SessionRepo.addSessionNotifications([
    notification,
  ])

  return volunteer.id
}

export async function notifyFailsafe(
  session: Session,
  voice: boolean = false
): Promise<void> {
  const subtopic = session.subTopic
  const sessionUrl = getSessionUrl(session)
  const volunteersToNotify = await getVolunteersFailsafe()
  const isTestUser = await getTestStudentExistsById(
    getIdFromModelReference(session.student)
  )

  const notifications = []

  for (const volunteer of volunteersToNotify) {
    const phoneNumber = volunteer.phone as string

    let messageText = `UPchieve failsafe alert: new ${subtopic} request`

    if (isTestUser) messageText = '[TEST USER] ' + messageText
    if (!voice) messageText = messageText + `\n${sessionUrl}`

    let sidPromise: Promise<string>
    if (voice) sidPromise = sendVoiceMessage(phoneNumber, messageText)
    else sidPromise = sendTextMessage(phoneNumber, messageText)

    // record notification to database
    // TODO: repo pattern
    const notification = new NotificationModel({
      volunteer: volunteer,
      type: 'FAILSAFE',
      method: voice ? 'VOICE' : 'SMS',
      sessionId: session._id,
    })

    try {
      notifications.push(await recordNotification(sidPromise, notification))
    } catch (err) {
      logger.error(err as Error)
    }
  }

  // save notifications to session object
  await SessionRepo.addSessionNotifications(session._id, notifications)
}

/**
 * Helper function to record notifications, whether successful or
 * failed, to the database
 * @param {sendPromise} a Promise that resolves to the message SID
 * @param {notification} the notification object to save
 * after the message is sent to Twilio
 * @returns a Promise that resolves to the saved notification
 * object
 */
export async function recordNotification(
  sidPromise: Promise<string>,
  notification: NotificationDocument
): Promise<Notification> {
  try {
    const sid = await sidPromise
    // record notification in database
    notification.wasSuccessful = true
    notification.messageId = sid
  } catch (err) {
    // record notification failure in database
    logger.error(err as Error)
    notification.wasSuccessful = false
  } finally {
    await notification.save()
    return notification.toObject()
  }
}

export async function sendVerification(
  sendTo: string,
  verificationMethod: VERIFICATION_METHOD,
  firstName: string
): Promise<void> {
  if (!twilioClient) {
    logger.warn('Twilio client not loaded.')
    return
  }
  await twilioClient.verify
    .services(config.twilioAccountVerificationServiceSid)
    .verifications.create({
      to: sendTo,
      channel: verificationMethod,
      channelConfiguration: {
        from: config.mail.senders.noreply,
        from_name: 'UPchieve',
        substitutions: {
          firstName,
        },
      },
    })
}

export async function confirmVerification(
  to: string,
  code: string
): Promise<boolean> {
  if (!twilioClient) {
    logger.warn('Twilio client not loaded.')
    return false
  }
  const result = await twilioClient.verify
    .services(config.twilioAccountVerificationServiceSid)
    .verificationChecks.create({ to, code })
  return result.valid
}

export async function beginRegularNotifications(
  sessionId: Ulid
): Promise<void> {
  const isTestUser = await getTestStudentExistsById(
    getIdFromModelReference(session.studentId)
  )

  if (isTestUser) return

  // Delay initial wave of notifications by 1 min to give
  // volunteers on the dashboard time to pick up the request
  const notificationSchedule = config.notificationSchedule.slice()
  const delay = notificationSchedule.shift()
  await queue.add(
    'NotifyTutors',
    { sessionId, notificationSchedule },
    { delay }
  )
}

export async function beginFailsafeNotifications(
  sessionId: Ulid
): Promise<void> {
  await notifyFailsafe(sessionId, false)
}
