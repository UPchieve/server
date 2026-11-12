import * as PresenceService from '../../services/PresenceService'
import * as RealtimeStatsService from '../../services/RealtimeStatsService'
import * as SessionRepo from '../../models/Session'
import * as Cache from '../../cache'

jest.mock('../../services/PresenceService')
jest.mock('../../models/Session')
jest.mock('../../cache')

const mockedPresenceService = jest.mocked(PresenceService)
const mockedCache = jest.mocked(Cache)
const mockedSessionRepo = jest.mocked(SessionRepo)
const NUM_STUDENTS_ONLINE = 5
const NUM_ONGOING_SESSIONS = 2

describe('getVolunteerFacingStats', () => {
  const expected = {
    studentsOnline: NUM_STUDENTS_ONLINE,
    ongoingSessions: NUM_ONGOING_SESSIONS,
  }

  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('Returns cached stats', async () => {
    mockedCache.getIfExists.mockResolvedValue(JSON.stringify(expected))
    const actual = await RealtimeStatsService.getVolunteerFacingStats()
    expect(actual).toEqual(expected)
    expect(mockedSessionRepo.countOngoingMatchedSessions).not.toHaveBeenCalled()
    expect(mockedPresenceService.countOnlineUsers).not.toHaveBeenCalled()
    expect(mockedCache.getIfExists).toHaveBeenCalledTimes(1)
    expect(mockedCache.saveWithExpiration).not.toHaveBeenCalled()
  })

  it('Returns stats from DB and saves them to cache if cache miss', async () => {
    mockedCache.getIfExists.mockResolvedValue(undefined) // cache miss
    mockedPresenceService.countOnlineUsers.mockResolvedValue(
      NUM_STUDENTS_ONLINE
    )
    mockedSessionRepo.countOngoingMatchedSessions.mockResolvedValue(
      NUM_ONGOING_SESSIONS
    )

    const actual = await RealtimeStatsService.getVolunteerFacingStats()
    expect(actual).toEqual(expected)
    expect(mockedSessionRepo.countOngoingMatchedSessions).toHaveBeenCalledTimes(
      1
    )
    expect(mockedPresenceService.countOnlineUsers).toHaveBeenCalledTimes(1)
    expect(mockedCache.saveWithExpiration).toHaveBeenCalledTimes(1)
    expect(mockedCache.getIfExists).toHaveBeenCalledTimes(1)
  })
})
