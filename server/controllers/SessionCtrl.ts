import { captureException } from '@sentry/node'
import { UpdateQuery } from 'mongoose'
import { Socket } from 'socket.io'
import SessionModel, { SessionDocument } from '../models/Session'
import { User } from '../models/User'
import { SessionActionCreator } from '../controllers/UserActionCtrl'
import {
  beginRegularNotifications,
  beginFailsafeNotifications
} from '../services/twilio'
import { addFailedJoins } from '../services/SessionService'
import PushTokenService from '../services/PushTokenService'
import PushTokenModel from '../models/PushToken'
import { MessageDocument } from '../models/Message'
import { StudentDocument } from '../models/Student'
import { captureEvent } from '../services/AnalyticsService'
import { EVENTS } from '../constants'

export interface CreateSessionOptions {
  user: User
  type: string
  subTopic: string
}

export async function create(
  options: CreateSessionOptions
): Promise<SessionDocument> {
  const user = options.user
  const userId = user._id
  const type = options.type
  const subTopic = options.subTopic

  if (!userId) throw new Error('Cannot create a session without a user id')
  if (user.isVolunteer) throw new Error('Volunteers cannot create new sessions')
  if (!type) throw new Error('Must provide a type for a new session')

  const currentSession = await SessionModel.current(userId)
  if (currentSession) throw new Error('Student already has an active session')

  const session = new SessionModel({
    student: userId,
    type: type,
    subTopic: subTopic
  })

  const savedSession: SessionDocument = await session.save()

  if (!user.isBanned) {
    beginRegularNotifications(savedSession)
    beginFailsafeNotifications(savedSession)
  }

  return savedSession
}

// Currently exposed for Cypress e2e tests
export async function endAll(user: User): Promise<void> {
  await SessionModel.update(
    {
      $and: [{ student: user._id }, { endedAt: { $exists: false } }]
    },
    { endedAt: new Date(), endedBy: user._id }
  ).exec()
}

// Given a sessionId and userId, join the user to the session and send necessary
// socket events and notifications
export interface SessionJoinOptions {
  socket: Socket
  session: SessionDocument
  user: User
  joinedFrom: string
}

export async function join(options: SessionJoinOptions): Promise<void> {
  const { socket, session, user, joinedFrom } = options
  const userAgent = socket.request.headers['user-agent']
  const ipAddress = socket.handshake.address

  if (session.endedAt) {
    addFailedJoins({
      userId: user._id,
      sessionId: session._id
    })
    throw new Error('Session has ended')
  }

  if (
    !user.isVolunteer &&
    session.student &&
    session.student.toString() !== user._id.toString()
  ) {
    addFailedJoins({
      userId: user._id,
      sessionId: session._id
    })
    // eslint-disable-next-line quotes
    throw new Error(`A student cannot join another student's session`)
  }

  if (
    user.isVolunteer &&
    session.volunteer &&
    session.volunteer.toString() !== user._id.toString()
  ) {
    addFailedJoins({
      userId: user._id,
      sessionId: session._id
    })
    throw new Error('A volunteer has already joined the session')
  }

  const isInitialVolunteerJoin = user.isVolunteer && !session.volunteer
  if (isInitialVolunteerJoin) {
    await SessionModel.updateOne(
      { _id: session._id },
      {
        volunteerJoinedAt: new Date(),
        volunteer: user._id
      }
    )
    new SessionActionCreator(user._id, session._id, userAgent, ipAddress)
      .joinedSession()
      .catch(error => captureException(error))

    captureEvent(user._id, EVENTS.SESSION_JOINED, {
      event: EVENTS.SESSION_JOINED,
      sessionId: session._id.toString(),
      joinedFrom: joinedFrom || ''
    })

    captureEvent(session.student.toString(), EVENTS.SESSION_MATCHED, {
      event: EVENTS.SESSION_MATCHED,
      sessionId: session._id.toString()
    })

    const pushTokens = await PushTokenModel.find({ user: session.student })
      .lean()
      .exec()
    if (pushTokens && pushTokens.length > 0) {
      const tokens = pushTokens.map(token => token.token)
      PushTokenService.sendVolunteerJoined(session, tokens)
    }
  }

  // After 30 seconds of the this.createdAt, we can assume the user is
  // rejoining the session instead of joining for the first time
  const thirtySecondsElapsed = 1000 * 30
  if (
    !isInitialVolunteerJoin &&
    session.createdAt.getTime() + thirtySecondsElapsed < Date.now()
  ) {
    new SessionActionCreator(user._id, session._id, userAgent, ipAddress)
      .rejoinedSession()
      .catch(error => captureException(error))
    captureEvent(user._id, EVENTS.SESSION_REJOINED, {
      event: EVENTS.SESSION_REJOINED,
      sessionId: session._id.toString()
    })
  }
}

// verify that a user is a session participant
function verifySessionParticipant(
  session: SessionDocument,
  user: User,
  error: Error
): void {
  // all participants in the session
  const sessionParticipants = [session.student, session.volunteer].filter(
    element => !!element
  )

  if (
    sessionParticipants.findIndex(
      participant =>
        (participant as StudentDocument)._id &&
        (participant as StudentDocument)._id.equals(user._id)
    ) === -1
  ) {
    throw error
  }
}

// deliver a message
export interface SaveMessageOptions {
  sessionId: string
  user: User
  message: MessageDocument
}

export async function saveMessage(
  options: SaveMessageOptions
): Promise<UpdateQuery<SessionDocument>> {
  const { sessionId, user, message } = options
  const session = await SessionModel.findById(sessionId).exec()
  if (!session) {
    throw new Error('No session found with that ID!')
  }

  verifySessionParticipant(
    session,
    user,
    new Error('Only session participants are allowed to send messages')
  )

  return SessionModel.updateOne(
    {
      _id: sessionId
    },
    { $push: { messages: message } }
  )
}
