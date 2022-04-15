/**
 * Processes incoming socket messages
 */
// TODO: types for passport
const passportSocketIo = require('passport.socketio')
import Sentry from '@sentry/node'
import { PGStore } from 'connect-pg-simple'
import cookieParser from 'cookie-parser'
import newrelic from 'newrelic'
import { Server, Socket } from 'socket.io'
import redisAdapter from 'socket.io-redis'
import config from '../../config'
import { Session } from '../../models/Session'
import { UserContactInfo } from '../../models/User'
import * as SessionRepo from '../../models/Session/queries'
import * as QuillDocService from '../../services/QuillDocService'
import * as SessionService from '../../services/SessionService'
import SocketService from '../../services/SocketService'
import getSessionRoom from '../../utils/get-session-room'
import logger from '../../logger'
import * as cache from '../../cache'
import { FEATURE_FLAGS, SESSION_ACTIVITY_KEY } from '../../constants'
import { lookupChatbotFromCache } from '../../utils/chatbot-lookup'
import { isEnabled } from 'unleash-client'
import { v4 as uuidv4 } from 'uuid'
import { LockError } from 'redlock'
import { Ulid } from '../../models/pgUtils'

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

  // @note: students don't join the room by default until they are in the session view
  // Join user to their latest session if it has not ended
  if (latestSession && !latestSession.endedAt) {
    socket.join(getSessionRoom(latestSession._id))
    socket.emit('session-change', latestSession)
  }

  if (user && user.isVolunteer) socket.join('volunteers')
}

// TODO: upgrade socketio and adapter so we can async this whole file
export function routeSockets(io: Server, sessionStore: PGStore): void {
  const socketService = new SocketService(io)

  async function getSocketIdsFromRoom(room: string): Promise<string[]> {
    return await new Promise((resolve, reject) => {
      io.in(room).clients((err: Error, clients: string[]) => {
        if (err) return reject(err)
        return resolve(clients)
      })
    })
  }

  async function remoteJoinRoom(socketId: string, room: string) {
    return await new Promise((resolve, reject) => {
      ;(io.of('/').adapter as redisAdapter.RedisAdapter).remoteJoin(
        socketId,
        room,
        (err: Error) => {
          if (err) reject(err)
          resolve('success')
        }
      )
    })
  }

  let chatbot: Ulid | undefined

  // Authentication for sockets
  io.use(
    passportSocketIo.authorize({
      cookieParser: cookieParser,
      key: 'connect.sid',
      secret: config.sessionSecret,
      store: sessionStore,
      // only allow authenticated users to connect to the socket instance
      fail: (data: any, message: string, error: Error, accept: any) => {
        logger.info(`Unauthenticated socket connection attempt: ${message}`)
        if (error) {
          logger.error(new Error(message))
          throw new Error(message)
        } else {
          accept(null, false)
        }
      },
    })
  )

  io.on('connection', async function(socket) {
    const {
      request: { user },
      handshake: {
        query: { key: socketApiKey },
      },
    } = socket

    if (user && user.logged_in) {
      await handleUser(socket, user)
    } else {
      if (!socketApiKey) {
        socket.emit('redirect')
        throw new Error('User not authenticated')
      } else {
        await handleChatBot(socket, socketApiKey)
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
                  SessionService.endSession(
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
            const {
              request: { user: socketUser },
            } = socket
            let session: Session

            const user = socketUser as UserContactInfo

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
              const socketIds = await getSocketIdsFromRoom(user.id)
              // Have all of the user's socket connections join the tutoring session room
              for (const id of socketIds) {
                await remoteJoinRoom(id, sessionRoom)
              }

              socketService.emitSessionChange(sessionId)
              resolve()
            } catch (error) {
              socketService.bump(
                socket,
                {
                  endedAt: session.endedAt,
                  volunteer: session.volunteerId,
                  student: session.studentId,
                },
                error as Error
              )
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
        socket.to(getSessionRoom(data.sessionId)).emit('is-typing')
      })
    })

    socket.on('notTyping', data => {
      newrelic.startWebTransaction('/socket-io/notTyping', () => {
        socket.to(getSessionRoom(data.sessionId)).emit('not-typing')
      })
    })

    socket.on('message', async data => {
      newrelic.startWebTransaction(
        '/socket-io/message',
        () =>
          new Promise<void>(async (resolve, reject) => {
            const { user, sessionId, message } = data

            newrelic.addCustomAttribute('sessionId', sessionId)

            // TODO: handle this differently?
            if (!sessionId) {
              return resolve()
            }
            const createdAt = new Date()

            try {
              // TODO: correctly type user from payload
              await SessionService.saveMessage(
                user,
                createdAt,
                {
                  sessionId,
                  message,
                },
                chatbot
              )
              if (chatbot && !(chatbot === user._id))
                await SessionService.handleMessageActivity(sessionId)

              const messageData = {
                contents: message,
                createdAt: createdAt,
                isVolunteer: user.isVolunteer,
                user: user._id,
              }

              const socketRoom = getSessionRoom(data.sessionId)
              io.in(socketRoom).emit('messageSend', messageData)
              resolve()
            } catch (error) {
              socket.emit('messageError')
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
  })
}
