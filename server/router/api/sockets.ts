/**
 * Processes incoming socket messages
 */
// TODO: types for passport
const passportSocketIo = require('passport.socketio')
import Sentry from '@sentry/node'
import connectMongo from 'connect-mongo'
import cookieParser from 'cookie-parser'
import newrelic from 'newrelic'
import { Server } from 'socket.io'
import redisAdapter from 'socket.io-redis'
import config from '../../config'
import { Session } from '../../models/Session'
import * as SessionRepo from '../../models/Session/queries'
import * as QuillDocService from '../../services/QuillDocService'
import * as SessionService from '../../services/SessionService'
import SocketService from '../../services/SocketService'
import getSessionRoom from '../../utils/get-session-room'
import { getIdFromModelReference } from '../../utils/model-reference'

// TODO: upgrade socketio and adapter so we can async this whole file
export function routeSockets(
  io: Server,
  sessionStore: connectMongo.MongoStore
): void {
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

  // Authentication for sockets
  io.use(
    passportSocketIo.authorize({
      cookieParser: cookieParser,
      key: 'connect.sid',
      secret: config.sessionSecret,
      store: sessionStore,
      // only allow authenticated users to connect to the socket instance
      fail: (data: any, message: string, error: Error, accept: any) => {
        if (error) {
          console.log(new Error(message))
          throw new Error(message)
        } else {
          console.log(message)
          accept(null, false)
        }
      },
    })
  )

  io.on('connection', async function(socket) {
    const {
      request: { user },
    } = socket
    if (!user) {
      socket.emit('redirect')
      throw new Error('User not authenticated')
    }

    // Join a user to their own room to handle the event where a user might have
    // multiple socket connections open
    socket.join(user._id.toString())

    const latestSession = await SessionService.currentSession(user)

    // @note: students don't join the room by default until they are in the session view
    // Join user to their latest session if it has not ended
    if (latestSession && !latestSession.endedAt) {
      socket.join(getSessionRoom(latestSession._id))
      socket.emit('session-change', latestSession)
    }

    if (user && user.isVolunteer) socket.join('volunteers')

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
              request: { user },
            } = socket
            let session: Session

            try {
              // TODO: have middleware handle the auth
              if (!user) throw new Error('User not authenticated')
              if (user.isVolunteer && !user.isApproved)
                throw new Error('Volunteer not approved')
              session = await SessionRepo.getSessionById(sessionId)
            } catch (error) {
              socket.emit('redirect')
              reject(error)
              return
            }

            try {
              // TODO: correctly type User from passport
              await SessionService.joinSession(user, {
                socket,
                session,
                joinedFrom,
              })

              const sessionRoom = getSessionRoom(sessionId)
              const socketIds = await getSocketIdsFromRoom(user._id.toString())
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
                  volunteer: session.volunteer
                    ? getIdFromModelReference(session.volunteer)
                    : undefined,
                  student: getIdFromModelReference(session.student),
                },
                error as Error
              )
              reject(error)
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
              // TODO: correctly type user from passport
              await SessionService.saveMessage(user, createdAt, {
                sessionId,
                message,
              })

              const messageData = {
                contents: message,
                createdAt: createdAt,
                isVolunteer: user.isVolunteer,
                userId: user._id,
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
              let docState = await QuillDocService.getDoc(sessionId)
              if (!docState)
                docState = await QuillDocService.createDoc(sessionId)
              socket.emit('quillState', {
                delta: docState,
              })
              resolve()
            } catch (error) {
              reject(error)
            }
          })
      )
    })

    socket.on('transmitQuillDelta', async ({ sessionId, delta }) => {
      newrelic.startWebTransaction(
        '/socket-io/transmitQuillDelta',
        () =>
          new Promise<void>(async (resolve, reject) => {
            QuillDocService.appendToDoc(sessionId, delta)
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
        console.log('Socket error: ', error)
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
