/**
 * Processes incoming socket messages
 */
import { MongoStore } from 'connect-mongo'
const passportSocketIo = require('passport.socketio')
import cookieParser from 'cookie-parser'
import Sentry from '@sentry/node'
import config from '../../config'
import { Server, Socket } from 'socket.io'
import SocketService from '../../services/SocketService'
import * as SessionService from '../../services/SessionService'
import * as QuillDocService from '../../services/QuillDocService'
import getSessionRoom from '../../utils/get-session-room'
import stream from "stream";
import {IncomingHttpHeaders} from "http";
const newrelic = require('newrelic')

interface IncomingUpchieveMessage {
  constructor(socket: Socket);

  httpVersion: string;
  httpVersionMajor: number;
  httpVersionMinor: number;
  connection: Socket;
  headers: IncomingHttpHeaders;
  rawHeaders: string[];
  trailers: { [key: string]: string | undefined };
  rawTrailers: string[];
  setTimeout(msecs: number, callback: () => void): this;
  /**
   * Only valid for request obtained from http.Server.
   */
  method?: string;
  /**
   * Only valid for request obtained from http.Server.
   */
  url?: string;
  /**
   * Only valid for response obtained from http.ClientRequest.
   */
  statusCode?: number;
  /**
   * Only valid for response obtained from http.ClientRequest.
   */
  statusMessage?: string;
  socket: Socket;
  destroy(error?: Error): void;
  user: any;
}

export default function(io: Server, sessionStore: MongoStore) {
  const socketService = new SocketService(io)

  function getSocketIdsFromRoom(room: string) {
    try {
      return io.in(room).allSockets()
    } catch (err) {
      throw err
    }
  }

  // Authentication for sockets
  io.use(
    passportSocketIo.authorize({
      cookieParser: cookieParser,
      key: 'connect.sid',
      secret: config.sessionSecret,
      store: sessionStore,
      // only allow authenticated users to connect to the socket instance
      fail: (data, message, error, accept) => {
        if (error) {
          console.log(new Error(message))
          throw new Error(message)
        } else {
          console.log(message)
          accept(null, false)
        }
      }
    })
  )

  io.on('connection', async function(socket: Socket) {
    const req = socket.request as unknown as IncomingUpchieveMessage
    const user = req.user
    if (!user) {
      socket.emit('redirect')
      throw new Error('User not authenticated')
    }

    // Join a user to their own room to handle the event where a user might have
    // multiple socket connections open
    // object id from room names getting converted to string checked
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
          new Promise(async (resolve, reject) => {
            if (!data || !data.sessionId) {
              socket.emit('redirect')
              resolve()
              return
            }

            const { sessionId, joinedFrom } = data
            const req = socket.request as unknown as IncomingUpchieveMessage
            const user = req.user
            let session

            try {
              // @todo: have middleware handle the auth
              if (!user) throw new Error('User not authenticated')
              if (user.isVolunteer && !user.isApproved)
                throw new Error('Volunteer not approved')

              session = await SessionService.getSessionById(sessionId)
            } catch (error) {
              socket.emit('redirect')
              reject(error)
              return
            }

            try {
              await SessionService.joinSession({
                socket,
                session,
                user,
                joinedFrom
              })

              const sessionRoom = getSessionRoom(sessionId)
              const socketIds = await getSocketIdsFromRoom(user._id.toString())
              // Have all of the user's socket connections join the tutoring session room
              // why? what else could happen?
              for (const id of socketIds) {
                // I can't find a method that allows this anymore, they all just ask for a room
                // not also an id
                // await socket.whatMethod?
              }

              await socketService.emitSessionChange(sessionId)
              resolve()
            } catch (error) {
              socketService.bump(
                socket,
                {
                  endedAt: session.endedAt,
                  volunteer: session.volunteer || null,
                  student: session.student
                },
                error
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
          new Promise(async (resolve, reject) => {
            try {
              const sessions = await SessionService.getUnfulfilledSessions()
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
          new Promise(async (resolve, reject) => {
            const { user, sessionId, message } = data
            // @todo: handle this differently?
            if (!sessionId) {
              resolve()
              return
            }

            try {
              const newMessage = {
                contents: message,
                user: user._id,
                createdAt: new Date()
              }
              await SessionService.saveMessage({
                sessionId: data.sessionId,
                user: data.user,
                message: newMessage
              })

              const messageData = {
                contents: newMessage.contents,
                createdAt: newMessage.createdAt,
                isVolunteer: user.isVolunteer,
                userId: user._id
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
          new Promise(async (resolve, reject) => {
            try {
              let docState = await QuillDocService.getDoc(sessionId)
              if (!docState)
                docState = await QuillDocService.createDoc(sessionId)
              socket.emit('quillState', {
                delta: docState
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
          new Promise(async (resolve, reject) => {
            QuillDocService.appendToDoc(sessionId, delta)
            socket.to(getSessionRoom(sessionId)).emit('partnerQuillDelta', {
              delta
            })
            resolve()
          })
      )
    })

    socket.on('transmitQuillSelection', async ({ sessionId, range }) => {
      newrelic.startWebTransaction('/socket-io/transmitQuillSelection', () => {
        socket.to(getSessionRoom(sessionId)).emit('quillPartnerSelection', {
          range
        })
      })
    })

    // v2: Socket instance emitted the events related to the state of the underlying connection
    // v3: io property provides access to those events on the Manager instance
    io.on('error', function(error) {
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
