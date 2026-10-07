/**
 * Processes incoming socket messages
 */
import newrelic from 'newrelic'
import passport from 'passport'
import { ResourceLockedError } from '@sesamecare-oss/redlock'
import { Server, Socket } from 'socket.io'
import { v4 as uuidv4 } from 'uuid'
import {
  EVENTS,
  SESSION_USER_ACTIONS,
  SUBJECTS,
  USER_BAN_REASONS,
} from '../../constants'
import logger from '../../logger'
import { CaughtError } from '../../models/Errors'
import { Ulid } from '../../models/pgUtils'
import * as SessionRepo from '../../models/Session/queries'
import * as SessionHoldsService from '../../services/SessionHoldsService'
import { banUserById, UserContactInfo, UserRole } from '../../models/User'
import { captureEvent } from '../../services/AnalyticsService'
import QueueService from '../../services/QueueService'
import * as QuillDocService from '../../services/QuillDocService'
import * as SessionService from '../../services/SessionService'
import SocketService, {
  APPROVED_VOLUNTEERS_ROOM,
} from '../../services/SocketService'
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
import * as PresenceService from '../../services/PresenceService'
import { observeWebTransaction } from '../../utils/newRelicUtil'
import { extractSocketIp } from '../../utils/extract-socket-ip'
import sessionMiddleware from '../middleware/session'
import { toCurrentSessionPublic } from '../../contracts/sessions.mappers'
import { logThrottledEditorActivity } from '../../services/SessionEditorActivityService'
import { isPlatformBanType } from '../../utils/ban-utils'

export type SessionMessageType = 'audio-transcription' // todo - add 'chat' later

/**
 * Adds or removes a socket from the `volunteers` room based on the
 * user's current approval status, returning whether the user is allowed to be
 * in that room (i.e. is a volunteer, is approved, and is not banned from the
 * platform).
 *
 * Once authenticated, clients connect to the socket, but we don't want a volunteer
 * to receive the session list (which they get from being in the `volunteers` room)
 * until they have been approved. Once approved, we can simply emit('list') on
 * the client, and the volunteer will be added to the room, without needing
 * to disconnect and reconnect their socket.
 */
async function syncApprovedVolunteersRoom(
  socket: SocketUser,
  user: UserContactInfo
): Promise<boolean> {
  const isApprovedVolunteer =
    user.roleContext.isActiveRole('volunteer') &&
    !!user.approved &&
    !isPlatformBanType(user.banType)

  if (isApprovedVolunteer) {
    await socket.join(APPROVED_VOLUNTEERS_ROOM)
  } else {
    await socket.leave(APPROVED_VOLUNTEERS_ROOM)
  }

  return isApprovedVolunteer
}

