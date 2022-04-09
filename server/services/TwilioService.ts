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
  getVolunteersNotifiedBySessionId,
} from '../models/Volunteer'
import queue from './QueueService'
import * as SessionRepo from '../models/Session'
import * as VolunteerRepo from '../models/Volunteer'
import formatMultiWordSubject from '../utils/format-multi-word-subject'
import Case from 'case'
import logger from '../logger'
import { VERIFICATION_METHOD, SUBJECTS } from '../constants'
import startsWithVowel from '../utils/starts-with-vowel'
import { Ulid } from '../models/pgUtils'
import { getSessionById } from '../models/Session'
import {
  AssociatedPartner,
  getAssociatedPartnerByKey,
} from '../models/AssociatedPartner'
import { getSponsorOrgs } from '../models/SponsorOrg'

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
type SessionForUrl = Pick<SessionRepo.Session, 'subject' | 'topic' | 'id'>
export function getSessionUrl(session: SessionForUrl): string {
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

  const { wasSuccessful, messageId } = await sendNotification(sidPromise)
  await SessionRepo.addSessionNotifications(sessionId, [
    {
      wasSuccessful,
      messageId,
      volunteer: volunteerId,
      type: 'regular',
      method: 'sms',
      priorityGroup: 'follow-up',
    },
  ])
}

export function buildTargetStudentContent(
  volunteer: VolunteerContactInfo,
  associatedPartner: AssociatedPartner | undefined
) {
  return associatedPartner &&
    associatedPartner.studentOrgDisplay &&
    volunteer.volunteerPartnerOrg === associatedPartner.volunteerPartnerOrg
    ? startsWithVowel(associatedPartner.studentOrgDisplay!)
      ? `an ${associatedPartner.studentOrgDisplay!} student`
      : `a ${associatedPartner.studentOrgDisplay!} student`
    : 'a student'
}

