import type { Server } from 'socket.io'
import * as cache from '../../cache'
import {
  getUnfulfilledSessions,
  UnfulfilledSessions,
} from '../../models/Session/queries'
import { getCurrentSessionById } from '../../services/SessionService'
import * as SessionHoldsService from '../../services/SessionHoldsService'
import type SocketService from '../../services/SocketService'
import { buildCurrentSession } from '../mocks/generate'

jest.mock('../../cache', () => ({ hgetall: jest.fn() }))
jest.mock('../../logger', () => ({ error: jest.fn() }))
jest.mock('../../models/Session/queries', () => ({
  getUnfulfilledSessions: jest.fn(),
}))
jest.mock('../../services/SessionService', () => ({
  getCurrentSessionById: jest.fn(),
}))
jest.mock('../../services/SessionHoldsService', () => ({
  getEligibleOnlineCoaches: jest.fn(),
  attachHoldData: jest.fn(),
}))

const mockedGetUnfulfilledSessions = jest.mocked(getUnfulfilledSessions)
const mockedGetCurrentSessionById = jest.mocked(getCurrentSessionById)
const mockedCache = jest.mocked(cache)
const mockedSessionHolds = jest.mocked(SessionHoldsService)

// Keep in sync with SocketService's SESSION_LIST_DEBOUNCE_MS.
const DEBOUNCE_MS = 250

describe('SocketService session list broadcasts', () => {
  const session = buildCurrentSession()
  const sessions: UnfulfilledSessions[] = [
    {
      id: session.id,
      _id: session.id,
      student: {
        id: session.student.id,
        firstname: session.student.firstName,
        isTestUser: false,
        isShadowBanned: false,
      },
      subTopic: session.subTopic,
      createdAt: session.createdAt,
      type: session.type,
      subjectDisplayName: session.subjectDisplayName,
    },
  ]
  const sessionsWithHolds = sessions.map((s) => ({
    ...s,
    subject: s.subTopic,
    studentId: s.student.id,
    holds: [],
  }))
  const participants = { timeout: jest.fn(), emit: jest.fn() }
  const volunteers = { emit: jest.fn() }
  const io = { in: jest.fn() }
  let service: SocketService

  beforeEach(() => {
    jest.resetAllMocks()
    jest.useFakeTimers()
    mockedGetCurrentSessionById.mockResolvedValue(session)
    mockedGetUnfulfilledSessions.mockResolvedValue(sessions)
    mockedCache.hgetall.mockResolvedValue({})
    mockedSessionHolds.getEligibleOnlineCoaches.mockResolvedValue([])
    mockedSessionHolds.attachHoldData.mockImplementation(
      async (s: Parameters<typeof SessionHoldsService.attachHoldData>[0]) => ({
        ...s,
        holds: [],
      })
    )
    participants.timeout.mockReturnThis()
    io.in.mockImplementation((room: string | string[]) =>
      room === 'volunteers' ? volunteers : participants
    )

    jest.isolateModules(() => {
      const { default: SocketService } =
        require('../../services/SocketService') as typeof import('../../services/SocketService')
      service = SocketService.getInstance(io as unknown as Server)
    })
  })

  afterEach(() => {
    jest.clearAllTimers()
    jest.useRealTimers()
  })

  test('debounces a burst of changes into one list broadcast', async () => {
    // Three changes 100ms apart, so each one lands inside the previous
    // change's 250ms debounce window: t=0ms, t=100ms, t=200ms.
    for (let change = 0; change < 3; change++) {
      if (change > 0) await jest.advanceTimersByTimeAsync(100)
      await service.emitSessionChange(session.id)
    }

    // Every change restarts the window, so the broadcast is due 250ms after
    // the *last* change (t=450ms), not the first (t=250ms). Stopping 1ms short
    // proves the earlier changes did not each trigger their own broadcast.
    await jest.advanceTimersByTimeAsync(DEBOUNCE_MS - 1)
    expect(mockedGetUnfulfilledSessions).not.toHaveBeenCalled()
    expect(volunteers.emit).not.toHaveBeenCalled()

    // Crossing the trailing edge collapses all three changes into a single
    // db read and a single broadcast to the volunteers room.
    await jest.advanceTimersByTimeAsync(1)
    expect(mockedGetUnfulfilledSessions).toHaveBeenCalledTimes(1)
    expect(volunteers.emit).toHaveBeenCalledTimes(1)
    expect(volunteers.emit).toHaveBeenCalledWith('sessions', sessionsWithHolds)
  })

  // Deferring the broadcast lets two refreshes overlap, so a slow older run
  // must not clobber the list a newer run already sent.
  test('discards a slow older refresh once a newer list has emitted', async () => {
    const olderQuery = Promise.withResolvers<UnfulfilledSessions[]>()
    mockedGetUnfulfilledSessions
      .mockReturnValueOnce(olderQuery.promise)
      .mockResolvedValueOnce([])

    // The older refresh fires on schedule but hangs on its db read, so
    // nothing has reached the volunteers room yet.
    await service.emitSessionChange(session.id)
    await jest.advanceTimersByTimeAsync(DEBOUNCE_MS)
    expect(volunteers.emit).not.toHaveBeenCalled()

    // The newer refresh resolves first and wins the room.
    await service.emitSessionChange(session.id)
    await jest.advanceTimersByTimeAsync(DEBOUNCE_MS)
    expect(volunteers.emit).toHaveBeenCalledTimes(1)
    expect(volunteers.emit).toHaveBeenCalledWith('sessions', [])

    // The stale older refresh finally resolves and must be dropped rather
    // than overwrite the fresher list volunteers already received.
    olderQuery.resolve(sessions)
    await jest.advanceTimersByTimeAsync(0)
    expect(volunteers.emit).toHaveBeenCalledTimes(1)
  })
})
