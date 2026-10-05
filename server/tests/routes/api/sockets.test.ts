import { Server } from 'socket.io'
import { routeSockets } from '../../../router/api/sockets'
import * as SessionService from '../../../services/SessionService'
import SocketService from '../../../services/SocketService'
import { SessionJoinError } from '../../../models/Errors'
import { SocketUser } from '../../../types/socket-types'

jest.mock('../../../router/middleware/session', () => jest.fn())
jest.mock('../../../services/SessionService')
jest.mock('../../../services/SocketService')
jest.mock('../../../router/extract-user', () => ({
  extractSocketUser: jest.fn().mockResolvedValue({ id: 'user-id' }),
}))
jest.mock('../../../utils/newRelicUtil', () => ({
  observeWebTransaction: (_url: string, fn: () => Promise<void>) => fn(),
}))

function connectSocket() {
  const io = { use: jest.fn(), on: jest.fn() }
  routeSockets(io as unknown as Server)
  const onConnection = io.on.mock.calls.find(
    ([event]) => event === 'connection'
  )![1]
  const socket = {
    request: { user: { id: 'user-id' } },
    recovered: false,
    data: {},
    conn: { on: jest.fn(), once: jest.fn() },
    join: jest.fn(),
    emit: jest.fn(),
    on: jest.fn(),
    onAny: jest.fn(),
    onAnyOutgoing: jest.fn(),
  }
  onConnection(socket as unknown as SocketUser)
  return socket
}

describe('routeSockets', () => {
  // Socket.IO sends CONNECT before the 'connection' handler runs, so a client
  // event can arrive while the connection setup is still awaiting.
  test('registers event handlers before the connection setup finishes, then runs it', () => {
    jest
      .mocked(SessionService.currentSession)
      .mockReturnValue(new Promise(() => {}))
    const socket = connectSocket()

    expect(socket.on.mock.calls.map(([event]) => event)).toEqual(
      expect.arrayContaining(['sessions:join', 'sessions/recap:join'])
    )
    expect(socket.join).toHaveBeenCalledWith('user-id')
  })

  test('sessions:join failure ack carries the refusal code', async () => {
    jest.mocked(SocketService.getInstance).mockReturnValue({
      joinSession: jest.fn().mockRejectedValue(
        new SessionJoinError({
          message: 'session ended',
          code: 'SESSION_ENDED',
        })
      ),
    } as unknown as SocketService)
    const socket = connectSocket()
    const onJoin = socket.on.mock.calls.find(
      ([event]) => event === 'sessions:join'
    )![1]
    const callback = jest.fn()

    await onJoin({ sessionId: 'session-id' }, callback)

    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, code: 'SESSION_ENDED' })
    )
  })
})
