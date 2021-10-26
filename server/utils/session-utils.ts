import { Types } from 'mongoose'
import { CustomError } from 'ts-custom-error'
import { Socket } from 'socket.io'
import { Volunteer } from '../models/Volunteer'
import { Student } from '../models/Student'
import { SUBJECTS, SUBJECT_TYPES } from '../constants'
import { Session } from '../models/Session'
import { SessionToEnd } from '../models/Session/queries'
import { Message } from '../models/Message'
import { DAYS, HOURS } from '../models/Availability/types'
import {
  asBoolean,
  asDate,
  asEnum,
  asFactory,
  asNumber,
  asObjectId,
  asOptional,
  asString,
} from './type-utils'
import { User } from '../models/User'
import { InputError } from '../models/Errors'
import Case from 'case'

export class StartSessionError extends CustomError {}
export class EndSessionError extends CustomError {}
export class ReportSessionError extends CustomError {}

export function didParticipantsChat(
  messages: Message[],
  studentId: Types.ObjectId,
  volunteerId: Types.ObjectId
): boolean {
  let studentSentMessage = false
  let volunteerSentMessage = false

  for (const message of messages) {
    const messagerId =
      message.user instanceof Types.ObjectId
        ? message.user
        : (message.user as User)._id

    if (studentId === messagerId) studentSentMessage = true
    if (volunteerId === messagerId) volunteerSentMessage = true
    if (studentSentMessage && volunteerSentMessage) break
  }

  return studentSentMessage && volunteerSentMessage
}

export function getMessagesAfterDate(messages: Message[], date: Date) {
  if (!date) return []

  for (let i = 0; i < messages.length; i++) {
    const message = messages[i]
    if (message.createdAt >= date) return messages.slice(i)
  }

  return []
}

export function isSessionParticipant(
  session: Session | SessionToEnd,
  user: User | null
): boolean {
  if (user === null) return false

  const userId = user._id

  const studentId =
    session.student instanceof Types.ObjectId
      ? session.student
      : (session.student as Student)._id
  const volunteerId =
    session.volunteer instanceof Types.ObjectId || !session.volunteer
      ? session.volunteer
      : (session.volunteer as Volunteer)._id

  return userId === studentId || userId === volunteerId
}

