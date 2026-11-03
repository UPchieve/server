import { Server } from 'socket.io'
import { routeSockets } from '../../../router/api/sockets'
import * as SessionService from '../../../services/SessionService'
import * as DirectMessageService from '../../../services/DirectMessageService'
import { ConversationNotFoundError } from '../../../services/Errors'
import { getUuid } from '../../../models/pgUtils'
import SocketService from '../../../services/SocketService'
import { SessionJoinError } from '../../../models/Errors'
import { SocketUser } from '../../../types/socket-types'
import { buildUserContactInfo } from '../../mocks/generate'
import { extractSocketUser } from '../../../router/extract-user'
import { mocked } from 'jest-mock'

jest.mock('../../../router/middleware/session', () => jest.fn())
jest.mock('../../../services/SessionService')
jest.mock('../../../services/DirectMessageService')
jest.mock('../../../services/SocketService')
jest.mock('../../../router/extract-user')
jest.mock('../../../utils/newRelicUtil', () => ({
  observeWebTransaction: (_url: string, fn: () => Promise<void>) => fn(),
}))

const mockedSessionService = mocked(SessionService)
const mockedSocketService = mocked(SocketService)
const mockedExtractSocketUser = mocked(extractSocketUser)
const mockedDirectMessageService = mocked(DirectMessageService)

let mockUser = buildUserContactInfo()

// Records the rooms an `io.to(...)...emit(...)` chain was sent to
function mockIo() {
  const broadcast = { rooms: [] as string[], emit: jest.fn() }
  const chain = {
    to: jest.fn((room: string) => {
      broadcast.rooms.push(room)
      return chain
    }),
    emit: broadcast.emit,
  }
  return { io: { use: jest.fn(), on: jest.fn(), to: chain.to }, broadcast }
}

function connectSocket(io = mockIo().io) {
  routeSockets(io as unknown as Server)
  const onConnection = io.on.mock.calls.find(
    ([event]) => event === 'connection'
  )![1]
  const socket = {
    request: { user: mockUser },
    recovered: false,
    data: {},
    conn: { on: jest.fn(), once: jest.fn() },
    join: jest.fn(),
    leave: jest.fn(),
    emit: jest.fn(),
    on: jest.fn(),
    onAny: jest.fn(),
    onAnyOutgoing: jest.fn(),
  }
  onConnection(socket as unknown as SocketUser)
  return socket
}

describe('routeSockets', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    mockUser = buildUserContactInfo()
    mockedExtractSocketUser.mockResolvedValue(mockUser)
  })

  // Socket.IO sends CONNECT before the 'connection' handler runs, so a client
  // event can arrive while the connection setup is still awaiting.
  test('registers event handlers before the connection setup finishes, then runs it', () => {
    mockedSessionService.currentSession.mockReturnValue(new Promise(() => {}))
    const socket = connectSocket()

    expect(socket.on.mock.calls.map(([event]) => event)).toEqual(
      expect.arrayContaining(['sessions:join', 'sessions/recap:join'])
    )
    expect(socket.join).toHaveBeenCalledWith(mockUser.id)
  })

  test('sessions:join failure ack carries the refusal code', async () => {
    mockedSocketService.getInstance.mockReturnValue({
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

  describe('direct-message:send', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    function getHandler(socket: ReturnType<typeof connectSocket>) {
      return socket.on.mock.calls.find(
        ([event]) => event === 'direct-message:send'
      )![1]
    }

    test("sends the saved message to both participants' rooms", async () => {
      const { io, broadcast } = mockIo()
      const socket = connectSocket(io)
      const conversation = {
        id: getUuid(),
        studentId: mockUser.id,
        volunteerId: getUuid(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      const message = {
        id: getUuid(),
        conversationId: conversation.id,
        senderId: mockUser.id,
        contents: 'Hi!',
        createdAt: new Date('2026-10-01T12:00:00.000Z'),
      }
      mockedDirectMessageService.sendMessage.mockResolvedValue({
        conversation,
        message,
      })

      await getHandler(socket)({
        conversationId: conversation.id,
        contents: 'Hi!',
        clientMessageId: 'client-1',
      })

      expect(DirectMessageService.sendMessage).toHaveBeenCalledWith(
        conversation.id,
        mockUser,
        'Hi!'
      )
      expect(broadcast.rooms).toEqual([mockUser.id, conversation.volunteerId])
      expect(broadcast.emit).toHaveBeenCalledWith('direct-message:new', {
        ...message,
        createdAt: '2026-10-01T12:00:00.000Z',
        clientMessageId: 'client-1',
      })
      expect(socket.emit).not.toHaveBeenCalledWith(
        'direct-message:error',
        expect.anything()
      )
    })

    test('tells only the sender when the message cannot be sent', async () => {
      const { io, broadcast } = mockIo()
      const socket = connectSocket(io)
      const conversationId = getUuid()
      mockedDirectMessageService.sendMessage.mockRejectedValue(
        new ConversationNotFoundError()
      )

      await getHandler(socket)({
        conversationId,
        contents: 'Hi!',
        clientMessageId: 'client-1',
      })

      expect(socket.emit).toHaveBeenCalledWith('direct-message:error', {
        conversationId,
        clientMessageId: 'client-1',
      })
      expect(broadcast.emit).not.toHaveBeenCalled()
    })

    test('rejects a malformed conversation id without sending', async () => {
      const socket = connectSocket()

      await getHandler(socket)({ conversationId: 'not-an-id', contents: 'Hi!' })

      expect(DirectMessageService.sendMessage).not.toHaveBeenCalled()
      expect(socket.emit).toHaveBeenCalledWith('direct-message:error', {
        conversationId: 'not-an-id',
        clientMessageId: undefined,
      })
    })
  })
})
