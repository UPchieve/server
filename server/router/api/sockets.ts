/**
 * Processes incoming socket messages
 */
import * as os from 'os'
import Sentry from '@sentry/node'
import { PGStore } from 'connect-pg-simple'
import session from 'express-session'
import newrelic from 'newrelic'
import passport from 'passport'
import { LockError } from 'redlock'
import { Server, Socket } from 'socket.io'
import { v4 as uuidv4 } from 'uuid'
import config from '../../config'
import { EVENTS, SESSION_USER_ACTIONS } from '../../constants'
import logger from '../../logger'
import { Ulid } from '../../models/pgUtils'
import * as SessionRepo from '../../models/Session/queries'
import { UserContactInfo, UserRole } from '../../models/User'
import * as UserService from '../../services/UserService'
import { captureEvent } from '../../services/AnalyticsService'
import QueueService from '../../services/QueueService'
import * as QuillDocService from '../../services/QuillDocService'
import * as SessionService from '../../services/SessionService'
import SocketService from '../../services/SocketService'
import getSessionRoom from '../../utils/get-session-room'
import { Jobs } from '../../worker/jobs'
import { extractSocketUser } from '../extract-user'
import { logSocketEvent } from '../../utils/log-socket-connection-info'
import { SocketUser } from '../../types/socket-types'
import {
  moderateIndividualTranscription,
  SanitizedTranscriptModerationResult,
} from '../../services/ModerationService'
import { createSessionAction } from '../../models/UserAction/queries'
import { updateVolunteerSubjectPresence } from '../../services/VolunteerService'
import { asJoinSessionData } from '../../utils/session-utils'
import { SessionJoinError } from '../../models/Errors'
import * as PresenceService from '../../services/PresenceService'

export type SessionMessageType = 'audio-transcription' // todo - add 'chat' later

async function handleUser(socket: SocketUser, user: UserContactInfo) {
  // Join a user to their own room to handle the event where a user might have
  // multiple socket connections open
  await socket.join(user.id.toString())

  const latestSession = await SessionService.currentSession(user.id)

  // Show the user their latest session if it has not ended
  if (latestSession && !latestSession.endedAt) {
    socket.emit('session-change', latestSession)
  }

  if (user.roleContext.isActiveRole('volunteer')) {
    await socket.join('volunteers')
    await updateVolunteerSubjectPresence(user.id, 'add')
  }
}

