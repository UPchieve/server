import { Types } from 'mongoose'
import { CustomError } from 'ts-custom-error'
import { Socket } from 'socket.io'
import { Volunteer } from '../models/Volunteer'
import { Student } from '../models/Student'
import { USER_SESSION_METRICS, SUBJECTS } from '../constants'
import { Session } from '../models/Session'
import { Message } from '../models/Message'
import { DAYS, HOURS } from '../models/Availability/types'
import {
  asArray,
  asBoolean,
  asDate,
  asEnum,
  asFactory,
  asNumber,
  asObjectId,
  asOptional,
  asString
} from './type-utils'

export class StartSessionError extends CustomError {}
export class EndSessionError extends CustomError {}
export class ReportSessionError extends CustomError {}

export function didParticipantsChat(messages, studentId, volunteerId) {
  let studentSentMessage = false
  let volunteerSentMessage = false

  for (const message of messages) {
    const messager = message.user.toString()
    if (studentId.equals(messager)) studentSentMessage = true
    if (volunteerId.equals(messager)) volunteerSentMessage = true
    if (studentSentMessage && volunteerSentMessage) break
  }

  return studentSentMessage && volunteerSentMessage
}

export function getMessagesAfterDate(messages, date) {
  if (!date) return []

  for (let i = 0; i < messages.length; i++) {
    const message = messages[i]
    if (message.createdAt >= date) return messages.slice(i)
  }

  return []
}

export function isSessionParticipant(session, user) {
  const userId = user._id.toString()
  const studentId = session.student._id
    ? session.student._id.toString()
    : session.student.toString()
  const volunteerId = session.volunteer?._id
    ? session.volunteer._id.toString()
    : session.volunteer?.toString()
  return userId === studentId || userId === volunteerId
}

export function calculateTimeTutored(session) {
  const threeHoursMs = 1000 * 60 * 60 * 3
  const fifteenMinsMs = 1000 * 60 * 15

  const { volunteerJoinedAt, endedAt, messages, volunteer } = session
  if (!volunteer) return 0
  // skip if no messages are sent
  if (messages.length === 0) return 0

  const volunteerJoinDate = new Date(volunteerJoinedAt)
  const sessionEndDate = new Date(endedAt)
  let sessionLengthMs = sessionEndDate.getTime() - volunteerJoinDate.getTime()

  // skip if volunteer joined after the session ended
  if (sessionLengthMs < 0) return 0

  let latestMessageIndex = messages.length - 1
  let wasMessageSentAfterSessionEnded =
    messages[latestMessageIndex].createdAt > sessionEndDate

  // @todo: refactor - Don't allow users to send a message once the sessions ends
  // get the latest message that was sent within a 15 minute window of the message prior.
  // Sometimes sessions are not ended by either participant and one of the participants may send
  // a message to see if the other participant is still active before ending the session.
  // Exclude these messages when getting the total session end time
  if (sessionLengthMs > threeHoursMs || wasMessageSentAfterSessionEnded) {
    while (
      latestMessageIndex > 0 &&
      (wasMessageSentAfterSessionEnded ||
        messages[latestMessageIndex].createdAt -
          messages[latestMessageIndex - 1].createdAt >
          fifteenMinsMs)
    ) {
      latestMessageIndex--
      wasMessageSentAfterSessionEnded =
        messages[latestMessageIndex].createdAt > sessionEndDate
    }
  }

  const latestMessageDate = new Date(messages[latestMessageIndex].createdAt)

  // skip if the latest message was sent before a volunteer joined
  // or skip if the only messages that were sent were after a session has ended
  if (latestMessageDate <= volunteerJoinDate || wasMessageSentAfterSessionEnded)
    return 0

  sessionLengthMs = latestMessageDate.getTime() - volunteerJoinDate.getTime()
  return sessionLengthMs
}

export function isSessionFulfilled(session) {
  const hasEnded = !!session.endedAt
  const hasVolunteerJoined = !!session.volunteer

  return hasEnded || hasVolunteerJoined
}

export function isSubjectUsingDocumentEditor(subject) {
  switch (subject) {
    case SUBJECTS.SAT_READING:
    case SUBJECTS.ESSAYS:
    case SUBJECTS.PLANNING:
    case SUBJECTS.APPLICATIONS:
    case SUBJECTS.HUMANITIES_ESSAYS:
      return true
    default:
      return false
  }
}

export type HeatMapDay = {
  [hour in HOURS]: number
}

export type HeatMap = {
  [day in DAYS]: HeatMapDay
}

export function createEmptyHeatMap() {
  const heatMap = {}

  for (const day in DAYS) {
    const currentDay = {}
    for (const hour in HOURS) {
      currentDay[HOURS[hour]] = 0
    }
    heatMap[DAYS[day]] = currentDay
  }

  return heatMap as HeatMap
}

export interface RequestIdentifier {
  userAgent: string
  ip: string
}

// @todo: use User interface instead
interface RequestUser {
  _id: Types.ObjectId
  createdAt: Date
  email: string
  firstname: string
  lastname: string
  isVolunteer: boolean
  isBanned: boolean
}

export type SocketUser = Omit<RequestUser, '_id' | 'createdAt'> & {
  _id: string
  createdAt: string
}

export interface StartSessionOptions extends RequestIdentifier {
  user: RequestUser
  sessionSubTopic: string
  sessionType: string
  problemId?: string
  assignmentId?: string
  studentId?: string
}

