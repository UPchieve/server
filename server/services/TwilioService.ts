import twilio from 'twilio'
import { getCurrentNewYorkTime } from '../utils/get-times'
import config from '../config'
import moment from 'moment'
import {
  getFavoriteVolunteersByStudentId,
  getStudentContactInfoById,
  getTestStudentExistsById,
} from '../models/Student'
import {
  VolunteerContactInfo,
  getVolunteersNotifiedBySessionId,
} from '../models/Volunteer'
import QueueService from './QueueService'
import * as SessionRepo from '../models/Session'
import * as VolunteerRepo from '../models/Volunteer'
import Case from 'case'
import logger from '../logger'
import { VERIFICATION_METHOD, SUBJECTS } from '../constants'
import startsWithVowel from '../utils/starts-with-vowel'
import { Ulid } from '../models/pgUtils'
import { getSessionById, NotificationData } from '../models/Session'
import {
  AssociatedPartner,
  getAssociatedPartnerBySponsorOrg,
  getAssociatedPartnerByPartnerOrg,
} from '../models/AssociatedPartner'
import { getSponsorOrgs } from '../models/SponsorOrg'
import { Jobs } from '../worker/jobs'
import {
  getProcrastinationTextReminderCopy,
  getMutedSubjectAlertsFlag,
} from './FeatureFlagService'

const protocol = config.NODE_ENV === 'production' ? 'https' : 'http'
const apiRoot =
  config.NODE_ENV === 'production'
    ? `https://${config.host}/twiml`
    : `http://${config.host}/twiml`

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
  if (message.sid) {
    logger.info(
      `Message sent to ${phoneNumber} with message id \n ${message.sid}`
    )
    return message.sid
  }
  throw new Error(
    `Failed to send text message ${messageText} to ${phoneNumber}`
  )
}

export async function sendProcrastinationTextReminder(
  userId: Ulid,
  firstName: string,
  phoneNumber: string
): Promise<string | undefined> {
  let messageCopy = await getProcrastinationTextReminderCopy(userId)
  // Use a default message if no message is found from the flag payload
  if (!messageCopy)
    messageCopy =
      "Hi {{firstName}}! UPchieve here. We're reminding you to stay ahead and avoid that last-minute panic. Tackle procrastination with a study session now: https://app.upchieve.org?s=tr"

  // Feature flag payload will have variables that we want to interpolate
  const messageText = messageCopy.replace('{{firstName}}', firstName)
  logger.info(
    `Sending reminder text ${userId} - "${messageText}" to ${phoneNumber}`
  )

  if (!twilioClient) {
    logger.warn('Twilio client not loaded.')
    return
  }
  const message = await twilioClient.messages.create({
    to: phoneNumber,
    from: config.sendingNumber,
    body: messageText,
  })
  if (message.sid) {
    logger.info(
      `Message sent to user ${userId} at ${phoneNumber} with message id \n ${message.sid}`
    )
    return message.sid
  }
  throw new Error(
    `Failed to send text message to user ${userId} - ${messageText} to ${phoneNumber}`
  )
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

  let notification: NotificationData = {
    wasSuccessful: false,
    messageId: undefined,
    volunteer: volunteerId,
    type: 'followup',
    method: 'sms',
    priorityGroup: 'follow-up',
  }
  try {
    const messageId = await sendTextMessage(volunteerPhone, messageText)
    notification.wasSuccessful = true
    notification.messageId = messageId
  } catch (err) {
    logger.error(err as Error)
  }

  await SessionRepo.addSessionNotification(sessionId, notification)
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
  const sessionUrl = getSessionUrl(session)
  return `Hi ${volunteer.firstName}, ${buildTargetStudentContent(
    volunteer,
    associatedPartner
  )} needs help in ${session.subjectDisplayName} on UPchieve! ${sessionUrl}`
}

