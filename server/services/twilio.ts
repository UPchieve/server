import twilio from 'twilio'
const moment = require('moment-timezone')
import config from '../config'
import Student from '../models/Student'
import Volunteer from '../models/Volunteer'
import queue from './QueueService'
import * as SessionService from './SessionService'
const twilioClient =
  config.accountSid && config.authToken
    ? twilio(config.accountSid, config.authToken)
    : null
import formatMultiWordSubject from '../utils/format-multi-word-subject'
import Case from 'case'
import NotificationModel, { Notification, NotificationDocument } from '../models/Notification'
import { Session } from '../models/Session'
import { Types } from 'mongoose'
import logger from '../logger'

// get the availability field to query for the current time
function getCurrentAvailabilityPath() {
  const dateString = new Date().toUTCString()
  const date = moment.utc(dateString).tz('America/New_York')
  const day = date.isoWeekday() - 1
  let hour = date.hour()

  if (hour >= 12) {
    if (hour > 12) {
      hour -= 12
    }
    hour = `${hour}p`
  } else {
    if (hour === 0) {
      hour = 12
    }
    hour = `${hour}a`
  }

  const days = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
  ]

  return `availability.${days[day]}.${hour}`
}

async function getNextVolunteer(priorityFilter: {} = {}) {
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
    ...priorityFilter
  }

  const query = Volunteer.aggregate([
    { $match: filter },
    { $project: { phone: 1, firstname: 1 } },
    { $sample: { size: 1 } }
  ])

  const volunteers = await query.exec()
  return volunteers[0]
}

// query failsafe volunteers to notify
async function getFailsafeVolunteers() {
  return Volunteer.find({ isFailsafeVolunteer: true })
    .select({ phone: 1, firstname: 1 })
    .exec()
}

function sendTextMessage(phoneNumber: string, messageText: string) {
  console.log(`Sending text message "${messageText}" to ${phoneNumber}`)

  // If stored phone number doesn't have international calling code (E.164 formatting)
  // then default to US number
  // @todo: normalize previously stored US phone numbers
  const fullPhoneNumber =
    phoneNumber[0] === '+' ? phoneNumber : `+1${phoneNumber}`

  if (!twilioClient) {
    logger.error('Twilio client not loaded.')
    return Promise.reject('Twilio client not loaded')
  }
  return twilioClient.messages
    .create({
      to: fullPhoneNumber,
      from: config.sendingNumber,
      body: messageText
    })
    .then(message => {
      console.log(
        `Message sent to ${phoneNumber} with message id \n` + message.sid
      )
      return message.sid
    })
}

function sendVoiceMessage(phoneNumber: string, messageText: string) {
  console.log(`Sending voice message "${messageText}" to ${phoneNumber}`)

  let apiRoot
  if (config.NODE_ENV === 'production') {
    apiRoot = `https://${config.host}/twiml`
  } else {
    apiRoot = `http://${config.host}/twiml`
  }

  // URL for Twilio to retrieve the TwiML with the message text and voice
  const url = apiRoot + '/message/' + encodeURIComponent(messageText)

  // If stored phone number doesn't have international calling code (E.164 formatting)
  // then default to US number
  // @todo: normalize previously stored US phone numbers
  const fullPhoneNumber =
    phoneNumber[0] === '+' ? phoneNumber : `+1${phoneNumber}`

  // initiate call, giving Twilio the aforementioned URL which Twilio
  // opens when the call is answered to get the TwiML instructions
  if (!twilioClient) {
    console.log('Twilio client not loaded.')
    return Promise.resolve()
  }
  return twilioClient.calls
    .create({
      url: url,
      to: fullPhoneNumber,
      from: config.sendingNumber
    })
    .then(call => {
      console.log(`Voice call to ${phoneNumber} with id ${call.sid}`)
      return call.sid
    })
}

// the URL that the volunteer can use to join the session on the client
export function getSessionUrl(session: Session) {
  const protocol = config.NODE_ENV === 'production' ? 'https' : 'http'
  return `${protocol}://${config.client.host}/session/${Case.kebab(
    session.type!
  )}/${Case.kebab(session.subTopic!)}/${session._id}`
}

async function getActiveSessionVolunteers() {
  const activeSessions = await SessionService.getActiveSessionsWithVolunteers()
  return activeSessions.map(session => session.volunteer)
}

