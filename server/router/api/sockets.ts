/**
 * Processes incoming socket messages
 */
import Sentry from '@sentry/node'
import newrelic from 'newrelic'
import passport from 'passport'
import { ResourceLockedError } from '@sesamecare-oss/redlock'
import { Server, Socket } from 'socket.io'
import { v4 as uuidv4 } from 'uuid'
import { EVENTS, SESSION_USER_ACTIONS, USER_BAN_REASONS } from '../../constants'
import logger from '../../logger'
import { Ulid } from '../../models/pgUtils'
import * as SessionRepo from '../../models/Session/queries'
import { banUserById, UserContactInfo, UserRole } from '../../models/User'
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
import { observeWebTransaction } from '../../utils/newRelicUtil'
import { extractSocketIp } from '../../utils/extract-socket-ip'
import sessionMiddleware from '../middleware/session'

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

export function routeSockets(io: Server): void {
  const socketService = SocketService.getInstance()

  // Authentication middleware for sockets.
  io.use(wrap(sessionMiddleware))
  io.use(wrap(passport.initialize()))
  io.use(wrap(passport.session()))
  io.use((socket: SocketUser, next) => {
    if (socket.request.user) {
      next()
    } else {
      next(new Error('Unauthorized'))
    }
  })
  function wrap(middleware: Function) {
    return (socket: Socket, next: Function) => {
      // The middlewares expect (req, res, next) parameters.
      middleware(socket.request, {}, next)
    }
  }

  io.on('connection', async function (socket: SocketUser) {
    const {
      request: { user },
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
            error,
            `Unable to join socket session on socket recovery`
          )
        }
      }
    }

    socket.on('sessions:join', async (data, callback) => {
      await observeWebTransaction('/socket-io/sessions:join', async () => {
        try {
          const user = await extractSocketUser(socket)
          await socketService.joinSession(socket, user, data.sessionId)
          const isZwibserveSession = await SessionService.isZwibserveSession(
            data.sessionId
          )
          callback({
            sessionId: data.sessionId,
            success: true,
            isZwibserveSession,
          })
        } catch (error) {
          const isRetryable = !(error instanceof SessionJoinError)
          logger.error(error, 'Unable to join socket')
          callback({
            sessionId: data.sessionId,
            retry: isRetryable,
            success: false,
          })
        }
      })
    })

    // TODO: Remove once no longer have legacy mobile app.
    socket.on('join', async (data) => {
      await observeWebTransaction('/socket-io/join', async () => {
        if (!data || !data.sessionId) {
          socket.emit('redirect')
          throw new Error('No data or sessionId')
        }

        const { sessionId, joinedFrom } = data
        const user = await extractSocketUser(socket)

        try {
          // TODO: have middleware handle the auth
          if (!user) throw new Error('User not authenticated')
          if (user.roleContext.isActiveRole('volunteer') && !user.approved)
            throw new Error('Volunteer not approved')
        } catch (error) {
          socket.emit('redirect')
          logger.error(
            error,
            'Failed to join session socket: Invalid user state'
          )
          return
        }

        try {
          const data = asJoinSessionData({
            socket,
            joinedFrom,
          })
          const ipAddress = extractSocketIp(socket)
          const userAgent = socket.request?.headers['user-agent']
          await SessionService.joinSession(user, sessionId, {
            ipAddress,
            userAgent,
            joinedFrom: data.joinedFrom,
          })
        } catch (error) {
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

          logger.error(
            error,
            { sessionId, userId: user.id },
            `User ${user.id} failed to join session ${sessionId}`
          )
          return
        }

        try {
          await socketService.joinSession(socket, user, sessionId)
        } catch (error) {
          logger.error(
            error,
            { userId: user.id, sessionId },
            `User ${user.id} failed to join sockets to session room for session ${sessionId}: ${error}`
          )
        }
      })
    })

    socket.on('sessions/recap:join', async (data) => {
      await observeWebTransaction(
        '/socket-io/sessions/recap:join',
        async () => {
          if (!data || !data.sessionId) {
            socket.emit('redirect')
            throw new Error('No data or sessionId')
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
            logger.error(error, { sessionId })
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
            logger.error(error, { sessionId }, 'Failed to join session recap')
          }
        }
      )
    })

    socket.on('sessions/recap:leave', async ({ sessionId }) => {
      await observeWebTransaction(
        '/socket-io/sessions/recap:leave',
        async () => {
          try {
            socket.leave(getSessionRoom(sessionId))
            delete socket.data.sessionId
          } catch (error) {
            logger.error(error, 'Failed leaving session recap')
          }
        }
      )
    })

    socket.on('list', async (_data, callback) => {
      await observeWebTransaction('/socket-io/list', async () => {
        try {
          const sessions = await SessionRepo.getUnfulfilledSessions()
          socket.emit('sessions', sessions)
          callback({
            status: 200,
            sessions,
          })
        } catch (error) {
          logger.error(error, 'Failed getting unfulfilled sessions')
        }
      })
    })

    socket.on('typing', async (data) => {
      await observeWebTransaction('/socket-io/typing', async () => {
        try {
          const user = await extractSocketUser(socket)
          io.in(getSessionRoom(data.sessionId))
            .except(user.id)
            .emit('is-typing', { sessionId: data.sessionId })
        } catch (error) {
          logger.error(error, { data }, 'Failed emitting user is typing')
        }
      })
    })

    socket.on('notTyping', async (data) => {
      await observeWebTransaction('/socket-io/notTyping', async () => {
        try {
          const user = await extractSocketUser(socket)
          io.in(getSessionRoom(data.sessionId))
            .except(user.id)
            .emit('not-typing', { sessionId: data.sessionId })
        } catch (error) {
          logger.error(error, { data }, 'Failed emitting user is not typing')
        }
      })
    })

    socket.on('celebrate', async (data) => {
      await observeWebTransaction('/socket-io/celebrate', async () => {
        try {
          const { sessionId, userId, duration } = data
          await createSessionAction({
            userId,
            sessionId,
            action: SESSION_USER_ACTIONS.SENT_CELEBRATION,
          })

          io.in(getSessionRoom(sessionId)).emit('celebrate', { duration })
        } catch (error) {
          logger.error(error, { data }, 'Failed emitting celebrate')
        }
      })
    })

    socket.on('message', async (data) => {
      await observeWebTransaction('/socket-io/message', async () => {
        try {
          const {
            sessionId,
            message,
            source,
            type,
            saidAt,
            zoomMessageId,
            msgId,
          } = data
          const user = await extractSocketUser(socket)

          // TODO: handle this differently?
          if (!sessionId) {
            throw new Error('No session ID')
          }

          newrelic.addCustomAttribute('sessionId', sessionId)

          if (source === 'recap') {
            const { eligible, ineligibleReason } =
              await SessionService.isRecapDmsAvailable(sessionId, user.id)
            if (!eligible)
              throw new Error(
                `Dropping recap message because session is not eligible for DMs Reason: ${ineligibleReason}`
              )
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
              const sanitized = (result as SanitizedTranscriptModerationResult)
                .sanitizedTranscript
              saveMessageData.message = sanitized
              sanitizedMessage = sanitized
            }
          }

          const messageId = await SessionService.saveMessage(
            user,
            createdAt,
            saveMessageData
          )

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
            isVolunteer: user.roleContext.isActiveRole('volunteer'),
            userType: user.roleContext.activeRole,
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
            await QueueService.add(Jobs.SendSessionRecapMessageNotification, {
              messageId,
            })
            captureEvent(user.id, EVENTS.USER_SUBMITTED_SESSION_RECAP_DM, {
              sessionId: sessionId,
              message,
              isVolunteer: user.roleContext.isActiveRole('volunteer'),
              userType: user.roleContext.activeRole,
            })
          }

          const socketRoom = getSessionRoom(saveMessageData.sessionId)
          io.in(socketRoom).emit('messageSend', messageData)
        } catch (error) {
          socket.emit('messageError', { sessionId: data.sessionId })
          logger.error(
            { err: error, sessionId: data.sessionId },
            "Failed sending a session's message"
          )
        }
      })
    })

    socket.on('requestQuillState', async ({ sessionId }) => {
      await observeWebTransaction('/socket-io/requestQuillState', async () => {
        try {
          const quillState =
            await QuillDocService.lockAndGetDocCacheState(sessionId)
          let doc = quillState?.doc

          if (quillState?.lastDeltaStored) {
            socket.emit('lastDeltaStored', {
              delta: quillState.lastDeltaStored,
            })
          } else if (!doc) doc = await QuillDocService.createDoc(sessionId)

          socket.emit('quillState', {
            delta: doc,
          })
        } catch (error) {
          if (error instanceof ResourceLockedError) {
            socket.emit('retryLoadingDoc')
          }
          logger.error(error, { sessionId }, 'Failed requesting the quill doc')
        }
      })
    })

    socket.on('requestQuillStateV2', async ({ sessionId }) => {
      await observeWebTransaction(
        '/socket-io/requestQuillStateV2',
        async () => {
          try {
            const updates = await QuillDocService.getDocumentUpdates(sessionId)
            socket.emit('quillStateV2', { updates })
          } catch (error) {
            logger.error(
              error,
              { sessionId, userId: socket.request.user?.id },
              'Failed requesting Quill v2 doc'
            )
          }
        }
      )
    })

    socket.on(
      'transmitQuillDeltaV2',
      async ({ sessionId, update }: { sessionId: string; update: string }) => {
        await observeWebTransaction(
          '/socket-io/transmitQuillDeltaV2',
          async () => {
            try {
              await QuillDocService.addDocumentUpdate(sessionId, update)
              io.to(getSessionRoom(sessionId)).emit('partnerQuillDeltaV2', {
                update,
              })
            } catch (error) {
              logger.error(
                error,
                {
                  sessionId,
                  userId: socket.request.user?.id,
                },
                'Failed to transmit Quill v2 doc update.'
              )
            }
          }
        )
      }
    )

    socket.on('transmitQuillDelta', async ({ sessionId, delta }) => {
      await observeWebTransaction('/socket-io/transmitQuillDelta', async () => {
        /**
         *
         * Add a unique ID to each delta. This allows for the client to determine
         * which deltas are which when it is queueing incoming deltas.
         *
         * The IDs are ignored when a delta is instantiated with `new Delta(delta)`
         * or when a quill doc is composed
         *
         */
        const userId = socket.request.user?.id
        try {
          if (!userId) {
            logger.error(
              { sessionId },
              'No user ID on socket in transmitQuillDelta'
            )
            throw new Error(
              `No user ID found during transmitQuillDelta of session ${sessionId}`
            )
          }
          delta.id = uuidv4()
          await QuillDocService.appendToDoc(sessionId, delta)
          io.to(getSessionRoom(sessionId))
            .except(userId)
            .emit('partnerQuillDelta', {
              delta,
            })
        } catch (error) {
          logger.error(
            error,
            { sessionId, userId },
            'Failed transmitting quill doc delta'
          )
        }
      })
    })

    socket.on('transmitQuillSelection', async ({ sessionId, range }) => {
      await observeWebTransaction(
        '/socket-io/transmitQuillSelection',
        async () => {
          try {
            io.to(getSessionRoom(sessionId)).emit('quillPartnerSelection', {
              range,
            })
          } catch (error) {
            logger.error(
              error,
              { sessionId, userId: socket.request.user?.id },
              'Failed transmitting quill doc selection'
            )
          }
        }
      )
    })

    socket.on('error', async (error) => {
      await observeWebTransaction('/socket-io/error', async () => {
        try {
          logger.error(`Socket error: ${error}`)
          Sentry.captureException(error)
        } catch (error) {
          logger.error(error, 'Error capturing error')
        }
      })
    })

    socket.on('disconnecting', async () => {
      await observeWebTransaction('/socket-io/disconnecting', async () => {
        try {
          const user = await extractSocketUser(socket)

          if (socket.data.sessionId) {
            await socketService.leaveSession(
              socket,
              user,
              socket.data.sessionId
            )
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
              ipAddress: extractSocketIp(socket),
            })
          }
        } catch (error) {
          logger.error(
            error,
            {
              sessionId: socket.data.sessionId,
              userId: socket.request.user?.id,
            },
            'Failed disconnecting from socket'
          )
        }
      })
    })

    socket.on(
      'sessions:leave',
      async ({ sessionId }) =>
        await observeWebTransaction('/socket-io/sessions:leave', async () => {
          try {
            const user = await extractSocketUser(socket)
            await socketService.leaveSession(socket, user, sessionId)
          } catch (error) {
            logger.error(
              error,
              { sessionId, userId: socket.request.user?.id },
              'Failed to leave session'
            )
          }
        })
    )

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

    socket.on('moderatingImage', async ({ sessionId }) => {
      await observeWebTransaction('/socket-io/moderatingImage', async () => {
        try {
          const user = await extractSocketUser(socket)
          io.to(getSessionRoom(sessionId))
            .except(user.id)
            .emit('partnerUploadingImage')
        } catch (error) {
          logger.error(
            error,
            { sessionId, userId: socket.request.user?.id },
            'Failed emitting partnerUploadingImage'
          )
        }
      })
    })

    socket.on(
      'imageUploadFailed',
      async ({ sessionId, moderationFailures, uploadError }) => {
        await observeWebTransaction(
          '/socket-io/partnerImageUploadFailed',
          async () => {
            try {
              const user = await extractSocketUser(socket)
              io.to(getSessionRoom(sessionId))
                .except(user.id)
                .emit('partnerImageUploadFailed', {
                  moderationFailures,
                  uploadError,
                })
            } catch (error) {
              logger.error(
                error,
                { sessionId, userId: socket.request.user?.id },
                'Failed emitting partnerImageUploadFailed'
              )
            }
          }
        )
      }
    )

    socket.on('imageUploadSuccess', async ({ sessionId }) => {
      await observeWebTransaction(
        '/socket-io/partnerImageUploadSuccess',
        async () => {
          try {
            const user = await extractSocketUser(socket)
            io.to(getSessionRoom(sessionId))
              .except(user.id)
              .emit('partnerImageUploadSuccess')
          } catch (error) {
            logger.error(
              error,
              { sessionId, userId: socket.request.user?.id },
              'Failed emitting partnerImageUploadSuccess'
            )
          }
        }
      )
    })

    socket.on('removePartnerLiveMediaBan', async ({ sessionId, banType }) => {
      await observeWebTransaction(
        '/socket-io/removePartnerLiveMediaBan',
        async () => {
          try {
            const session = await SessionRepo.getSessionById(sessionId)
            const user = await extractSocketUser(socket)
            const partnerUserId =
              user.id === session.volunteerId
                ? session.studentId
                : session.volunteerId

            //Bypass typescript and insert null for banType
            await banUserById(
              partnerUserId as string,
              banType,
              USER_BAN_REASONS.AUTOMATED_MODERATION
            )

            io.to(getSessionRoom(sessionId))
              .except(user.id)
              .emit('partnerAckLiveMediaBan', {
                isBanned: false,
              })
          } catch (err) {
            logger.error(
              { err, sessionId, userId: socket.request.user?.id },
              'Failed handling removePartnerLiveMediaBan event'
            )
          }
        }
      )
    })

    // Log socket connection-related events for analytics and debugging
    socket.onAny((eventName, args) => {
      logSocketEvent(eventName, socket, args)
    })
  })
}
