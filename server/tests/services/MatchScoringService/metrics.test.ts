import { Metrics } from '../../../services/MatchScoringService/metrics'
import type { DaysSinceLastSessionMetric } from '../../../services/MatchScoringService/metrics/days-since-last-session'
import type { SessionCountBonusForCalendarYearMetric } from '../../../services/MatchScoringService/metrics/session-count-bonus-for-calendar-year'
import type { TimeWaitingForSessionMetric } from '../../../services/MatchScoringService/metrics/time-waiting-for-session'
import { daysInMs, minutesInMs } from '../../../utils/time-utils'

const NOW = new Date('2026-10-28T12:00:00Z')

function ago(ms: number) {
  return new Date(NOW.getTime() - ms)
}

describe('Metrics', () => {
  describe('timeWaitingForSession', () => {
    const timeWaitingForSession: TimeWaitingForSessionMetric = {
      name: 'timeWaitingForSession',
      maxPoints: 100,
      unit: 'minutes',
      segments: [
        { from: 0, pointsPerUnit: 1 },
        { from: 30, pointsPerUnit: 3 },
      ],
    }
    const score = (onlineSince: Date, lastSessionEndedAt: Date | null) =>
      Metrics.timeWaitingForSession.score(
        timeWaitingForSession,
        { onlineSince, lastSessionEndedAt },
        NOW
      )

    test('scores by minutes waiting', () => {
      const scoreOnlineFor = (minutes: number) =>
        score(ago(minutesInMs(minutes)), null)

      expect(scoreOnlineFor(1)).toBe(1)
      expect(scoreOnlineFor(30)).toBe(30)
      expect(scoreOnlineFor(31)).toBe(33)
      expect(scoreOnlineFor(50)).toBe(90)
      // 30 + 30 * 3 = 120, capped at maxPoints
      expect(scoreOnlineFor(60)).toBe(100)
    })

    test('uses onlineSince when the last session ended before the coach came online', () => {
      expect(score(ago(minutesInMs(30)), ago(minutesInMs(120)))).toBe(30)
    })

    test('uses lastSessionEndedAt when the session ended after the coach came online', () => {
      expect(score(ago(minutesInMs(30)), ago(minutesInMs(5)))).toBe(5)
    })
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
    const score = (daysAgo: number | null, pointsIfNeverHadSession = 20) =>
      Metrics.daysSinceLastSession.score(
        daysSinceLastSession(pointsIfNeverHadSession),
        {
          lastSessionEndedAt: daysAgo === null ? null : ago(daysInMs(daysAgo)),
        },
        NOW
      )

    test('scores by days since last session', () => {
      expect(score(1)).toBe(1)
      expect(score(7)).toBe(7)
      expect(score(8)).toBe(9)
      expect(score(0.5)).toBe(0.5)
      // 7 + 23 * 2 = 53, capped at maxPoints
      expect(score(30)).toBe(50)
    })

    test('uses pointsIfNeverHadSession when the coach has never had a session', () => {
      expect(score(null, 20)).toBe(20)
      expect(score(null, 0)).toBe(0)
    })

    test('caps pointsIfNeverHadSession at maxPoints', () => {
      expect(score(null, 999)).toBe(50)
    })
  })

  describe('sessionCountBonusForCalendarYear', () => {
    const sessionCountBonusForCalendarYear: SessionCountBonusForCalendarYearMetric =
      {
        name: 'sessionCountBonusForCalendarYear',
        maxPoints: 50,
        tiers: [
          { from: 2, points: 50 },
          { from: 7, points: 25 },
          { from: 13, points: 0 },
        ],
      }
    const score = (
      sessionCount: number,
      metric = sessionCountBonusForCalendarYear
    ) =>
      Metrics.sessionCountBonusForCalendarYear.score(
        metric,
        { sessionCountThisCalendarYear: sessionCount },
        NOW
      )

    test('gives 0 below the first tier', () => {
      expect(score(0)).toBe(0)
      expect(score(1)).toBe(0)
    })

    test('gives the points of the highest tier the session count has reached', () => {
      expect(score(2)).toBe(50)
      expect(score(6)).toBe(50)
      expect(score(7)).toBe(25)
      expect(score(12)).toBe(25)
      expect(score(13)).toBe(0)
      expect(score(100)).toBe(0)
    })

    test('caps at maxPoints', () => {
      expect(
        score(2, { ...sessionCountBonusForCalendarYear, maxPoints: 30 })
      ).toBe(30)
    })
  })
})