async function handleUser(socket: SocketUser, user: UserContactInfo) {
  // Join a user to their own room to handle the event where a user might have
  // multiple socket connections open
  await socket.join(user.id.toString())

  const latestSession = await SessionService.currentSession(user.id)

  // Show the user their latest session if it has not ended
  if (latestSession && !latestSession.endedAt) {
    socket.emit('session-change', toCurrentSessionPublic(latestSession))
  }

  if (await syncApprovedVolunteersRoom(socket, user)) {
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
          logger.error('Unable to join socket', { err: error })
          callback({
            sessionId: data.sessionId,
            reason: error instanceof Error ? error.message : 'unknown error',
            code: error instanceof CaughtError ? error.code : undefined,
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
        } catch (err) {
          socket.emit('redirect')
          logger.error('Failed to join session socket: Invalid user state', {
            err,
            sessionId,
            userId: user.id,
          })
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
        } catch (err) {
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
            err as Error
          )

          logger.error(`User failed to join session`, {
            err,
            sessionId,
            userId: user.id,
          })
          return
        }

        try {
          await socketService.joinSession(socket, user, sessionId)
        } catch (err) {
          logger.error('User failed to join sockets to session room', {
            err,
            sessionId,
            userId: user.id,
          })
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
          } catch (err) {
            socket.emit('redirect', err as Error)
            logger.error('Failed to join session', {
              err,
              sessionId,
              userId: user.id,
            })
            return
          }

          try {
            const sessionRoom = getSessionRoom(sessionId)
            await socket.join(sessionRoom)
            socket.emit('sessions/recap:joined')
            // Attach the sessionId to the socket for analytics and debugging purposes
            // Currently only one sessionId is attached to a socket at a time
            socket.data.sessionId = data.sessionId
          } catch (err) {
            socket.emit('sessions/recap:join-failed', err as Error)
            logger.error('Failed to join session recap', {
              err,
              sessionId,
              userId: user.id,
            })
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
          } catch (err) {
            logger.error('Failed leaving session recap', { err })
          }
        }
      )
    })

    socket.on('list', async (_data, callback) => {
      await observeWebTransaction('/socket-io/list', async () => {
        try {
          const user = await extractSocketUser(socket, true)

          if (!(await syncApprovedVolunteersRoom(socket, user))) {
            logger.warn('Unauthorized to view session list', {
              userId: user.id,
              role: user.roleContext.activeRole,
              approved: user.approved,
            })
            callback({ status: 403 })
            return
          }

          const allSessions = await SessionRepo.getUnfulfilledSessions()
          const sessions =
            await socketService.addExclusiveSessionMetadata(allSessions)
          const coachHoldEligibilities =
            await SessionHoldsService.getEligibleOnlineCoaches()
          const withHolds = []
          for (const session of sessions) {
            const s = await SessionHoldsService.attachHoldData(
              {
                id: session.id,
                subject: session.subTopic as SUBJECTS,
                createdAt: session.createdAt,
                studentId: session.student.id,
              },
              coachHoldEligibilities
            )
            withHolds.push({
              ...session,
              ...s,
            })
          }
          socket.emit('sessions', withHolds)
          callback({
            status: 200,
            sessions: withHolds,
          })
        } catch (err) {
          logger.error('Failed getting unfulfilled sessions', { err })
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
        } catch (err) {
          logger.error('Failed emitting user is typing', { err, data })
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
        } catch (err) {
          logger.error('Failed emitting user is not typing', {
            err,
            data,
          })
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
        } catch (err) {
          logger.error('Failed emitting celebrate', { err, data })
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
            await QueueService.add(
              Jobs.SendSessionRecapMessageNotification,
              { delay: 0 },
              {
                messageId,
              }
            )
            captureEvent(user.id, EVENTS.USER_SUBMITTED_SESSION_RECAP_DM, {
              sessionId: sessionId,
              message,
              isVolunteer: user.roleContext.isActiveRole('volunteer'),
              userType: user.roleContext.activeRole,
            })
          }

          const socketRoom = getSessionRoom(saveMessageData.sessionId)
          io.in(socketRoom).emit('messageSend', messageData)

          // If it's a recap DM, also emit to the partner's user room so they get notified
          // even if they're not on the recap page
          if (source === 'recap') {
            const session = await SessionRepo.getSessionById(sessionId)
            const partnerId =
              user.id === session.studentId
                ? session.volunteerId
                : session.studentId
            if (partnerId) {
              io.to(partnerId).emit('dm:received', { sessionId })
            }
          }
        } catch (err) {
          socket.emit('messageError', { sessionId: data.sessionId })
          logger.error("Failed sending a session's message", {
            err,
            sessionId: data.sessionId,
          })
        }
      })
    })

    socket.on('requestQuillState', async ({ sessionId }) => {
      await observeWebTransaction('/socket-io/requestQuillState', async () => {
        try {
          if (await SessionService.didSessionEnd(sessionId)) {
            logger.warn(
              'Quill doc sent a requestQuillState event after the session ended already',
              { sessionId }
            )
            return
          }

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
        } catch (err) {
          if (err instanceof ResourceLockedError) {
            socket.emit('retryLoadingDoc')
          }
          logger.error('Failed requesting the quill doc', {
            err,
            sessionId,
          })
        }
      })
    })

    socket.on('requestQuillStateV2', async ({ sessionId }) => {
      await observeWebTransaction(
        '/socket-io/requestQuillStateV2',
        async () => {
          try {
            if (await SessionService.didSessionEnd(sessionId)) {
              logger.warn(
                'Quill doc sent a requestQuillStateV2 event after the session ended already',
                { sessionId }
              )
              return
            }
            const updates = await QuillDocService.getDocumentUpdates(sessionId)
            socket.emit('quillStateV2', { updates })
          } catch (err) {
            logger.error('Failed requesting Quill v2 doc', {
              err,
              sessionId,
              userId: socket.request.user?.id,
            })
          }
        }
      )
    })

    socket.on(
      'transmitQuillDeltaV2',
      async ({ sessionId, update }: { sessionId: string; update: string }) => {
        const userId = socket.request.user?.id
        await observeWebTransaction(
          '/socket-io/transmitQuillDeltaV2',
          async () => {
            try {
              if (await SessionService.didSessionEnd(sessionId)) {
                logger.warn(
                  'Quill doc sent a transmitQuillDeltaV2 event after the session ended already',
                  { sessionId }
                )
                return
              }

              await QuillDocService.addDocumentUpdate(sessionId, update)
              if (userId) {
                await logThrottledEditorActivity(sessionId, userId, 'quill')
              }
              io.to(getSessionRoom(sessionId)).emit('partnerQuillDeltaV2', {
                update,
              })
            } catch (err) {
              logger.error('Failed to transmit Quill v2 doc update.', {
                err,
                sessionId,
                userId: socket.request.user?.id,
              })
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
          if (await SessionService.didSessionEnd(sessionId)) {
            logger.warn(
              'Quill doc sent a transmitQuillDelta event after the session ended already',
              { sessionId }
            )
            return
          }
          if (!userId) {
            const err = new Error(
              `No user ID found during transmitQuillDelta of session ${sessionId}`
            )
            logger.error('No user ID on socket in transmitQuillDelta', {
              err,
              sessionId,
            })
            throw err
          }
          delta.id = uuidv4()
          await QuillDocService.appendToDoc(sessionId, delta)
          await logThrottledEditorActivity(sessionId, userId, 'quill')
          io.to(getSessionRoom(sessionId))
            .except(userId)
            .emit('partnerQuillDelta', {
              delta,
            })
        } catch (err) {
          logger.error('Failed transmitting quill doc delta', {
            err,
            sessionId,
            userId,
          })
        }
      })
    })

    socket.on(
      'transmitWhiteboardActivity',
      async ({ sessionId }: { sessionId: string }) => {
        await observeWebTransaction(
          '/socket-io/transmitWhiteboardActivity',
          async () => {
            try {
              const user = await extractSocketUser(socket)
              await logThrottledEditorActivity(sessionId, user.id, 'whiteboard')
            } catch (err) {
              logger.error('Failed logging whiteboard activity', {
                err,
                sessionId,
                userId: socket.request.user?.id,
              })
            }
          }
        )
      }
    )

    socket.on('transmitQuillSelection', async ({ sessionId, range }) => {
      await observeWebTransaction(
        '/socket-io/transmitQuillSelection',
        async () => {
          try {
            const user = await extractSocketUser(socket)
            io.in(getSessionRoom(sessionId))
              .except(user.id)
              .emit('quillPartnerSelection', {
                range,
              })
          } catch (err) {
            logger.error('Failed transmitting quill doc selection', {
              err,
              sessionId,
              userId: socket.request.user?.id,
            })
          }
        }
      )
    })

    socket.on('error', async (err) => {
      await observeWebTransaction('/socket-io/error', async () => {
        try {
          logger.error('Socket error', { err })
        } catch (err) {
          logger.error('Error capturing error', { err })
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
            }).catch((err) => {
              logger.error('Failed to track inactivity', { err })
            })
          }
        } catch (err) {
          logger.error('Failed disconnecting from socket', {
            err,
            sessionId: socket.data.sessionId,
            userId: socket.request.user?.id,
          })
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
          } catch (err) {
            logger.error('Failed to leave session', {
              err,
              sessionId,
              userId: socket.request.user?.id,
            })
          }
        })
    )

    socket.on('sessions/share-info:opt-in', async (message) => {
      await observeWebTransaction(
        '/socket-io/sessions/share-info:opt-in',
        async () => {
          try {
            const user = await extractSocketUser(socket)
            const { sessionId } = socket.data
            if (!sessionId) return
            await socketService.emitShareInfoOptIn(
              user.id,
              sessionId,
              message ?? ''
            )
          } catch (err) {
            logger.error('Failed to relay share-info opt-in', {
              err,
              userId: socket.request.user?.id,
            })
          }
        }
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

    socket.on('moderatingImage', async ({ sessionId }) => {
      await observeWebTransaction('/socket-io/moderatingImage', async () => {
        try {
          const user = await extractSocketUser(socket)
          io.to(getSessionRoom(sessionId))
            .except(user.id)
            .emit('partnerUploadingImage')
        } catch (err) {
          logger.error('Failed emitting partnerUploadingImage', {
            err,
            sessionId,
            userId: socket.request.user?.id,
          })
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
            } catch (err) {
              logger.error('Failed emitting partnerImageUploadFailed', {
                err,
                sessionId,
                userId: socket.request.user?.id,
              })
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
          } catch (err) {
            logger.error('Failed emitting partnerImageUploadSuccess', {
              err,
              sessionId,
              userId: socket.request.user?.id,
            })
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
            logger.error('Failed handling removePartnerLiveMediaBan event', {
              err,
              sessionId,
              userId: socket.request.user?.id,
            })
          }
        }
      )
    })

    socket.on('joinedLiveMedia', async ({ sessionId }) => {
      const user = await extractSocketUser(socket)

      try {
        io.to(getSessionRoom(sessionId))
          .except(user.id)
          .emit('partnerJoinedLiveMedia')
      } catch (err) {
        logger.error('Failed to let partner know screen share initiated', {
          err,
          sessionId,
        })
      }
    })

    socket.on('dismissSessionHold', async ({ sessionId }) => {
      const user = await extractSocketUser(socket)
      try {
        await SessionService.dismissSessionHold(user.id, sessionId)
      } catch (err) {
        logger.error(
          `Failed to dismiss session hold for user ${user.id} and session ${sessionId}`,
          { coachId: user.id, sessionId, err }
        )
      }
    })

    // Log socket connection-related events for analytics and debugging
    socket.onAny((eventName, args) => {
      logSocketEvent(eventName, socket, args)
    })

    // Log socket outgoing events
    socket.onAnyOutgoing((eventName, args) => {
      logSocketEvent(eventName, socket, args)
    })

    // Socket.IO drops a client event that arrives while no listener is
    // registered, and the client may emit as soon as it sees 'connect', so this
    // setup runs only after every handler above exists.
    if (user) {
      await handleUser(socket, user)
      logSocketEvent('connection', socket) // Log the initial connection
    }

    if (socket.recovered) logSocketEvent('recovered', socket)
  })
}
