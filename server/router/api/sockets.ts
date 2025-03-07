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
import { v4 as uuidv4 } from 'uuid'
import * as cache from '../../cache'
import config from '../../config'
import { EVENTS, SESSION_ACTIVITY_KEY } from '../../constants'
import logger from '../../logger'
import { Ulid } from '../../models/pgUtils'
import * as SessionRepo from '../../models/Session/queries'
import { UserContactInfo, UserRole } from '../../models/User'
import * as UserService from '../../services/UserService'
import { captureEvent } from '../../services/AnalyticsService'
import { isChatBotEnabled } from '../../services/FeatureFlagService'
import QueueService from '../../services/QueueService'
import * as QuillDocService from '../../services/QuillDocService'
import * as SessionService from '../../services/SessionService'
import SocketService from '../../services/SocketService'
import { lookupChatbotFromCache } from '../../utils/chatbot-lookup'
import getSessionRoom from '../../utils/get-session-room'
import {
  getSocketIdsFromRoom,
  remoteJoinRoom,
  emitSessionPresence,
} from '../../utils/socket-utils'
import { Jobs } from '../../worker/jobs'
import { extractSocketUser } from '../extract-user'
import { logSocketEvent } from '../../utils/log-socket-connection-info'
import { SocketUser } from '../../types/socket-types'
import {
  moderateIndividualTranscription,
  SanitizedTranscriptModerationResult,
} from '../../services/ModerationService'
import * as UserRolesService from '../../services/UserRolesService'

export type SessionMessageType = 'voice' | 'audio-transcription' // todo - add 'chat' later

// Custom API key handlers
async function handleChatBot(socket: Socket, key: string) {
  logger.debug(`Attempted key: ${key}`)
  if (key !== config.socketApiKey) throw new Error('User not authenticated')
  logger.debug('Chatbot connected to socket!')
}

async function handleUser(socket: SocketUser, user: UserContactInfo) {
  // Join a user to their own room to handle the event where a user might have
  // multiple socket connections open
  socket.join(user.id.toString())

  const latestSession = await SessionService.currentSession(user.id)

  // Show the user their latest session if it has not ended
  if (latestSession && !latestSession.endedAt) {
    socket.emit('session-change', latestSession)
  }

  if (user.roleContext.isActiveRole('volunteer')) socket.join('volunteers')
}

