/**
 * Processes incoming socket messages
 */
import Sentry from '@sentry/node'
import { PGStore } from 'connect-pg-simple'
import session from 'express-session'
import newrelic from 'newrelic'
import passport from 'passport'
import { LockError } from 'redlock'
import { Server, Socket } from 'socket.io'
import { isEnabled } from 'unleash-client'
import { v4 as uuidv4 } from 'uuid'
import * as cache from '../../cache'
import config from '../../config'
import { EVENTS, FEATURE_FLAGS, SESSION_ACTIVITY_KEY } from '../../constants'
import logger from '../../logger'
import { Ulid } from '../../models/pgUtils'
import { getSessionHistoryIdsByUserId, Session } from '../../models/Session'
import * as SessionRepo from '../../models/Session/queries'
import { getUserContactInfoById, UserContactInfo } from '../../models/User'
import { captureEvent } from '../../services/AnalyticsService'
import { getRecapSocketUpdatesFeatureFlag } from '../../services/FeatureFlagService'
import QueueService from '../../services/QueueService'
import * as QuillDocService from '../../services/QuillDocService'
import * as SessionService from '../../services/SessionService'
import SocketService from '../../services/SocketService'
import { lookupChatbotFromCache } from '../../utils/chatbot-lookup'
import getSessionRoom from '../../utils/get-session-room'
import { getSocketIdsFromRoom, remoteJoinRoom } from '../../utils/socket-utils'
import { Jobs } from '../../worker/jobs'
import { extractSocketUser, SocketUser } from '../extract-user'

// Custom API key handlers
async function handleChatBot(socket: Socket, key: string) {
  logger.debug(`Attempted key: ${key}`)
  if (key !== config.socketApiKey) throw new Error('User not authenticated')
  logger.debug('Chatbot connected to socket!')
}

async function handleUser(socket: Socket, user: UserContactInfo) {
  // Join a user to their own room to handle the event where a user might have
  // multiple socket connections open
  socket.join(user.id.toString())
  logger.debug('User connected to socket!')

  const latestSession = await SessionService.currentSession(user.id)

  // Join user to their latest session if it has not ended
  if (latestSession && !latestSession.endedAt) {
    socket.join(getSessionRoom(latestSession.id))
    socket.emit('session-change', latestSession)
  }

  if (user && user.isVolunteer) socket.join('volunteers')
}