function relativeDate (msAgo: number) {
  return new Date(new Date().getTime() - msAgo).toISOString()
}

async function getVolunteersNotifiedSince (sinceDate: Date) {
  const notifications = await NotificationModel.find({
    sentAt: { $gt: sinceDate }
  })
    .select('volunteer')
    .lean()
    .exec()

  return notifications.map(notif => notif.volunteer)
}

export async function sendFollowupText(session: Session, volunteerId: Types.ObjectId, volunteerPhone: string) {
  const messageText = `Head's up: this student is still waiting for help!`
  const sendPromise = sendTextMessage(volunteerPhone, messageText)
  const notification = new NotificationModel({
    volunteer: volunteerId,
    type: 'REGULAR',
    method: 'SMS',
    priorityGroup: 'follow-up'
  })

  await recordNotification(sendPromise, notification)
  await SessionService.addNotifications(session._id, [notification])
}

export async function notifyVolunteer (session: Session) {
  let subtopic = session.subTopic
  const activeSessionVolunteers = await getActiveSessionVolunteers()
  const notifiedLastFifteenMins = await getVolunteersNotifiedSince(
    new Date(relativeDate(15 * 60 * 1000))
  )
  const notifiedLastSixtyMins = await getVolunteersNotifiedSince(
    new Date(relativeDate(60 * 60 * 1000))
  )
  const notifiedLastTwentyFourHours = await getVolunteersNotifiedSince(
    new Date(relativeDate(24 * 60 * 60 * 1000))
  )
  const notifiedLastThreeDays = await getVolunteersNotifiedSince(
    new Date(relativeDate(3 * 24 * 60 * 60 * 1000))
  )

  // Prioritize volunteers who do not have high-level subjects to avoid
  // lack of volunteers when high-level subjects are requested
  const highLevelSubjects = ['calculusAB', 'chemistry', 'statistics']
  let isHighLevelSubject
  if (subtopic != null) {
    isHighLevelSubject = highLevelSubjects.includes(subtopic)
  }
  const subjectsFilter = { $eq: subtopic }
  // If the current subject is not a high level subject,
  // filter out volunteers who have high level subjects
  if (!isHighLevelSubject) (subjectsFilter as Record<string, any>)['$nin'] = highLevelSubjects

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
        _id: { $nin: activeSessionVolunteers.concat(notifiedLastThreeDays) }
      }
    },
    {
      groupName:
        'Regular volunteers - not notified in the last 3 days AND they don’t have "high level subjects"',
      filter: {
        volunteerPartnerOrg: { $exists: false },
        subjects: subjectsFilter,
        _id: { $nin: activeSessionVolunteers.concat(notifiedLastThreeDays) }
      }
    },
    {
      groupName:
        'Partner volunteers - not notified in the last 24 hours AND they don’t have "high level subjects"',
      filter: {
        volunteerPartnerOrg: { $exists: true },
        subjects: subjectsFilter,
        _id: {
          $nin: activeSessionVolunteers.concat(notifiedLastTwentyFourHours)
        }
      }
    },
    {
      groupName:
        'Regular volunteers - not notified in the last 24 hours AND they don’t have "high level subjects"',
      filter: {
        volunteerPartnerOrg: {
          $exists: false
        },
        subjects: subjectsFilter,
        _id: {
          $nin: activeSessionVolunteers.concat(notifiedLastTwentyFourHours)
        }
      }
    },
    {
      groupName: 'All volunteers - not notified in the last 24 hours',
      filter: {
        subjects: subtopic,
        _id: {
          $nin: activeSessionVolunteers.concat(notifiedLastTwentyFourHours)
        }
      }
    },
    {
      groupName: 'All volunteers - not notified in the last 60 mins',
      filter: {
        subjects: subtopic,
        _id: { $nin: activeSessionVolunteers.concat(notifiedLastSixtyMins) }
      }
    },
    {
      groupName: 'All volunteers - not notified in the last 15 mins',
      filter: {
        subjects: subtopic,
        _id: { $nin: activeSessionVolunteers.concat(notifiedLastFifteenMins) }
      }
    }
  ]

  let volunteer, priorityGroup

  for (const priorityFilter of volunteerPriority) {
    volunteer = await getNextVolunteer({
      priorityFilter: priorityFilter.filter
    })

    if (volunteer) {
      priorityGroup = priorityFilter.groupName
      break
    }
  }

  if (!volunteer) return null

  // Format multi-word subtopics from a key name to a display name
  // ex: physicsOne -> Physics 1
  if (subtopic)
    subtopic = formatMultiWordSubject(subtopic)

  const sessionUrl = getSessionUrl(session)
  const messageText = `Hi ${volunteer.firstname}, a student needs help in ${subtopic} on UPchieve! ${sessionUrl}`
  const sendPromise = sendTextMessage(volunteer.phone, messageText)

  const notification = new NotificationModel({
    volunteer,
    type: 'REGULAR',
    method: 'SMS',
    priorityGroup
  })

  await recordNotification(sendPromise, notification)
  await SessionService.addNotifications(session._id, [notification])

  return volunteer
}