export function routeSockets(io: Server, sessionStore: PGStore): void {
  const socketService = SocketService.getInstance()

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
  io.on('connection', async function (socket: SocketUser) {
    const {
      request: { user },
      handshake: {
        query: { key: socketApiKey },
      },
    } = socket

    if (user) {
      await handleUser(socket, user)
      logSocketEvent('connection', socket) // Log the initial connection
    } else {
      if (!socketApiKey) {
        socket.emit('redirect')
        throw new Error('User not authenticated')
      }
    }

    if (isChatBotEnabled()) {
      chatbot = await lookupChatbotFromCache()
      if (!chatbot) logger.error(`Chatbot user not found`)
      else {
        // chatbot activity prompt handler
        socket.on('activity-prompt-sent', async function (data) {
          newrelic.startWebTransaction('/socket-io/chatbot', () =>
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
            }).catch((err) => {
              logger.error(
                {
                  error: err?.message,
                  sessionId: data?.sessionId,
                },
                'Promise rejected while handling "activity-prompt-sent" event'
              )
            })
          )
        })

        // chatbot end session handler
        socket.on('auto-end-session', async function (data) {
          newrelic.startWebTransaction('/socket-io/chatbot', () =>
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
            }).catch((err) => {
              logger.error(
                {
                  error: err?.message,
                  sessionId: data?.sessionId,
                },
                'Promise rejected while handling "auto-end-session" event'
              )
            })
          )
        })
      }
    }

    if (socket.recovered) {
      logSocketEvent('recovered', socket)
      if (user && socket.data.sessionId) {
        const sessionRoom = getSessionRoom(socket.data.sessionId)
        await emitSessionPresence(io, socket.id, user.id, sessionRoom)
      }
    }

    // Tutor session management
    socket.on('join', async function (data) {
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

            try {
              // TODO: have middleware handle the auth
              if (!user) throw new Error('User not authenticated')
              if (user.roleContext.isActiveRole('volunteer') && !user.approved)
                throw new Error('Volunteer not approved')
            } catch (error) {
              socket.emit('redirect')
              reject(error)
              return
            }

            try {
              // TODO: correctly type User from passport
              await SessionService.joinSession(user, sessionId, {
                socket,
                joinedFrom,
              })
            } catch (error) {
              logger.error(
                `User ${user.id} failed to join session ${sessionId}: ${error}`
              )
              const session = await SessionRepo.getSessionById(sessionId)
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
              return
            }

            try {
              const sessionRoom = getSessionRoom(sessionId)
              const userSocketIds = await getSocketIdsFromRoom(io, user.id)
              // Have all of the user's socket connections join the tutoring session room
              for (const id of userSocketIds) {
                remoteJoinRoom(io, id, sessionRoom)
              }

              await socketService.emitSessionChange(sessionId)
              // Attach the sessionId to the socket for analytics and debugging purposes
              // Currently only one sessionId is attached to a socket at a time
              socket.data.sessionId = data.sessionId
              await emitSessionPresence(io, socket.id, user.id, sessionRoom)
              resolve()
            } catch (error) {
              logger.error(
                `User ${user.id} failed to join sockets to session room for session ${sessionId}: ${error}`
              )
              resolve()
            }
          })
      )
    })

    socket.on('sessions/recap:join', async function (data) {
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
              socket.emit('redirect', error as Error)
              resolve()
              return
            }

            try {
              const sessionRoom = getSessionRoom(sessionId)
              await remoteJoinRoom(io, socket.id, sessionRoom)
              socket.emit('sessions/recap:joined')
              // Attach the sessionId to the socket for analytics and debugging purposes
              // Currently only one sessionId is attached to a socket at a time
              socket.data.sessionId = data.sessionId
            } catch (error) {
              socket.emit('sessions/recap:join-failed', error as Error)
            } finally {
              resolve()
            }
          })
      )
    })

    socket.on('sessions/recap:leave', async ({ sessionId }) => {
      newrelic.startWebTransaction('/socket-io/sessions/recap:leave', () => {
        socket.leave(getSessionRoom(sessionId))
        delete socket.data.sessionId
      })
    })

    socket.on('list', (_data, callback) => {
      newrelic.startWebTransaction('/socket-io/list', () =>
        new Promise<void>(async (resolve, reject) => {
          try {
            const sessions = await SessionRepo.getUnfulfilledSessions()
            socket.emit('sessions', sessions)
            callback({
              status: 200,
              sessions,
            })
            resolve()
          } catch (error) {
            reject(error)
          }
        }).catch((err) => {
          logger.error(
            {
              error: err?.message,
            },
            'Promise rejected while handling "list" event'
          )
        })
      )
    })

    socket.on('typing', (data) => {
      newrelic.startWebTransaction('/socket-io/typing', () => {
        socket
          .to(getSessionRoom(data.sessionId))
          .emit('is-typing', { sessionId: data.sessionId })
      })
    })

    socket.on('notTyping', (data) => {
      newrelic.startWebTransaction('/socket-io/notTyping', () => {
        socket
          .to(getSessionRoom(data.sessionId))
          .emit('not-typing', { sessionId: data.sessionId })
      })
    })

    socket.on('message', async (data) => {
      newrelic.startWebTransaction('/socket-io/message', () =>
        new Promise<void>(async (resolve, reject) => {
          try {
            const {
              user,
              sessionId,
              message,
              source,
              type,
              transcript,
              saidAt,
              zoomMessageId,
            } = data

            newrelic.addCustomAttribute('sessionId', sessionId)

            // Do not allow banned users to send DMs
            const dbUser = await UserService.getUserContactInfo(user.id)
            if (!dbUser) return resolve()
            if (source === 'recap' && !!dbUser.banType) return resolve()

            // TODO: handle this differently?
            if (!sessionId) {
              return resolve()
            }

            const createdAt = new Date()
            let sanitizedMessage: string | undefined = undefined
            let messageIsUnclean = false
            // TODO: correctly type user from payload
            const saveMessageData: {
              sessionId: Ulid
              message: string
              type?: SessionMessageType
              transcript?: string
              saidAt?: Date
            } = {
              sessionId,
              message,
              saidAt,
            }
            if (type) {
              saveMessageData.type = type
            }
            if (type === 'voice') {
              saveMessageData.transcript = transcript
            }
            if (type === 'audio-transcription') {
              const result = await moderateIndividualTranscription({
                transcript: message,
                sessionId,
                userId: user.id,
                saidAt: saidAt!,
              })
              if (!result.isClean) {
                messageIsUnclean = true
                const sanitized = (
                  result as SanitizedTranscriptModerationResult
                ).sanitizedTranscript
                saveMessageData.message = sanitized
                sanitizedMessage = sanitized
              }
            }

            const messageId = await SessionService.saveMessage(
              user,
              createdAt,
              saveMessageData,
              chatbot
            )

            if (chatbot && !(chatbot === user.id))
              await SessionService.handleMessageActivity(sessionId)

            const userType = dbUser.roleContext.activeRole
            const messageData: {
              contents: string
              createdAt: Date
              isVolunteer: boolean
              userType: UserRole
              user: Ulid
              sessionId: Ulid
              type?: SessionMessageType
              transcript?: string
              zoomMessageId?: string
            } = {
              contents: sanitizedMessage ?? message,
              createdAt: createdAt,
              isVolunteer: dbUser.roleContext.isActiveRole('volunteer'),
              userType: userType,
              user: user.id,
              sessionId,
              zoomMessageId,
            }

            if (type) {
              messageData.type = type
              if (type === 'voice') {
                messageData.transcript = transcript
              }
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
                isVolunteer: dbUser.roleContext.isActiveRole('volunteer'),
                userType: userType,
              })
            }

            const socketRoom = getSessionRoom(saveMessageData.sessionId)
            io.in(socketRoom).emit('messageSend', messageData)
            resolve()
          } catch (error) {
            socket.emit('messageError', { sessionId: data.sessionId })
            reject(error)
          }
        }).catch((err) => {
          logger.error(
            {
              error: err?.message,
              userId: data?.user?.id,
              sessionId: data?.sessionId,
            },
            'Promise rejected while handling "message" event'
          )
        })
      )
    })

    socket.on('requestQuillState', async ({ sessionId }) => {
      newrelic.startWebTransaction('/socket-io/requestQuillState', () =>
        new Promise<void>(async (resolve, reject) => {
          try {
            const quillState =
              await QuillDocService.lockAndGetDocCacheState(sessionId)
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
        }).catch((err) => {
          logger.error(
            {
              error: err?.message,
              sessionId,
            },
            'Promise rejected while handling "requestQuillState" event'
          )
        })
      )
    })

    socket.on('requestQuillStateV2', async ({ sessionId }) => {
      newrelic.startWebTransaction(
        '/socket-io/requestQuillStateV2',
        async () => {
          const updates = await QuillDocService.getDocumentUpdates(sessionId)
          socket.emit('quillStateV2', { updates })
        }
      )
    })

    socket.on(
      'transmitQuillDeltaV2',
      async ({ sessionId, update }: { sessionId: string; update: string }) => {
        newrelic.startWebTransaction(
          '/socket-io/transmitQuillDeltaV2',
          async () => {
            await QuillDocService.addDocumentUpdate(sessionId, update)
            socket
              .to(getSessionRoom(sessionId))
              .emit('partnerQuillDeltaV2', { update })
          }
        )
      }
    )

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

    socket.on('error', function (error) {
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

    socket.on('disconnecting', () => {
      const user = extractSocketUser(socket)
      for (const room of socket.rooms) {
        if (room.includes('sessions')) {
          socket
            .to(room)
            .except(user.id)
            .emit('sessions/partner:in-session', false)
        }
      }
    })

    socket.on('sessions:leave', async ({ sessionId }) => {
      newrelic.startWebTransaction('/socket-io/sessions:leave', () =>
        new Promise<void>(async (resolve, reject) => {
          try {
            const sessionRoom = getSessionRoom(sessionId)
            // Ensure the user's socket is part of the session room before leaving.
            // This prevents emitting session-presence from non-session participants
            const isSocketInRoom = socket.rooms.has(sessionRoom)
            if (isSocketInRoom) {
              socket.leave(sessionRoom)
              delete socket.data.sessionId
              const user = extractSocketUser(socket)
              await socket
                .to(sessionRoom)
                .except(user.id)
                .emit('sessions/partner:in-session', false)
            }
            resolve()
          } catch (error) {
            reject(error)
          }
        }).catch((err) => {
          logger.error(
            {
              error: err?.message,
              sessionId,
            },
            'Promise rejected while handling "sessions:leave" event'
          )
        })
      )
    })

    socket.conn.once('upgrade', () => {
      socket.data.downgraded = false
      logSocketEvent('transportUpgrade', socket)
    })

    socket.conn.on('packet', (packet) => {
      if (
        packet.type === 'ping' &&
        socket.conn.transport.name !== 'websocket' &&
        !socket.data.downgraded
      ) {
        socket.data.downgraded = true
        logSocketEvent('socketTransportDowngrade', socket)
        newrelic.recordCustomEvent('socketTransportDowngrade', {
          transport: socket.conn.transport.name,
          timestamp: Date.now(),
        })
      }
    })

    // Log socket connection-related events for analytics and debugging
    socket.onAny((eventName, args) => {
      logSocketEvent(eventName, socket, args)
    })
  })
}
