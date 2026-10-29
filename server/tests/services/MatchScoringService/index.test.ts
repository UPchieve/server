import { DEFAULT_SCORECARD } from '../../../services/MatchScoringService/scorecard'
import { rankCoaches } from '../../../services/MatchScoringService'
import { daysInMs, minutesInMs } from '../../../utils/time-utils'

describe('rankCoaches', () => {
  test('no candidates', () => {
    const scorecard = DEFAULT_SCORECARD
    const result = rankCoaches({ candidates: [] }, scorecard)
    expect(result).toStrictEqual({ scorecardVersion: '2', ranked: [] })
  })

  test('ranks 1 candidate', () => {
    const scorecard = DEFAULT_SCORECARD
    const waiting1min = {
      volunteerId: 'waitingfor1min',
      onlineAndWaitingInMs: minutesInMs(1),
      timeSinceLastSessionInMs: daysInMs(1),
    }
    const result = rankCoaches(
      {
        candidates: [waiting1min],
      },
      scorecard
    )

    expect(result).toStrictEqual({
      scorecardVersion: '2',
      ranked: [
        {
          candidate: waiting1min,
          metricScores: { daysSinceLastSession: 1, timeWaitingForSession: 1 },
          score: 2,
        },
      ],
    })
  })

  test('ranks candidates', () => {
    const scorecard = DEFAULT_SCORECARD
    const waiting1min = {
      volunteerId: 'waitingfor1min',
      onlineAndWaitingInMs: minutesInMs(1),
      timeSinceLastSessionInMs: daysInMs(1),
    }
    const waiting10min = {
      volunteerId: 'waitingfor10min',
      onlineAndWaitingInMs: minutesInMs(10),
      timeSinceLastSessionInMs: daysInMs(1),
    }
    const result = rankCoaches(
      {
        candidates: [waiting1min, waiting10min],
      },
      scorecard
    )

    expect(result).toStrictEqual({
      scorecardVersion: '2',
      ranked: [
        {
          candidate: waiting10min,
          metricScores: { daysSinceLastSession: 1, timeWaitingForSession: 10 },
          score: 11,
        },
        {
          candidate: waiting1min,
          metricScores: { daysSinceLastSession: 1, timeWaitingForSession: 1 },
          score: 2,
        },
      ],
    })
  })

  test('gives no daysSinceLastSession points to a coach who has never had a session', () => {
    const scorecard = DEFAULT_SCORECARD
    const neverHadSession = {
      volunteerId: 'neverHadSession',
      onlineAndWaitingInMs: minutesInMs(10),
      timeSinceLastSessionInMs: null,
    }
    const hadSessionYesterday = {
      volunteerId: 'hadSessionYesterday',
      onlineAndWaitingInMs: minutesInMs(10),
      timeSinceLastSessionInMs: daysInMs(1),
    }
    const result = rankCoaches(
      {
        candidates: [neverHadSession, hadSessionYesterday],
      },
      scorecard
    )

    expect(result).toStrictEqual({
      scorecardVersion: '2',
      ranked: [
        {
          candidate: hadSessionYesterday,
          metricScores: { daysSinceLastSession: 1, timeWaitingForSession: 10 },
          score: 11,
        },
        {
          candidate: neverHadSession,
          metricScores: { daysSinceLastSession: 0, timeWaitingForSession: 10 },
          score: 10,
        },
      ],
    })
  })

  test('tie breaks on volunteer id', () => {
    const scorecard = DEFAULT_SCORECARD
    const a = {
      volunteerId: 'waitingfor10minA',
      onlineAndWaitingInMs: minutesInMs(10),
      timeSinceLastSessionInMs: daysInMs(1),
    }
    const b = {
      volunteerId: 'waitingfor10minB',
      onlineAndWaitingInMs: minutesInMs(10),
      timeSinceLastSessionInMs: daysInMs(1),
    }
    const result = rankCoaches(
      {
        candidates: [b, a],
      },
      scorecard
    )

    expect(result).toStrictEqual({
      scorecardVersion: '2',
      ranked: [
        {
          candidate: a,
          metricScores: { daysSinceLastSession: 1, timeWaitingForSession: 10 },
          score: 11,
        },
        {
          candidate: b,
          metricScores: { daysSinceLastSession: 1, timeWaitingForSession: 10 },
          score: 11,
        },
      ],
    })
  })
})
