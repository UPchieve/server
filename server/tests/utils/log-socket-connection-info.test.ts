import { SocketUser } from '../../types/socket-types'
import { logSocketEvent } from '../../utils/log-socket-connection-info'
import logger from '../../logger'
import { getDbUlid } from '../../models/pgUtils'

const conn = {
  transport: {
    name: 'websocket',
  },
}

jest.mock('../../logger')
describe('logSocketEvent', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('Logs the error message when an error event is received', () => {
    const eventError = new Error('test error message')
    const socket = {
      rooms: new Set<string>(['room1', 'room2']),
      request: {
        user: {
          id: 'test-user-id-123',
        },
      },
      data: {
        sessionId: getDbUlid(),
      },
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
        ...data.metadata,
      },
      'Socket event: client_connect_error'
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
      },
      'Socket event: disconnect'
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
        sessionId: undefined,
      },
      'Socket event: client_disconnect'
    )
  })
})