export function buildNotificationContent(
  session: SessionRepo.Session,
  volunteer: VolunteerContactInfo,
  associatedPartner: AssociatedPartner | undefined
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

export async function getAssociatedPartner(
  partnerOrg: string,
  highSchoolId: Ulid | undefined
): Promise<AssociatedPartner | undefined> {
  // Determine if the student's partner org is one of the orgs that
  // should have priority matching with its partner volunteer org counterpart
  if (config.priorityMatchingPartnerOrgs.some(org => partnerOrg === org))
    return getAssociatedPartnerByKey(partnerOrg)

  for (const sponsorOrg of config.priorityMatchingSponsorOrgs) {
    // Determine if the student's school belongs to a sponsor org that
    // should have priority matching with its partner volunteer org counterpart
    const sponsorOrgs = await getSponsorOrgs()
    const matchingOrgs = sponsorOrgs.filter(org => {
      org.key === sponsorOrg
    })
    if (
      highSchoolId &&
      matchingOrgs.length > 0 &&
      Array.isArray(matchingOrgs[0].schoolIds) &&
      matchingOrgs[0].schoolIds.some(schoolId => schoolId === highSchoolId)
    )
      return getAssociatedPartnerByKey(sponsorOrg)

    // Determine if the student's partner org belongs to a sponsor org that
    // should have priority matching with its partner volunteer org counterpart
    if (
      matchingOrgs.length > 0 &&
      Array.isArray(matchingOrgs[0].studentPartnerOrgKeys) &&
      matchingOrgs[0].studentPartnerOrgKeys.includes(partnerOrg)
    )
      return getAssociatedPartnerByKey(sponsorOrg)
  }

  return undefined
}

export async function notifyVolunteer(
  session: SessionRepo.Session
): Promise<Ulid | undefined> {
  // Replace with getStudentPartnerInfoById from Student Repo
  const student = await getStudentContactInfoById(session.studentId)
  if (!student) return
  const associatedPartner = student.studentPartnerOrg
    ? await getAssociatedPartner(student.studentPartnerOrg, student.schoolId)
    : undefined

  let subtopic: string = session.subject
  const activeSessionVolunteers = await getActiveSessionVolunteers()
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
      query: associatedPartner
        ? () =>
            VolunteerRepo.getNextSpecificPartnerVolunteerToNotify(
              session.subject,
              moment()
                .subtract(3, 'days')
                .toDate(),
              associatedPartner.volunteerPartnerOrg,
              highLevelSubjects,
              disqualifiedVolunteers
            )
        : () =>
            VolunteerRepo.getNextAnyPartnerVolunteerToNotify(
              session.subject,
              moment()
                .subtract(3, 'days')
                .toDate(),
              highLevelSubjects,
              disqualifiedVolunteers
            ),
    },
    {
      groupName:
        'Regular volunteers - not notified in the last 3 days AND they don\'t have "high level subjects"',
      query: () =>
        VolunteerRepo.getNextOpenVolunteerToNotify(
          session.subject,
          moment()
            .subtract(3, 'days')
            .toDate(),
          highLevelSubjects,
          disqualifiedVolunteers
        ),
    },
    {
      groupName: `${
        associatedPartner ? associatedPartner.volunteerOrgDisplay : 'Partner'
      } volunteers - not notified in the last 24 hours AND they don\'t have "high level subjects"`,
      query: associatedPartner
        ? () =>
            VolunteerRepo.getNextSpecificPartnerVolunteerToNotify(
              session.subject,
              moment()
                .subtract(1, 'days')
                .toDate(),
              associatedPartner.volunteerPartnerOrg,
              highLevelSubjects,
              disqualifiedVolunteers
            )
        : () =>
            VolunteerRepo.getNextAnyPartnerVolunteerToNotify(
              session.subject,
              moment()
                .subtract(1, 'days')
                .toDate(),
              highLevelSubjects,
              disqualifiedVolunteers
            ),
    },
    {
      groupName:
        'Regular volunteers - not notified in the last 24 hours AND they don\'t have "high level subjects"',
      query: () =>
        VolunteerRepo.getNextOpenVolunteerToNotify(
          session.subject,
          moment()
            .subtract(1, 'days')
            .toDate(),
          highLevelSubjects,
          disqualifiedVolunteers
        ),
    },
    {
      groupName: 'All volunteers - not notified in the last 24 hours',
      query: () =>
        VolunteerRepo.getNextAnyVolunteerToNotify(
          session.subject,
          moment()
            .subtract(1, 'days')
            .toDate(),
          [],
          disqualifiedVolunteers
        ),
    },
    {
      groupName: 'All volunteers - not notified in the last 60 mins',
      query: () =>
        VolunteerRepo.getNextAnyVolunteerToNotify(
          session.subject,
          moment()
            .subtract(1, 'hour')
            .toDate(),
          [],
          disqualifiedVolunteers
        ),
    },
    {
      groupName: 'All volunteers - not notified in the last 15 mins',
      query: () =>
        VolunteerRepo.getNextAnyVolunteerToNotify(
          session.subject,
          moment()
            .subtract(15, 'minutes')
            .toDate(),
          [],
          disqualifiedVolunteers
        ),
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
  const sidPromise = sendTextMessage(volunteer.phone, messageText)

  try {
    const { wasSuccessful, messageId } = await sendNotification(sidPromise)
    const notification = {
      wasSuccessful,
      messageId,
      volunteer: volunteer.id,
      type: subtopic,
      method: 'sms',
      priorityGroup,
    }
    await SessionRepo.addSessionNotifications(session.id, [notification])
  } catch (err) {
    logger.error(err as Error)
  }

  return volunteer.id
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
export async function sendNotification(
  sidPromise: Promise<string>
): Promise<{
  wasSuccessful: boolean
  messageId?: string
}> {
  let wasSuccessful = false
  let messageId: undefined | string
  try {
    const sid = await sidPromise
    // record notification in database
    wasSuccessful = true
    messageId = sid
  } catch (err) {
    // record notification failure in database
    logger.error(err as Error)
    wasSuccessful = false
  } finally {
    return { wasSuccessful, messageId }
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
    return true
  }
  const result = await twilioClient.verify
    .services(config.twilioAccountVerificationServiceSid)
    .verificationChecks.create({ to, code })
  return result.valid
}

export async function beginRegularNotifications(
  sessionId: Ulid
): Promise<void> {
  const session = await getSessionById(sessionId)
  const isTestUser = await getTestStudentExistsById(session.studentId)

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
