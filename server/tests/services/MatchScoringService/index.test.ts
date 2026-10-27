import { DEFAULT_SCORECARD } from '../../../services/MatchScoringService/scorecard'
import { rankCoaches } from '../../../services/MatchScoringService'
import { minutesInMs, secondsInMs } from '../../../utils/time-utils'

describe('rankCoaches', () => {
  test('no candidates', () => {
    const scorecard = DEFAULT_SCORECARD
    const result = rankCoaches({ candidates: [] }, scorecard)
    expect(result).toStrictEqual({ scorecardVersion: '1', ranked: [] })
  })

  test('ranks 1 candidate', () => {
    const scorecard = DEFAULT_SCORECARD
    const waiting1min = {
      volunteerId: 'waitingfor1min',
      onlineAndWaitingInMs: minutesInMs(1),
    }
    const result = rankCoaches(
      {
        candidates: [waiting1min],
      },
      scorecard
    )

    expect(result).toStrictEqual({
      scorecardVersion: '1',
      ranked: [
        {
          candidate: waiting1min,
          metricScores: { timeWaitingForSession: 1 },
          score: 1,
        },
      ],
    })
  })

  test('ranks candidates', () => {
    const scorecard = DEFAULT_SCORECARD
    const waiting1min = {
      volunteerId: 'waitingfor1min',
      onlineAndWaitingInMs: minutesInMs(1),
    }
    const waiting10min = {
      volunteerId: 'waitingfor10min',
      onlineAndWaitingInMs: minutesInMs(10),
    }
    const result = rankCoaches(
      {
        candidates: [waiting1min, waiting10min],
      },
      scorecard
    )

    expect(result).toStrictEqual({
      scorecardVersion: '1',
      ranked: [
        {
          candidate: waiting10min,
          metricScores: { timeWaitingForSession: 10 },
          score: 10,
        },
        {
          candidate: waiting1min,
          metricScores: { timeWaitingForSession: 1 },
          score: 1,
        },
      ],
    })
  })

  test('tie breaks on volunteer id', () => {
    const scorecard = DEFAULT_SCORECARD
    const a = {
      volunteerId: 'waitingfor10minA',
      onlineAndWaitingInMs: minutesInMs(10),
    }
    const b = {
      volunteerId: 'waitingfor10minB',
      onlineAndWaitingInMs: minutesInMs(10),
    }
    const result = rankCoaches(
      {
        candidates: [b, a],
      },
      scorecard
    )

    expect(result).toStrictEqual({
      scorecardVersion: '1',
      ranked: [
        {
          candidate: a,
          metricScores: { timeWaitingForSession: 10 },
          score: 10,
        },
        {
          candidate: b,
          metricScores: { timeWaitingForSession: 10 },
          score: 10,
        },
      ],
    })
  })
})