export interface FinishSessionOptions extends RequestIdentifier {
  user: RequestUser
  sessionId: string
}

export interface SessionsToReviewOptions {
  users: string
  page: string
}

export interface ReviewSessionOptions {
  sessionId: string
  reviewed: boolean
  toReview: boolean
}

export interface ReportSessionOptions {
  user: RequestUser
  sessionId: string
  reportReason: string
  reportMessage: string
}

export interface SessionTimedOutOptions {
  user: Partial<Student | Volunteer>
  sessionId: string
  timeout: number
  ip: string
  userAgent: string
}

interface PartialSocket {
  id: string
  connected: boolean
  disconnected: boolean
}

const requestIdentifierValidators = {
  ip: asString,
  userAgent: asString
}

// @todo: add more properties to validate against
const userDataValidators = {
  _id: asObjectId,
  createdAt: asDate,
  email: asString,
  firstname: asString,
  lastname: asString,
  isVolunteer: asBoolean,
  isBanned: asBoolean
}

const socketUserDataValidators = {
  _id: asString,
  createdAt: asString,
  email: asString,
  firstname: asString,
  lastname: asString,
  isVolunteer: asBoolean,
  isBanned: asBoolean
}

// @todo: create asSession factory
const sessionDataValidators = {
  session: asFactory<Session>({
    _id: asObjectId,
    createdAt: asDate,
    type: asString,
    subTopic: asString,
    student: asObjectId,
    volunteer: asOptional(asObjectId),
    messages: asOptional(
      asArray(
        asFactory<Message>({
          _id: asObjectId,
          user: asObjectId,
          contents: asString,
          createdAt: asDate
        })
      )
    ),
    hasWhiteboardDoc: asOptional(asBoolean),
    quillDoc: asOptional(asString),
    volunteerJoinedAt: asOptional(asDate),
    failedJoins: asArray(asObjectId),
    endedAt: asOptional(asDate),
    endedBy: asOptional(asObjectId),
    notifications: asArray(asObjectId),
    photos: asArray(asString),
    isReported: asOptional(asBoolean),
    reportReason: asOptional(asString),
    reportMessage: asOptional(asString),
    flags: asArray(asEnum(USER_SESSION_METRICS)),
    reviewed: asOptional(asBoolean),
    toReview: asOptional(asBoolean),
    reviewReasons: asArray(asEnum(USER_SESSION_METRICS)),
    timeTutored: asOptional(asNumber),
    whiteboardDoc: asOptional(asString)
  })
}

// @todo: move the factory methods and validators to a shared file
// @todo: create a factory using User
export const asUser = asFactory<RequestUser>(userDataValidators)
export const asSocketUser = asFactory<SocketUser>(socketUserDataValidators)

export const asStartSessionData = asFactory<StartSessionOptions>({
  ...requestIdentifierValidators,
  user: asUser,
  sessionSubTopic: asString,
  sessionType: asString,
  problemId: asOptional(asString),
  assignmentId: asOptional(asString),
  studentId: asOptional(asString)
})

export const asFinishSessionData = asFactory<FinishSessionOptions>({
  ...requestIdentifierValidators,
  user: asUser,
  sessionId: asString
})

export const asSessionsToReviewData = asFactory<SessionsToReviewOptions>({
  users: asString,
  page: asString
})

export const asReviewSessionData = asFactory<ReviewSessionOptions>({
  sessionId: asString,
  reviewed: asBoolean,
  toReview: asBoolean
})

export const asReportSessionData = asFactory<ReportSessionOptions>({
  user: asUser,
  sessionId: asString,
  reportReason: asString,
  reportMessage: asString
})

export const asSessionTimedOutData = asFactory<SessionTimedOutOptions>({
  ...requestIdentifierValidators,
  user: asUser,
  sessionId: asString,
  timeout: asNumber
})

interface AdminFilteredSessionsOptions {
  showBannedUsers: string
  showTestUsers: string
  minSessionLength: string
  sessionActivityFrom: string
  sessionActivityTo: string
  minMessagesSent: string
  studentRating: string
  volunteerRating: string
  firstTimeStudent: string
  firstTimeVolunteer: string
  isReported: string
  page: string
}

export const asAdminFilteredSessionsData = asFactory<
  AdminFilteredSessionsOptions
>({
  showBannedUsers: asString,
  showTestUsers: asString,
  minSessionLength: asString,
  sessionActivityFrom: asString,
  sessionActivityTo: asString,
  minMessagesSent: asString,
  studentRating: asString,
  volunteerRating: asString,
  firstTimeStudent: asString,
  firstTimeVolunteer: asString,
  isReported: asString,
  page: asString
})

interface JoinSessionOptions {
  socket: Partial<Socket>
  session: Session
  user: Partial<Student | Volunteer>
  joinedFrom: string
}

export const asJoinSessionData = asFactory<JoinSessionOptions>({
  socket: asFactory<PartialSocket>({
    id: asString,
    connected: asBoolean,
    disconnected: asBoolean
  }),
  ...sessionDataValidators,
  user: asUser,
  joinedFrom: asOptional(asString)
})

interface NewMessage {
  user: string
  contents: string
  createdAt: Date
}

interface SaveMessageOptions {
  sessionId: string
  user: SocketUser
  message: NewMessage
}

export const asSaveMessageData = asFactory<SaveMessageOptions>({
  sessionId: asString,
  user: asSocketUser,
  message: asFactory<NewMessage>({
    user: asString,
    contents: asString,
    createdAt: asDate
  })
})
