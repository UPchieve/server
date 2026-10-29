import * as SessionRepo from '../../../models/Session'
import { getDbUlid } from '../../../models/pgUtils'
import { rankCoaches } from '../../../services/MatchScoringService'
import {
  DEFAULT_SCORECARD,
  Scorecard,
} from '../../../services/MatchScoringService/scorecard'
import { minutesInMs } from '../../../utils/time-utils'
import config from '../../../config'
import logger from '../../../logger'

jest.mock('../../../models/Session')
jest.mock('../../../logger')

const mockedSessionRepo = jest.mocked(SessionRepo)
const mockedLogger = jest.mocked(logger)
const NOW = new Date('2026-01-01T12:00:00Z')

function minutesAgo(minutes: number) {
  return new Date(NOW.getTime() - minutesInMs(minutes))
}

describe('rankCoaches', () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: NOW })
    jest.clearAllMocks()
    mockedSessionRepo.getLastSessionEndedAtByVolunteerIds.mockResolvedValue([])
    mockedSessionRepo.getSessionCountsSinceByVolunteerIds.mockResolvedValue([])
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  test('loads each fact the scorecard needs for every coach', async () => {
    const withHistory = getDbUlid()
    const withoutHistory = getDbUlid()
    mockedSessionRepo.getLastSessionEndedAtByVolunteerIds.mockResolvedValue([
      { volunteerId: withHistory, endedAt: minutesAgo(120) },
    ])
    mockedSessionRepo.getSessionCountsSinceByVolunteerIds.mockResolvedValue([
      { volunteerId: withHistory, sessionCount: 2 },
    ])

    const { input: actual } = await rankCoaches(
      [
        { userId: withHistory, onlineSince: minutesAgo(10) },
        { userId: withoutHistory, onlineSince: minutesAgo(30) },
      ],
      DEFAULT_SCORECARD
    )

    expect(actual).toEqual({
      now: NOW,
      candidates: [
        {
          volunteerId: withHistory,
          facts: {
            onlineSince: minutesAgo(10),
            lastSessionEndedAt: minutesAgo(120),
            sessionCountThisCalendarYear: 2,
          },
        },
        {
          volunteerId: withoutHistory,
          facts: {
            onlineSince: minutesAgo(30),
            lastSessionEndedAt: null,
            sessionCountThisCalendarYear: 0,
          },
        },
      ],
    })
    expect(
      mockedSessionRepo.getSessionCountsSinceByVolunteerIds
    ).toHaveBeenCalledWith(
      [withHistory, withoutHistory],
      new Date('2026-01-01T00:00:00Z'),
      config.minSessionLength
    )
  })

  test('loads a fact once when several metrics need it', async () => {
    await rankCoaches(
      [{ userId: getDbUlid(), onlineSince: minutesAgo(10) }],
      DEFAULT_SCORECARD
    )

    expect(
      mockedSessionRepo.getLastSessionEndedAtByVolunteerIds
    ).toHaveBeenCalledTimes(1)
  })

  test('skips coaches without an onlineSince', async () => {
    const withOnlineSince = getDbUlid()

    const { input: actual } = await rankCoaches(
      [
        { userId: withOnlineSince, onlineSince: minutesAgo(10) },
        { userId: getDbUlid(), onlineSince: null },
      ],
      DEFAULT_SCORECARD
    )

    expect(actual.candidates.map(({ volunteerId }) => volunteerId)).toEqual([
      withOnlineSince,
    ])
    expect(
      mockedSessionRepo.getLastSessionEndedAtByVolunteerIds
    ).toHaveBeenCalledWith([withOnlineSince], config.minSessionLength)
  })

  test('does not load facts the scorecard does not need', async () => {
    const userId = getDbUlid()
    const scorecard: Scorecard = {
      ...DEFAULT_SCORECARD,
      metrics: DEFAULT_SCORECARD.metrics.filter(
        ({ name }) => name !== 'sessionCountBonusForCalendarYear'
      ),
    }

    const { input: actual } = await rankCoaches(
      [{ userId, onlineSince: minutesAgo(10) }],
      scorecard
    )

    expect(
      mockedSessionRepo.getSessionCountsSinceByVolunteerIds
    ).not.toHaveBeenCalled()
    expect(actual.candidates[0].facts).not.toHaveProperty(
      'sessionCountThisCalendarYear'
    )
  })

  test('logs and keeps scoring when the scorecard has an unknown metric', async () => {
    const userId = getDbUlid()
    const scorecard = {
      ...DEFAULT_SCORECARD,
      metrics: [
        ...DEFAULT_SCORECARD.metrics,
        { name: 'notAMetric', maxPoints: 10 },
      ],
    } as unknown as Scorecard

    const { result } = await rankCoaches(
      [{ userId, onlineSince: minutesAgo(10) }],
      scorecard
    )

    expect(mockedLogger.error).toHaveBeenCalledWith(
      'Unknown metric. Loading no facts for it',
      expect.objectContaining({ metric: 'notAMetric' })
    )
    expect(result.ranked[0].metricScores).toStrictEqual({
      timeWaitingForSession: 10,
      daysSinceLastSession: 0,
      sessionCountBonusForCalendarYear: 0,
      notAMetric: 0,
    })
  })
})