export function routeSockets(io: Server, sessionStore: PGStore): void {
  const socketService = SocketService.getInstance()

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
    if (socket.request.user) {
      next()
    } else {
      next(new Error('unauthorized'))
    }
  })

  io.on('ping', (cb) => {
    cb(os.hostname())
  })

  io.on('connection', async function (socket: SocketUser) {
    const {
      request: { user },
      handshake: { query },
    } = socket

    if (user) {
      await handleUser(socket, user)
      logSocketEvent('connection', socket) // Log the initial connection
    }

    if (socket.recovered) {
      logSocketEvent('recovered', socket)
      if (user && socket.data.sessionId) {
        try {
          await socketService.joinSession(socket, user, socket.data.sessionId)
        } catch (error) {
          logger.error(
            `Unable to join socket session on socket recovery: ${error}`
          )
        }
      }
    }

    socket.on('sessions:join', async (data, callback) => {
      newrelic.startWebTransaction('/socket-io/sessions:join', () => {
        new Promise<void>(async (resolve) => {
          try {
            const user = await extractSocketUser(socket)
            await socketService.joinSession(socket, user, data.sessionId)
            callback({
              sessionId: data.sessionId,
              success: true,
            })
            resolve()
          } catch (error) {
            const isRetryable = !(error instanceof SessionJoinError)
            callback({
              sessionId: data.sessionId,
              retry: isRetryable,
              success: false,
            })
            logger.error(`Unable to join socket session: ${error}`)
            resolve()
          }
        })
      })
    })

    // TODO: Remove once no longer have legacy mobile app.
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
            const user = await extractSocketUser(socket)

            try {
              // TODO: have middleware handle the auth
              if (!user) throw new Error('User not authenticated')
              if (user.roleContext.isActiveRole('volunteer') && !user.approved)
                throw new Error('Volunteer not approved')
            } catch (error) {
              logger.error(
                error,
                'Failed to join session socket: Invalid user state'
              )
              socket.emit('redirect')
              return
            }

            try {
              const data = asJoinSessionData({
                socket,
                joinedFrom,
              })
              const ipAddress = socket.handshake?.address
              const userAgent = socket.request?.headers['user-agent']
              await SessionService.joinSession(user, sessionId, {
                ipAddress,
                userAgent,
                joinedFrom: data.joinedFrom,
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
              await socketService.joinSession(socket, user, sessionId)
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
            const user = await extractSocketUser(socket)

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
              await socket.join(sessionRoom)
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
        new Promise<void>(async (resolve, reject) => {
          try {
            const user = await extractSocketUser(socket)
            io.in(getSessionRoom(data.sessionId))
              .except(user.id)
              .emit('is-typing', { sessionId: data.sessionId })
            resolve()
          } catch {
            reject()
          }
        })
      })
    })

    socket.on('notTyping', (data) => {
      newrelic.startWebTransaction('/socket-io/notTyping', () => {
        new Promise<void>(async (resolve, reject) => {
          try {
            const user = await extractSocketUser(socket)
            io.in(getSessionRoom(data.sessionId))
              .except(user.id)
              .emit('not-typing', { sessionId: data.sessionId })
            resolve()
          } catch {
            reject()
          }
        })
      })
    })

    socket.on('celebrate', async (data) => {
      newrelic.startWebTransaction('/socket-io/celebrate', async () => {
        const { sessionId, userId, duration } = data
        await createSessionAction({
          userId,
          sessionId,
          action: SESSION_USER_ACTIONS.SENT_CELEBRATION,
        })

        io.in(getSessionRoom(sessionId)).emit('celebrate', { duration })
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
              saidAt,
              zoomMessageId,
              msgId,
            } = data

            newrelic.addCustomAttribute('sessionId', sessionId)

            // Do not allow banned users to send DMs
            const dbUser = await UserService.getUserContactInfo(user.id)
            if (!dbUser) return resolve()
            if (source === 'recap') {
              const { eligible, ineligibleReason } =
                await SessionService.isRecapDmsAvailable(sessionId, dbUser.id)
              if (!eligible) {
                logger.warn(
                  { ineligibleReason },
                  'Dropping recap message because session is not eligible for DMs'
                )
                return reject(
                  new Error(
                    `Session is ineligible for DMs. Reason: ${ineligibleReason}`
                  )
                )
              }
            }

            // TODO: handle this differently?
            if (!sessionId) {
              return resolve()
            }

            const createdAt = data.createdAt ?? new Date()
            let sanitizedMessage: string | undefined = undefined
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
            if (type === 'audio-transcription') {
              const result = await moderateIndividualTranscription({
                transcript: message,
                sessionId,
                userId: user.id,
                saidAt: saidAt!,
                source: 'audio_transcription',
              })
              if (!result.isClean) {
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
              saveMessageData
            )

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
              msgId?: string
            } = {
              contents: sanitizedMessage ?? message,
              createdAt: createdAt,
              isVolunteer: dbUser.roleContext.isActiveRole('volunteer'),
              userType: userType,
              user: user.id,
              sessionId,
              zoomMessageId,
              msgId,
            }

            if (type) {
              messageData.type = type
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
      newrelic.startWebTransaction('/socket-io/requestQuillStateV2', () => {
        new Promise<void>(async (resolve, reject) => {
          try {
            const updates = await QuillDocService.getDocumentUpdates(sessionId)
            socket.emit('quillStateV2', { updates })
            resolve()
          } catch {
            logger.error(
              {
                sessionId,
                userId: socket.request.user?.id,
              },
              'Failed to get Quill v2 doc.'
            )
            reject()
          }
        })
      })
    })

    socket.on(
      'transmitQuillDeltaV2',
      async ({ sessionId, update }: { sessionId: string; update: string }) => {
        newrelic.startWebTransaction('/socket-io/transmitQuillDeltaV2', () => {
          new Promise<void>(async (resolve, reject) => {
            try {
              await QuillDocService.addDocumentUpdate(sessionId, update)
              socket
                .to(getSessionRoom(sessionId))
                .emit('partnerQuillDeltaV2', { update })
              resolve()
            } catch {
              logger.error(
                {
                  sessionId,
                  userId: socket.request.user?.id,
                },
                'Failed to transmit Quill v2 doc update.'
              )
              reject()
            }
          })
        })
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

    socket.on('disconnecting', async () => {
      const user = await extractSocketUser(socket)

      if (socket.data.sessionId) {
        await socketService.leaveSession(socket, user, socket.data.sessionId)
      }

      if (user?.roleContext?.isActiveRole('volunteer')) {
        await updateVolunteerSubjectPresence(user.id, 'remove')
      }

      /*
       * If a user is disconnected, they can not take a session.
       * Mark them as inactive.
       */
      const clientUUID = socket.handshake.query.clientUUID
      if (clientUUID && typeof clientUUID === 'string') {
        PresenceService.trackInactivity({
          userId: user.id,
          clientUUID,
          ipAddress: socket.handshake.address,
        })
      }
    })

    socket.on('sessions:leave', async ({ sessionId }) => {
      newrelic.startWebTransaction('/socket-io/sessions:leave', () =>
        new Promise<void>(async (resolve, reject) => {
          try {
            const user = await extractSocketUser(socket)
            await socketService.leaveSession(socket, user, sessionId)
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
