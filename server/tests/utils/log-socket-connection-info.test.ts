import { SocketUser } from '../../router/extract-user'
import { logSocketConnectionInfo } from '../../utils/log-socket-connection-info'
import logger from '../../logger'

jest.mock('../../logger')
describe('logSocketConnectionInfo', () => {
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
    } as SocketUser
    const data = {
      error: eventError,
      metadata: {
        test: true,
      },
    }

    logSocketConnectionInfo('client_connect_error', socket, data)
    expect(logger.error).toHaveBeenCalledWith(
      {
        eventName: 'client_connect_error',
        errorMessage: eventError,
        disconnectIsError: undefined,
        disconnectReason: undefined,
        error: eventError,
        user: {
          id: 'test-user-id-123',
        },
        rooms: ['room1', 'room2'],
        ...data.metadata,
      },
      'Socket connection event: client_connect_error'
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
    } as SocketUser

    logSocketConnectionInfo('disconnect', socket, reason)
    expect(logger.info).toHaveBeenCalledWith(
      {
        eventName: 'disconnect',
        disconnectReason: description,
        disconnectIsError: false,
        user: {
          id: 'test-user-id-123',
        },
        rooms: ['room1', 'room2'],
      },
      'Socket connection event: disconnect'
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
    } as SocketUser

    logSocketConnectionInfo('client_disconnect', socket, reason)
    expect(logger.error).toHaveBeenCalledWith(
      {
        eventName: 'client_disconnect',
        disconnectReason: description,
        disconnectIsError: true,
        user: {
          id: 'test-user-id-123',
        },
        rooms: ['room1', 'room2'],
      },
      'Socket connection event: client_disconnect'
    )
  })
})