async function notifyFailsafe (session: Session, voice: boolean = false) {
  const subtopic = session.subTopic
  const sessionUrl = getSessionUrl(session)
  const volunteersToNotify = await getFailsafeVolunteers()
  const student = await Student.findOne({ _id: session.student })
    .select('isTestUser')
    .lean()
    .exec()
  if (!student) {
    throw new Error('no student found')
  }

  const notifications = []

  for (const volunteer of volunteersToNotify) {
    const phoneNumber = volunteer.phone

    let messageText = `UPchieve failsafe alert: new ${subtopic} request`

    if (student.isTestUser) messageText = '[TEST USER] ' + messageText
    if (!voice) messageText = messageText + `\n${sessionUrl}`

    let sendPromise
    if (phoneNumber) {
      sendPromise = voice
        ? sendVoiceMessage(phoneNumber, messageText)
        : sendTextMessage(phoneNumber, messageText)
    }
    if (!sendPromise) {
      throw new Error('no sendPromise function to send a notification')
    }

    // record notification to database
    const notification = new NotificationModel({
      volunteer: volunteer,
      type: 'FAILSAFE',
      method: voice ? 'VOICE' : 'SMS'
    })

    try {
      notifications.push(await recordNotification(sendPromise, notification))
    } catch (err) {
      console.log(err)
    }
  }

  // save notifications to session object
  await SessionService.addNotifications(session._id, notifications)
}

/**
 * Helper function to record notifications, whether successful or
 * failed, to the database
 * after the message is sent to Twilio
 * @returns a Promise that resolves to the saved notification object
 * @param sendPromise a Promise that resolves to the message SID
 * @param notification the notification object to save
 */
function recordNotification(sendPromise: Promise<string|void>, notification: Notification) {
  return sendPromise
    .then((sid?: string) => {
      // record notification in database
      notification.wasSuccessful = true
      if (sid)
        notification.messageId = sid
      return notification
    })
    .catch((err: Error) => {
      // record notification failure in database
      console.log(err)
      notification.wasSuccessful = false
      return notification
    })
    .then((notification: NotificationDocument) => {
      return notification.save()
    })
}

export function sendVerification(sendTo: string, verificationMethod: string, firstName: string) {
  if (!twilioClient) {
    logger.error('Twilio client not loaded')
    throw new Error('Twilio client not loaded')
  }
  return twilioClient.verify
    .services(config.twilioAccountVerificationServiceSid)
    .verifications.create({
      to: sendTo,
      channel: verificationMethod,
      channelConfiguration: {
        substitutions: {
          firstName
        }
      }
    })
}

export function confirmVerification(to: string, code: string) {
  if (!twilioClient) {
    logger.error('Twilio client not loaded')
    throw new Error('Twilio client not loaded')
  }
  return twilioClient.verify
    .services(config.twilioAccountVerificationServiceSid)
    .verificationChecks.create({ to, code })
}


export async function beginRegularNotifications(session: Session) {
  const student = await Student.findOne({ _id: session.student })
    .lean()
    .exec()
  if (!student) throw new Error(`student with id ${session.student.toString()} could not be found`)
  if (student.isTestUser) return

  // Delay initial wave of notifications by 1 min to give
  // volunteers on the dashboard time to pick up the request
  const notificationSchedule = config.notificationSchedule.slice()
  const delay = notificationSchedule.shift()
  queue.add(
    'NotifyTutors',
    { sessionId: session._id, notificationSchedule },
    { delay }
  )
}

export async function beginFailsafeNotifications(session: Session) {
  await notifyFailsafe(session, false)
}