export async function getAssociatedPartner(
  partnerOrg: string | undefined,
  highSchoolId: Ulid | undefined
): Promise<AssociatedPartner | undefined> {
  // Determine if the student's partner org is one of the orgs that
  // should have priority matching with its partner volunteer org counterpart
  if (
    partnerOrg &&
    config.priorityMatchingPartnerOrgs.some(org => partnerOrg === org)
  )
    return await getAssociatedPartnerByPartnerOrg(partnerOrg)

  for (const sponsorOrg of config.priorityMatchingSponsorOrgs) {
    // Determine if the student's school belongs to a sponsor org that
    // should have priority matching with its partner volunteer org counterpart
    const sponsorOrgs = await getSponsorOrgs()
    const matchingOrg = sponsorOrgs.find(org => org.key === sponsorOrg)
    if (
      highSchoolId &&
      matchingOrg &&
      Array.isArray(matchingOrg.schoolIds) &&
      matchingOrg.schoolIds.some(schoolId => schoolId === highSchoolId)
    )
      return await getAssociatedPartnerBySponsorOrg(sponsorOrg)

    // Determine if the student's partner org belongs to a sponsor org that
    // should have priority matching with its partner volunteer org counterpart
    if (
      partnerOrg &&
      matchingOrg &&
      Array.isArray(matchingOrg.studentPartnerOrgKeys) &&
      matchingOrg.studentPartnerOrgKeys.includes(partnerOrg)
    )
      return await getAssociatedPartnerBySponsorOrg(sponsorOrg)
  }

  return undefined
}

export async function notifyVolunteer(
  session: SessionRepo.Session
): Promise<Ulid | undefined> {
  const student = await getStudentContactInfoById(session.studentId)
  if (!student) return

  const favoriteVolunteers = await getFavoriteVolunteersByStudentId(student.id)

  const associatedPartner = student.studentPartnerOrg
    ? await getAssociatedPartner(student.studentPartnerOrg, student.schoolId)
    : undefined

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
          lastNotified: moment()
            .subtract(15, 'minutes')
            .toDate(),
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
          lastNotified: moment()
            .subtract(3, 'days')
            .toDate(),
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
          lastNotified: moment()
            .subtract(3, 'days')
            .toDate(),
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
          lastNotified: moment()
            .subtract(1, 'day')
            .toDate(),
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
          lastNotified: moment()
            .subtract(1, 'day')
            .toDate(),
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
          lastNotified: moment()
            .subtract(1, 'day')
            .toDate(),
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
          lastNotified: moment()
            .subtract(1, 'hour')
            .toDate(),
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
          lastNotified: moment()
            .subtract(15, 'minutes')
            .toDate(),
          isPartner: undefined,
          highLevelSubjects: undefined,
          disqualifiedVolunteers,
          specificPartner: undefined,
          favoriteVolunteers: undefined,
        }),
    },
  ]

  let volunteer: VolunteerContactInfo | undefined
  let priorityGroup: any

  for (const priorityFilter of volunteerPriority) {
    volunteer = await priorityFilter.query()
    if (volunteer) {
      const mutedSubjectAlertsFlag = await getMutedSubjectAlertsFlag(
        volunteer.id
      )
      if (mutedSubjectAlertsFlag) {
        const volunteerMutedSubject = await VolunteerRepo.checkIfVolunteerMutedSubject(
          volunteer.id,
          session.subject
        )
        if (volunteerMutedSubject) {
          volunteer = undefined
          continue
        }
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
  try {
    const messageId = await sendTextMessage(volunteer.phone, messageText)
    notification.wasSuccessful = true
    notification.messageId = messageId
  } catch (err) {
    logger.error(err as Error)
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
  sessionId: Ulid
): Promise<void> {
  const session = await getSessionById(sessionId)
  const isTestUser = await getTestStudentExistsById(session.studentId)

  if (isTestUser) return
  // Delay initial wave of notifications by 1 min to give
  // volunteers on the dashboard time to pick up the request
  const notificationSchedule = config.notificationSchedule.slice()
  const delay = notificationSchedule.shift()
  await QueueService.add(
    Jobs.NotifyTutors,
    { sessionId, notificationSchedule, currentNotificationRound: 1 },
    { delay, removeOnComplete: true, removeOnFail: true }
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
    rateLimit =>
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