export function routeSockets(io: Server, sessionStore: PGStore): void {
  const socketService = SocketService.getInstance(io)

  let chatbot: Ulid | undefined

  // Authentication middleware for sockets
  const wrap = (middleware: Function) => (socket: Socket, next: Function) =>
    middleware(socket.request, {}, next)
  const sessionMiddleware = session({
    resave: false,
    saveUninitialized: false,
    secret: config.sessionSecret,
    store: sessionStore,
    cookie: {
      httpOnly: false,
      maxAge: config.sessionCookieMaxAge,
    },
  })

  async function joinUserToSessionHistoryRooms(io: Server, userId: Ulid) {
    const sessionHistory = await getSessionHistoryIdsByUserId(userId)
    for (const session of sessionHistory) {
      const sessionRoom = getSessionRoom(session.id)
      const socketIds = await getSocketIdsFromRoom(io, userId)
      // Have all of the user's socket connections join session history rooms
      for (const id of socketIds) {
        await remoteJoinRoom(io, id, sessionRoom)
      }
    }
  }

  io.use(wrap(sessionMiddleware))
  io.use(wrap(passport.initialize()))
  io.use(wrap(passport.session()))
  io.use((socket: SocketUser, next) => {
    if (socket.request.user || socket.handshake.query.key) {
      next()
    } else {
      next(new Error('unauthorized'))
    }
  })

  // TODO: handle transport close errors from worker socket disconnecting
  io.on('connection', async function(socket: SocketUser) {
    const {
      request: { user },
      handshake: {
        query: { key: socketApiKey },
      },
    } = socket

    if (user) {
      const isRecapSocketUpdatesActive = await getRecapSocketUpdatesFeatureFlag(
        user.id
      )
      await handleUser(socket, user)
      if (!isRecapSocketUpdatesActive)
        await joinUserToSessionHistoryRooms(io, user.id)
    } else {
      if (!socketApiKey) {
        socket.emit('redirect')
        throw new Error('User not authenticated')
      }
    }

    if (isEnabled(FEATURE_FLAGS.CHATBOT)) {
      chatbot = await lookupChatbotFromCache()
      if (!chatbot) logger.error(`Chatbot user not found`)
      else {
        // chatbot activity prompt handler
        socket.on('activity-prompt-sent', async function(data) {
          newrelic.startWebTransaction(
            '/socket-io/chatbot',
            () =>
              new Promise<void>(async (resolve, reject) => {
                try {
                  const { sessionId } = data
                  if (!sessionId)
                    throw new Error('SessionId not included in payload')
                  logger.debug('Acitivty prompt sent for session ', sessionId)
                  await cache.saveWithExpiration(
                    `${SESSION_ACTIVITY_KEY}-${sessionId}`,
                    'true',
                    60 * 45
                  )
                  resolve()
                } catch (err) {
                  reject(err)
                }
              })
          )
        })

        // chatbot end session handler
        socket.on('auto-end-session', async function(data) {
          newrelic.startWebTransaction(
            '/socket-io/chatbot',
            () =>
              new Promise<void>(async (resolve, reject) => {
                try {
                  const { sessionId } = data
                  if (!sessionId)
                    throw new Error('SessionId not included in payload')
                  logger.debug('Chatbot ending session ', sessionId)
                  await SessionService.endSession(
                    sessionId,
                    null,
                    true,
                    socketService
                  )
                  resolve()
                } catch (err) {
                  reject(err)
                }
              })
          )
        })
      }
    }

    // Tutor session management
    socket.on('join', async function(data) {
      newrelic.startWebTransaction(
        '/socket-io/join',
        () =>
          new Promise<void>(async (resolve, reject) => {
            if (!data || !data.sessionId) {
              socket.emit('redirect')
              resolve()
              return
            }

            const { sessionId, joinedFrom } = data
            const user = extractSocketUser(socket)
            let session: Session

            try {
              // TODO: have middleware handle the auth
              if (!user) throw new Error('User not authenticated')
              if (user.isVolunteer && !user.approved)
                throw new Error('Volunteer not approved')
              session = await SessionRepo.getSessionById(sessionId)
            } catch (error) {
              socket.emit('redirect')
              reject(error)
              return
            }

            try {
              // TODO: correctly type User from passport
              await SessionService.joinSession(user, session, {
                socket,
                joinedFrom,
              })

              const sessionRoom = getSessionRoom(sessionId)
              const socketIds = await getSocketIdsFromRoom(io, user.id)
              // Have all of the user's socket connections join the tutoring session room
              for (const id of socketIds) {
                await remoteJoinRoom(io, id, sessionRoom)
              }

              await socketService.emitSessionChange(sessionId)
              resolve()
            } catch (error) {
              socketService.bump(
                socket,
                {
                  endedAt: session.endedAt,
                  volunteer: session.volunteerId,
                  student: session.studentId,
                  sessionId: session.id,
                  userId: user.id,
                },
                error as Error
              )
              resolve()
            }
          })
      )
    })

    socket.on('sessions/recap:join', async function(data) {
      newrelic.startWebTransaction(
        '/socket-io/sessions/recap:join',
        () =>
          new Promise<void>(async (resolve, reject) => {
            if (!data || !data.sessionId) {
              socket.emit('redirect')
              resolve()
              return
            }

            const { sessionId } = data
            const user = extractSocketUser(socket)

            try {
              const session = await SessionRepo.getSessionById(sessionId)
              if (
                user.id !== session.studentId &&
                user.id !== session.volunteerId
              )
                throw new Error('Not a session participant')
            } catch (error) {
              socket.emit('redirect', error)
              resolve()
              return
            }

            try {
              const sessionRoom = getSessionRoom(sessionId)
              await remoteJoinRoom(io, socket.id, sessionRoom)
              socket.emit('sessions/recap:joined')
            } catch (error) {
              socket.emit('sessions/recap:join-failed', error)
            } finally {
              resolve()
            }
          })
      )
    })

    socket.on('list', () => {
      newrelic.startWebTransaction(
        '/socket-io/list',
        () =>
          new Promise<void>(async (resolve, reject) => {
            try {
              const sessions = await SessionRepo.getUnfulfilledSessions()
              socket.emit('sessions', sessions)
              resolve()
            } catch (error) {
              reject(error)
            }
          })
      )
    })

    socket.on('typing', data => {
      newrelic.startWebTransaction('/socket-io/typing', () => {
        socket
          .to(getSessionRoom(data.sessionId))
          .emit('is-typing', { sessionId: data.sessionId })
      })
    })

    socket.on('notTyping', data => {
      newrelic.startWebTransaction('/socket-io/notTyping', () => {
        socket
          .to(getSessionRoom(data.sessionId))
          .emit('not-typing', { sessionId: data.sessionId })
      })
    })

    socket.on('message', async data => {
      newrelic.startWebTransaction(
        '/socket-io/message',
        () =>
          new Promise<void>(async (resolve, reject) => {
            const { user, sessionId, message, source } = data

            newrelic.addCustomAttribute('sessionId', sessionId)

            // Do not allow banned users to send DMs
            const dbUser = await getUserContactInfoById(user.id)
            if (source === 'recap' && dbUser?.banned) return resolve()

            // TODO: handle this differently?
            if (!sessionId) {
              return resolve()
            }
            const createdAt = new Date()
            try {
              // TODO: correctly type user from payload
              const messageId = await SessionService.saveMessage(
                user,
                createdAt,
                {
                  sessionId,
                  message,
                },
                chatbot
              )
              if (chatbot && !(chatbot === user.id))
                await SessionService.handleMessageActivity(sessionId)

              const messageData = {
                contents: message,
                createdAt: createdAt,
                isVolunteer: user.isVolunteer,
                user: user.id,
                sessionId,
              }

              // If the message is coming from the recap page, queue the message to send a notification
              if (source === 'recap') {
                await QueueService.add(
                  Jobs.SendSessionRecapMessageNotification,
                  { messageId },
                  { removeOnComplete: true, removeOnFail: true }
                )
                captureEvent(user.id, EVENTS.USER_SUBMITTED_SESSION_RECAP_DM, {
                  sessionId: sessionId,
                  message,
                  isVolunteer: user.isVolunteer,
                })
              }

              const socketRoom = getSessionRoom(data.sessionId)
              io.in(socketRoom).emit('messageSend', messageData)
              resolve()
            } catch (error) {
              socket.emit('messageError', { sessionId: data.session })
              reject(error)
            }
          })
      )
    })

    socket.on('requestQuillState', async ({ sessionId }) => {
      newrelic.startWebTransaction(
        '/socket-io/requestQuillState',
        () =>
          new Promise<void>(async (resolve, reject) => {
            try {
              const quillState = await QuillDocService.lockAndGetDocCacheState(
                sessionId
              )
              let doc = quillState?.doc

              if (quillState?.lastDeltaStored)
                socket.emit('lastDeltaStored', {
                  delta: quillState.lastDeltaStored,
                })
              else if (!doc) doc = await QuillDocService.createDoc(sessionId)

              socket.emit('quillState', {
                delta: doc,
              })
              resolve()
            } catch (error) {
              if (error instanceof LockError) socket.emit('retryLoadingDoc')
              else reject(error)
            }
          })
      )
    })

    socket.on('transmitQuillDelta', async ({ sessionId, delta }) => {
      newrelic.startWebTransaction(
        '/socket-io/transmitQuillDelta',
        () =>
          new Promise<void>(async (resolve, reject) => {
            /**
             *
             * Add a unique ID to each delta. This allows for the client to determine
             * which deltas are which when it is queueing incoming deltas.
             *
             * The IDs are ignored when a delta is instantiated with `new Delta(delta)`
             * or when a quill doc is composed
             *
             */
            delta.id = uuidv4()
            await QuillDocService.appendToDoc(sessionId, delta)
            socket.to(getSessionRoom(sessionId)).emit('partnerQuillDelta', {
              delta,
            })
            return resolve()
          })
      )
    })

    socket.on('transmitQuillSelection', async ({ sessionId, range }) => {
      newrelic.startWebTransaction('/socket-io/transmitQuillSelection', () => {
        socket.to(getSessionRoom(sessionId)).emit('quillPartnerSelection', {
          range,
        })
      })
    })

    socket.on('error', function(error) {
      newrelic.startWebTransaction('/socket-io/error', () => {
        logger.error(`Socket error: ${error}`)
        Sentry.captureException(error)
      })
    })

    socket.on('resetWhiteboard', async ({ sessionId }) => {
      newrelic.startWebTransaction('/socket-io/resetWhiteboard', () => {
        socket.to(getSessionRoom(sessionId)).emit('resetWhiteboard')
      })
    })

    socket.on(
      'progress-report:processed',
      async ({ userId, sessionId, subject, report }) => {
        newrelic.startWebTransaction(
          '/socket-io/progress-report:processed',
          () => {
            socketService.emitProgressReportProcessedToUser(userId, {
              sessionId,
              subject,
              report,
            })
          }
        )
      }
    )

    socket.on('disconnect', reason => {
      logger.info(`Socket disconnected for reason: ${reason}`)
    })
  })
}
