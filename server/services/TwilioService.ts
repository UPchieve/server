import twilio from 'twilio'
import { getCurrentNewYorkTime } from '../utils/get-times'
import config from '../config'
import VolunteerModel, { Volunteer } from '../models/Volunteer'
import { getTestStudentExistsById } from '../models/Student/queries'
import {
  VolunteerContactInfo,
  getVolunteersFailsafe,
  getVolunteersNotifiedSinceDate,
} from '../models/Volunteer/queries'
import { Session } from '../models/Session'
import queue from './QueueService'
import * as SessionRepo from '../models/Session/queries'
import NotificationModel, {
  Notification,
  NotificationDocument,
} from '../models/Notification'
import formatMultiWordSubject from '../utils/format-multi-word-subject'
import Case from 'case'
import logger from '../logger'
import { Types } from 'mongoose'
import { VERIFICATION_METHOD } from '../constants'
import { getIdFromModelReference } from '../utils/model-reference'

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
function getCurrentAvailabilityPath(): string {
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

  // TODO: repo pattern
  const [volunteer] = (await VolunteerModel.aggregate([
    { $match: filter },
    { $project: { phone: 1, firstname: 1 } },
    { $sample: { size: 1 } },
  ])) as VolunteerContactInfo[]

  return volunteer
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
    session.type
  )}/${Case.kebab(session.subTopic)}/${session._id}`
}

export async function getActiveSessionVolunteers(): Promise<Volunteer[]> {
  const activeSessions = await SessionRepo.getActiveSessionsWithVolunteers()
  return activeSessions.map(session => session.volunteer as Volunteer)
}

export function relativeDate(msAgo: number): Date {
  return new Date(new Date().getTime() - msAgo)
}

export async function sendFollowupText(
  sessionId: Types.ObjectId,
  volunteerId: Types.ObjectId,
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
  })

  await recordNotification(sidPromise, notification)
  await SessionRepo.addSessionNotifications(sessionId, [
    notification.toObject(),
  ])
}

export async function notifyVolunteer(
  session: Session
): Promise<Types.ObjectId | undefined> {
  let subtopic = session.subTopic
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

  // Prioritize volunteers who do not have high-level subjects to avoid
  // lack of volunteers when high-level subjects are requested
  const highLevelSubjects = ['calculusAB', 'chemistry', 'statistics']
  const isHighLevelSubject = highLevelSubjects.includes(subtopic)
  const subjectsFilter: any = { $eq: subtopic }
  // If the current subject is not a high level subject,
  // filter out volunteers who have high level subjects
  if (!isHighLevelSubject) subjectsFilter['$nin'] = highLevelSubjects

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
      groupName:
        'Partner volunteers - not notified in the last 3 days AND they don’t have "high level subjects"',
      filter: {
        volunteerPartnerOrg: { $exists: true },
        subjects: subjectsFilter,
        _id: { $nin: activeSessionVolunteers.concat(notifiedLastThreeDays) },
      },
    },
    {
      groupName:
        'Regular volunteers - not notified in the last 3 days AND they don’t have "high level subjects"',
      filter: {
        volunteerPartnerOrg: { $exists: false },
        subjects: subjectsFilter,
        _id: { $nin: activeSessionVolunteers.concat(notifiedLastThreeDays) },
      },
    },
    {
      groupName:
        'Partner volunteers - not notified in the last 24 hours AND they don’t have "high level subjects"',
      filter: {
        volunteerPartnerOrg: { $exists: true },
        subjects: subjectsFilter,
        _id: {
          $nin: activeSessionVolunteers.concat(notifiedLastTwentyFourHours),
        },
      },
    },
    {
      groupName:
        'Regular volunteers - not notified in the last 24 hours AND they don’t have "high level subjects"',
      filter: {
        volunteerPartnerOrg: {
          $exists: false,
        },
        subjects: subjectsFilter,
        _id: {
          $nin: activeSessionVolunteers.concat(notifiedLastTwentyFourHours),
        },
      },
    },
    {
      groupName: 'All volunteers - not notified in the last 24 hours',
      filter: {
        subjects: subtopic,
        _id: {
          $nin: activeSessionVolunteers.concat(notifiedLastTwentyFourHours),
        },
      },
    },
    {
      groupName: 'All volunteers - not notified in the last 60 mins',
      filter: {
        subjects: subtopic,
        _id: { $nin: activeSessionVolunteers.concat(notifiedLastSixtyMins) },
      },
    },
    {
      groupName: 'All volunteers - not notified in the last 15 mins',
      filter: {
        subjects: subtopic,
        _id: { $nin: activeSessionVolunteers.concat(notifiedLastFifteenMins) },
      },
    },
  ]

  let volunteer: VolunteerContactInfo | undefined, priorityGroup: any

  for (const priorityFilter of volunteerPriority) {
    volunteer = await getNextVolunteer(priorityFilter.filter)

    if (volunteer) {
      priorityGroup = priorityFilter.groupName
      break
    }
  }

  if (!volunteer) return

  // Format multi-word subtopics from a key name to a display name
  // ex: physicsOne -> Physics 1
  subtopic = formatMultiWordSubject(subtopic)

  const sessionUrl = getSessionUrl(session)
  const messageText = `Hi ${volunteer.firstname}, a student needs help in ${subtopic} on UPchieve! ${sessionUrl}`
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
  await SessionRepo.addSessionNotifications(session._id, [
    notification.toObject(),
  ])

  return volunteer._id
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
  session: Session
): Promise<void> {
  const isTestUser = await getTestStudentExistsById(
    getIdFromModelReference(session.student)
  )

  if (isTestUser) return

  // Delay initial wave of notifications by 1 min to give
  // volunteers on the dashboard time to pick up the request
  const notificationSchedule = config.notificationSchedule.slice()
  const delay = notificationSchedule.shift()
  await queue.add(
    'NotifyTutors',
    { sessionId: session._id, notificationSchedule },
    { delay }
  )
}

export async function beginFailsafeNotifications(
  session: Session
): Promise<void> {
  await notifyFailsafe(session, false)
}
