import { SocketUser } from '../../types/socket-types'
import { logSocketEvent } from '../../utils/log-socket-connection-info'
import logger from '../../logger'
import { getDbUlid } from '../../models/pgUtils'

const conn = {
  transport: {
    name: 'websocket',
  },
}

const socketId = '123'

jest.mock('../../logger')
describe('logSocketEvent', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('Logs the error message when an error event is received', () => {
    const eventError = new Error('test error message')
    const sessionId = getDbUlid()
    const socket = {
      rooms: new Set<string>(['room1', 'room2']),
      request: {
        user: {
          id: 'test-user-id-123',
        },
      },
      data: {
        sessionId,
      },
      id: socketId,
      conn,
    } as SocketUser
    const data = {
      error: eventError,
      metadata: {
        test: true,
      },
    }

    logSocketEvent('client_connect_error', socket, data)
    expect(logger.error).toHaveBeenCalledWith(
      {
        eventName: 'client_connect_error',
        errorMessage: eventError,
        disconnectIsError: undefined,
        disconnectReason: undefined,
        error: eventError,
        user: {
          id: 'test-user-id-123',
          roles: undefined,
        },
        rooms: ['room1', 'room2'],
        transport: conn.transport.name,
        sessionId: socket.data.sessionId,
        socketId,
        ...data.metadata,
      },
      `Socket ${socketId} event: client_connect_error for session ${sessionId}`
    )
  })

  it('Logs the disconnectReason when an error is received (server disconnect)', () => {
    const reason = 'server namespace disconnect'
    const description =
      'The socket was forcefully disconnected with socket.disconnect()'
    const socket = {
      rooms: new Set<string>(['room1', 'room2']),
      request: {
        user: {
          id: 'test-user-id-123',
        },
      },
      data: {},
      id: socketId,
      conn,
    } as SocketUser

    logSocketEvent('disconnect', socket, reason)
    expect(logger.info).toHaveBeenCalledWith(
      {
        eventName: 'disconnect',
        disconnectReason: description,
        disconnectIsError: false,
        error: undefined,
        errorMessage: undefined,
        user: {
          id: 'test-user-id-123',
          roles: undefined,
        },
        rooms: ['room1', 'room2'],
        transport: conn.transport.name,
        sessionId: undefined,
        socketId,
      },
      `Socket ${socketId} event: disconnect`
    )
  })

  it('Logs the disconnectReason when an error is received (client disconnect)', () => {
    const reason = 'transport error'
    const description =
      'The connection has encountered an error (example: the server was killed during a HTTP long-polling cycle)'
    const socket = {
      rooms: new Set<string>(['room1', 'room2']),
      request: {
        user: {
          id: 'test-user-id-123',
        },
      },
      data: {},
      id: socketId,
      conn,
    } as SocketUser

    logSocketEvent('client_disconnect', socket, reason)
    expect(logger.error).toHaveBeenCalledWith(
      {
        eventName: 'client_disconnect',
        disconnectReason: description,
        disconnectIsError: true,
        error: undefined,
        errorMessage: undefined,
        user: {
          id: 'test-user-id-123',
          roles: undefined,
        },
        rooms: ['room1', 'room2'],
        transport: conn.transport.name,
        socketId,
        sessionId: undefined,
      },
      `Socket ${socketId} event: client_disconnect`
    )
  })
})
