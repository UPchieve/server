import Case from 'case'
import { Ulid } from '../models/pgUtils'
import { Socket } from 'socket.io'
import { CustomError } from 'ts-custom-error'
import { TOOL_TYPES } from '../constants'
import { DAYS, HOURS } from '../constants'
import { getMessagesForFrontend, Session } from '../models/Session'
import { MessageForFrontend } from '../models/Session'
import {
  asBoolean,
  asFactory,
  asNumber,
  asOptional,
  asString,
} from './type-utils'

export class StartSessionError extends CustomError {}
export class EndSessionError extends CustomError {}
export class ReportSessionError extends CustomError {}

export function didParticipantsChat(
  messages: MessageForFrontend[],
  studentId: Ulid,
  volunteerId: Ulid
): boolean {
  let studentSentMessage = false
  let volunteerSentMessage = false

  for (const message of messages) {
    const messagerId = message.user
    if (studentId === messagerId) studentSentMessage = true
    if (volunteerId === messagerId) volunteerSentMessage = true
    if (studentSentMessage && volunteerSentMessage) break
  }

  return studentSentMessage && volunteerSentMessage
}

export function getMessagesAfterDate(
  messages: MessageForFrontend[],
  date: Date
): MessageForFrontend[] {
  if (!date) return []

  for (let i = 0; i < messages.length; i++) {
    const message = messages[i]
    if (message.createdAt >= date) return messages.slice(i)
  }

  return []
}

export function isSessionParticipant(
  studentId: Ulid,
  volunteerId?: Ulid,
  userId?: Ulid | null,
  chatbotId?: Ulid | null
): boolean {
  if (!userId) return false

  return (
    userId === studentId ||
    (userId === volunteerId && !!volunteerId) ||
    userId === (chatbotId ? chatbotId : '')
  )
}

export type SessionForTimeTutored = Pick<
  Session,
  'volunteerId' | 'volunteerJoinedAt' | 'endedAt' | 'id'
>
export async function calculateTimeTutored(
  session: SessionForTimeTutored
): Promise<number> {
  const threeHoursMs = 1000 * 60 * 60 * 3
  const fifteenMinsMs = 1000 * 60 * 15

  const { volunteerJoinedAt, endedAt, volunteerId } = session
  const messages = await getMessagesForFrontend(session.id)
  if (!volunteerId || !volunteerJoinedAt || !endedAt) return 0
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
  const hasVolunteerJoined = !!session.volunteerId

  return hasEnded || hasVolunteerJoined
}

export function isSubjectUsingDocumentEditor(toolType: string) {
  return toolType === TOOL_TYPES.DOCUMENT_EDITOR
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
      currentDay[HOURS[hour]] = 0
    }
    heatMap[DAYS[day]] = currentDay as HeatMapDay
  }

  return heatMap as HeatMap
}

export interface RequestIdentifier {
  userAgent: string
  ip: string
}
const requestIdentifierValidators = {
  ip: asString,
  userAgent: asString,
}

export const asRequestIdentifiers = asFactory<RequestIdentifier>(
  requestIdentifierValidators
)

export interface StartSessionData extends RequestIdentifier {
  sessionSubTopic: string
  sessionType: string
  problemId?: string
  assignmentId?: string
  studentId?: string
}
export const asStartSessionData = asFactory<StartSessionData>({
  ...requestIdentifierValidators,
  sessionSubTopic: asString,
  sessionType: asString,
  problemId: asOptional(asString),
  assignmentId: asOptional(asString),
  studentId: asOptional(asString),
})

export interface SessionsToReviewData {
  users: string
  page: string
}
export const asSessionsToReviewData = asFactory<SessionsToReviewData>({
  users: asString,
  page: asString,
})

export interface ReviewSessionData {
  sessionId: Ulid
  reviewed: boolean
  toReview: boolean
}
export const asReviewSessionData = asFactory<ReviewSessionData>({
  sessionId: asString,
  reviewed: asBoolean,
  toReview: asBoolean,
})

export interface ReportSessionData {
  sessionId: Ulid
  reportReason: string
  reportMessage: string
  source?: string
}
export const asReportSessionData = asFactory<ReportSessionData>({
  sessionId: asString,
  reportReason: asString,
  reportMessage: asString,
  source: asOptional(asString),
})

export interface SessionTimedOutData {
  sessionId: Ulid
  timeout: number
  ip: string
  userAgent: string
}
export const asSessionTimedOutData = asFactory<SessionTimedOutData>({
  ...requestIdentifierValidators,
  sessionId: asString,
  timeout: asNumber,
})

interface AdminFilteredSessionsData {
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
export const asAdminFilteredSessionsData = asFactory<AdminFilteredSessionsData>(
  {
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
  }
)

interface PartialSocket {
  id: string
  connected: boolean
  disconnected: boolean
}
interface JoinSessionData {
  socket: Partial<Socket>
  joinedFrom?: string
}
export const asJoinSessionData = asFactory<JoinSessionData>({
  socket: asFactory<PartialSocket>({
    id: asString,
    connected: asBoolean,
    disconnected: asBoolean,
  }),
  joinedFrom: asOptional(asString),
})

interface SaveMessageData {
  sessionId: Ulid
  message: string
}
export const asSaveMessageData = asFactory<SaveMessageData>({
  sessionId: asString,
  message: asString,
})
