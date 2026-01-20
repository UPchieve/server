import twilio from 'twilio'
import { getCurrentNewYorkTime } from '../utils/get-times'
import config from '../config'
import moment from 'moment'
import * as StudentsRepo from '../models/Student'
import {
  VolunteerContactInfoWithPhoneRequired,
  getVolunteersNotifiedBySessionId,
} from '../models/Volunteer'
import QueueService from './QueueService'
import * as UserProfileService from './UserProfileService'
import * as SessionRepo from '../models/Session'
import * as VolunteerRepo from '../models/Volunteer'
import Case from 'case'
import logger from '../logger'
import { VERIFICATION_METHOD, SUBJECTS } from '../constants'
import startsWithVowel from '../utils/starts-with-vowel'
import { Ulid } from '../models/pgUtils'
import * as AssociatedPartnerService from './AssociatedPartnerService'
import type { CreateSessionResult, NotificationData } from '../models/Session'
import { Jobs } from '../worker/jobs'
import { AssociatedPartner } from '../models/AssociatedPartner'
import { secondsInMs } from '../utils/time-utils'

const protocol = config.NODE_ENV === 'production' ? 'https' : 'http'
const apiRoot = `${config.protocol}://${config.host}/twiml`

const twilioClient =
  config.accountSid && config.authToken
    ? twilio(config.accountSid, config.authToken)
    : null

// See Twilio Verify error codes here: https://www.twilio.com/docs/api/errors#6-anchor
enum TwilioErrorCodes {
  INVALID_PARAMETER = 60200,
}

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
  messageText: string,
  sessionId?: string
): Promise<string | undefined> {
  try {
    logger.info(
      { sessionId },
      `Sending text message "${messageText}" to ${phoneNumber}`
    )

    // If stored phone number doesn't have international calling code (E.164 formatting)
    // then default to US number
    // TODO: normalize previously stored US phone numbers
    const fullPhoneNumber =
      phoneNumber[0] === '+' ? phoneNumber : `+1${phoneNumber}`

    if (!twilioClient) {
      logger.warn('Twilio client not loaded.')
      return
    }

    const message = await twilioClient.messages.create({
      to: fullPhoneNumber,
      from: config.sendingNumber,
      body: messageText,
    })
    return message.sid
  } catch (err) {
    if (
      (err as Error).message === 'Attempt to send to unsubscribed recipient'
    ) {
      await UserProfileService.optOutSmsConsentForPhoneNumber(phoneNumber)
    }
    logger.error(err as Error)
  }
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
type SessionForUrl = Pick<
  SessionRepo.GetSessionByIdResult,
  'subject' | 'topic' | 'id'
>
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

  let notification: NotificationData = {
    wasSuccessful: false,
    messageId: undefined,
    volunteer: volunteerId,
    type: 'followup',
    method: 'sms',
    priorityGroup: 'follow-up',
  }
  const messageId = await sendTextMessage(volunteerPhone, messageText)
  if (messageId) {
    notification.wasSuccessful = true
    notification.messageId = messageId
  }

  await SessionRepo.addSessionNotification(sessionId, notification)
}

export function buildTargetStudentContent(
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

export function buildNotificationContent(
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
    const messageId = await sendTextMessage(volunteer.phone, messageText)

    if (messageId) {
      notification.wasSuccessful = true
      notification.messageId = messageId
    }
  }

  await SessionRepo.addSessionNotification(session.id, notification)

  return volunteer.id
}

export async function sendVerification(
  sendTo: string,
  verificationMethod: VERIFICATION_METHOD,
  firstName: string,
  userId: string
): Promise<void> {
  if (!twilioClient) {
    logger.warn('Twilio client not loaded.')
    return
  }

  await twilioClient.verify
    .services(config.twilioAccountVerificationServiceSid)
    .verifications.create(
      {
        to: sendTo,
        channel: verificationMethod,
        channelConfiguration: {
          from: config.mail.senders.noreply,
          from_name: 'UPchieve',
          substitutions: {
            firstName,
          },
        },
        rateLimits: {
          [config.twilioVerificationRateLimitUniqueName]: userId,
        },
      },
      async (error, verificationInstance) => {
        if (error) {
          if (
            'code' in error &&
            error['code'] === TwilioErrorCodes.INVALID_PARAMETER
          ) {
            // Rate limit with that unique name does not exist.
            // This should have been created during application startup.
            logger.warn(
              `Could not find Twilio rate limit with uniqueName=${config.twilioVerificationRateLimitUniqueName} while attempting to send a verification code. Will attempt to create it now.`
            )
            await createRateLimit(config.twilioVerificationRateLimitUniqueName)
          }
        }
      }
    )
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
  session: CreateSessionResult
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

/**
 * Verifies that the Twilio RateLimit resource with the desired uniqueName exists,
 * or creates it if not.
 *
 * The RateLimit is identified by its uniqueName attribute when you
 * make a createVerification request.
 *
 * Each RateLimit has 1 or more associated RateLimitBucket resources which
 * is where we configure the actual time interval and number of retries.
 *
 * Learn more here: https://www.twilio.com/docs/verify/api/programmable-rate-limits
 */
export async function fetchOrCreateRateLimit() {
  if (!twilioClient) {
    logger.warn('Twilio client not loaded')
    return
  }

  logger.info(
    `Attempting to fetch or create Twilio rate limit with uniqueName=${config.twilioVerificationRateLimitUniqueName}`
  )

  // Fetch RateLimits and see if the one we want exists.
  const rateLimits = await twilioClient.verify
    .services(config.twilioAccountVerificationServiceSid)
    .rateLimits.list()

  const targetRateLimit = rateLimits.find(
    (rateLimit) =>
      rateLimit.uniqueName === config.twilioVerificationRateLimitUniqueName
  )
  if (targetRateLimit) {
    return
  }
  logger.warn(
    `Did not find Twilio rate limit resource with name ${config.twilioVerificationRateLimitUniqueName}. Will create one now.`
  )
  await createRateLimit(config.twilioVerificationRateLimitUniqueName)
}

async function createRateLimit(uniqueName: string): Promise<void> {
  // Create RateLimit
  const rateLimit = await twilioClient?.verify
    .services(config.twilioAccountVerificationServiceSid)
    .rateLimits.create({
      uniqueName,
      description: `Rate limit on ${uniqueName}`,
    })
  if (!rateLimit) {
    // It should throw an error in this case, but just to be safe
    throw new Error(`Could not create rate limit`)
  }

  logger.info(`Created RateLimit in Twilio with uniqueName=${uniqueName}`)
  const rateLimitSid = (await Promise.resolve(rateLimit)).sid

  // Create RateLimitBucket
  const rateLimitBucket = await twilioClient?.verify
    .services(config.twilioAccountVerificationServiceSid)
    .rateLimits(rateLimitSid)
    .buckets.create({
      max: config.twilioVerificationRateLimitMaxRetries,
      interval: config.twilioVerificationRateLimitIntervalSeconds,
    })

  if (!rateLimitBucket) {
    // It should throw an error in this case, but just to be safe
    throw new Error('Could not create rate limit bucket')
  }
  logger.info(`Created RateLimitBucket in Twilio`)
}