export function calculateTimeTutored(session: Session) {
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

  // TODO: refactor - Don't allow users to send a message once the sessions ends
  // get the latest message that was sent within a 15 minute window of the message prior.
  // Sometimes sessions are not ended by either participant and one of the participants may send
  // a message to see if the other participant is still active before ending the session.
  // Exclude these messages when getting the total session end time
  if (sessionLengthMs > threeHoursMs || wasMessageSentAfterSessionEnded) {
    while (
      latestMessageIndex > 0 &&
      (wasMessageSentAfterSessionEnded ||
        messages[latestMessageIndex].createdAt.getTime() -
          messages[latestMessageIndex - 1].createdAt.getTime() >
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

export function isSessionFulfilled(session: Session) {
  const hasEnded = !!session.endedAt
  const hasVolunteerJoined = !!session.volunteer

  return hasEnded || hasVolunteerJoined
}

// TODO: use an actual subject type
export function isSubjectUsingDocumentEditor(subject: string) {
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
  const heatMap: any = {}

  for (const day in DAYS) {
    const currentDay: any = {}
    for (const hour in HOURS) {
      currentDay[HOURS[hour as keyof typeof HOURS]] = 0
    }
    heatMap[DAYS[day as keyof typeof DAYS]] = currentDay as HeatMapDay
  }

  return heatMap as HeatMap
}

export interface RequestIdentifier {
  userAgent: string
  ip: string
}

// TODO: use User interface instead
interface RequestUser {
  _id: Types.ObjectId
  createdAt: Date
  email: string
  firstname: string
  lastname: string
  isVolunteer: boolean
  isBanned: boolean
}

export interface StartSessionOptions extends RequestIdentifier {
  user: User
  sessionSubTopic: string
  sessionType: SUBJECT_TYPES
  problemId?: string
  assignmentId?: string
  studentId?: string
}

export interface FinishSessionOptions extends RequestIdentifier {
  user: User
  sessionId: Types.ObjectId
}

export interface SessionsToReviewOptions {
  users: string
  page: string
}

export interface ReviewSessionOptions {
  sessionId: Types.ObjectId
  reviewed: boolean
  toReview: boolean
}

export interface ReportSessionOptions {
  user: User
  sessionId: Types.ObjectId
  reportReason: string
  reportMessage: string
}

export interface SessionTimedOutOptions {
  user: User
  sessionId: Types.ObjectId
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
  userAgent: asString,
}

// TODO: add more properties to validate against
const userDataValidators = {
  _id: asObjectId,
  createdAt: asDate,
  email: asString,
  firstname: asString,
  lastname: asString,
  isVolunteer: asBoolean,
  isBanned: asBoolean,
}

const socketUserDataValidators = {
  _id: asString,
  createdAt: asString,
  email: asString,
  firstname: asString,
  lastname: asString,
  isVolunteer: asBoolean,
  isBanned: asBoolean,
}

interface JoinSessionData {
  _id: Types.ObjectId
  createdAt: Date
  endedAt?: Date
  type: string
  subTopic: string
  student: Types.ObjectId
  volunteer?: Types.ObjectId
}

const partialJoinSessionValidators = {
  session: asFactory<JoinSessionData>({
    _id: asObjectId,
    createdAt: asDate,
    endedAt: asOptional(asDate),
    type: asString,
    subTopic: asString,
    student: asObjectId,
    volunteer: asOptional(asObjectId),
  }),
}

export function asSubjectType(s: unknown, errMsg?: string): SUBJECT_TYPES {
  const cb = asEnum<SUBJECT_TYPES>(SUBJECT_TYPES)
  if (typeof s === 'string') {
    const subjectType = Case.camel(s)
    return cb(subjectType)
  }
  throw new InputError(`${errMsg} ${s} is not a string`)
}

// TODO: move the factory methods and validators to a shared file
// TODO: create a factory using User instead of RequestUser
export function asUser(s: unknown, errMsg?: string): User {
  const cb = asFactory<RequestUser>(userDataValidators)
  try {
    const val = cb(s, errMsg)
    return val as User
  } catch (error) {
    throw error
  }
}

export const asStartSessionData = asFactory<StartSessionOptions>({
  ...requestIdentifierValidators,
  user: asUser,
  // TODO: use validation against the enums SUBJECT_TYPES and SUBJECTS
  sessionSubTopic: asString,
  sessionType: asSubjectType,
  problemId: asOptional(asString),
  assignmentId: asOptional(asString),
  studentId: asOptional(asString),
})

export const asFinishSessionData = asFactory<FinishSessionOptions>({
  ...requestIdentifierValidators,
  user: asUser,
  sessionId: asObjectId,
})

export const asSessionsToReviewData = asFactory<SessionsToReviewOptions>({
  users: asString,
  page: asString,
})

export const asReviewSessionData = asFactory<ReviewSessionOptions>({
  sessionId: asObjectId,
  reviewed: asBoolean,
  toReview: asBoolean,
})

export const asReportSessionData = asFactory<ReportSessionOptions>({
  user: asUser,
  sessionId: asObjectId,
  reportReason: asString,
  reportMessage: asString,
})

export const asSessionTimedOutData = asFactory<SessionTimedOutOptions>({
  ...requestIdentifierValidators,
  user: asUser,
  sessionId: asObjectId,
  timeout: asNumber,
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
  page: asString,
})

interface JoinSessionOptions {
  socket: Partial<Socket>
  session: JoinSessionData
  user: User
  joinedFrom?: string
}

export const asJoinSessionData = asFactory<JoinSessionOptions>({
  socket: asFactory<PartialSocket>({
    id: asString,
    connected: asBoolean,
    disconnected: asBoolean,
  }),
  ...partialJoinSessionValidators,
  user: asUser,
  joinedFrom: asOptional(asString),
})

interface NewMessage {
  _id: Types.ObjectId
  user: Types.ObjectId
  contents: string
  createdAt: Date
}

interface SaveMessageOptions {
  sessionId: Types.ObjectId
  user: User
  message: NewMessage
}

export const asSaveMessageData = asFactory<SaveMessageOptions>({
  sessionId: asObjectId,
  user: asUser,
  message: asFactory<NewMessage>({
    _id: asObjectId,
    user: asObjectId,
    contents: asString,
    createdAt: asDate,
  }),
})
