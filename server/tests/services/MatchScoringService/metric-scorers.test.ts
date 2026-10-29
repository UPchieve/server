import {
  DaysSinceLastSessionMetric,
  MetricScorers,
  TimeWaitingForSessionMetric,
} from '../../../services/MatchScoringService/metric-scorers'
import { daysInMs, minutesInMs } from '../../../utils/time-utils'

describe('MetricScorers', () => {
  test('timeWaitingForSession', () => {
    const timeWaitingForSession: TimeWaitingForSessionMetric = {
      name: 'timeWaitingForSession',
      maxPoints: 100,
      unit: 'minutes',
      segments: [
        { from: 0, pointsPerUnit: 1 },
        { from: 30, pointsPerUnit: 3 },
      ],
    }
    const score = (minutes: number) =>
      MetricScorers.timeWaitingForSession(timeWaitingForSession, {
        volunteerId: 'abc',
        onlineAndWaitingInMs: minutesInMs(minutes),
        timeSinceLastSessionInMs: null,
      })

    expect(score(1)).toBe(1)
    expect(score(30)).toBe(30)
    expect(score(31)).toBe(33)
    expect(score(50)).toBe(90)
    // 30 + 30 * 3 = 120, capped at maxPoints
    expect(score(60)).toBe(100)
  })

  describe('daysSinceLastSession', () => {
    const daysSinceLastSession = (
      pointsIfNeverHadSession: number
    ): DaysSinceLastSessionMetric => ({
      name: 'daysSinceLastSession',
      maxPoints: 50,
      unit: 'days',
      pointsIfNeverHadSession,
      segments: [
        { from: 0, pointsPerUnit: 1 },
        { from: 7, pointsPerUnit: 2 },
      ],
    })
    const score = (
      timeSinceLastSessionInMs: number | null,
      pointsIfNeverHadSession = 20
    ) =>
      MetricScorers.daysSinceLastSession(
        daysSinceLastSession(pointsIfNeverHadSession),
        {
          volunteerId: 'abc',
          onlineAndWaitingInMs: 0,
          timeSinceLastSessionInMs,
        }
      )

    test('scores by days since last session', () => {
      expect(score(daysInMs(1))).toBe(1)
      expect(score(daysInMs(7))).toBe(7)
      expect(score(daysInMs(8))).toBe(9)
      expect(score(daysInMs(0.5))).toBe(0.5)
      // 7 + 23 * 2 = 53, capped at maxPoints
      expect(score(daysInMs(30))).toBe(50)
    })

    test('uses pointsIfNeverHadSession when the coach has never had a session', () => {
      expect(score(null, 20)).toBe(20)
      expect(score(null, 0)).toBe(0)
    })

    test('caps pointsIfNeverHadSession at maxPoints', () => {
      expect(score(null, 999)).toBe(50)
    })
  })
})
