import { DEFAULT_SCORECARD } from '../../../services/MatchScoringService/scorecard'
import { rank } from '../../../services/MatchScoringService'
import { ScoringCandidate } from '../../../services/MatchScoringService/metrics'
import { daysInMs, minutesInMs } from '../../../utils/time-utils'

const NOW = new Date('2026-10-28T12:00:00Z')

function candidate(
  volunteerId: string,
  {
    onlineMinutesAgo,
    lastSessionDaysAgo,
    sessionCount = 0,
  }: {
    onlineMinutesAgo: number
    lastSessionDaysAgo: number | null
    sessionCount?: number
  }
): ScoringCandidate {
  return {
    volunteerId,
    facts: {
      onlineSince: new Date(NOW.getTime() - minutesInMs(onlineMinutesAgo)),
      lastSessionEndedAt:
        lastSessionDaysAgo === null
          ? null
          : new Date(NOW.getTime() - daysInMs(lastSessionDaysAgo)),
      sessionCountThisCalendarYear: sessionCount,
    },
  }
}

describe('rank', () => {
  test('ranks candidates', () => {
    const scorecard = DEFAULT_SCORECARD
    const waiting1min = candidate('waitingfor1min', {
      onlineMinutesAgo: 1,
      lastSessionDaysAgo: 1,
    })
    const waiting10min = candidate('waitingfor10min', {
      onlineMinutesAgo: 10,
      lastSessionDaysAgo: 1,
    })
    const result = rank(
      {
        now: NOW,
        candidates: [waiting1min, waiting10min],
      },
      scorecard
    )

    expect(result).toStrictEqual({
      scorecardVersion: '3',
      now: NOW,
      ranked: [
        {
          candidate: waiting10min,
          metricScores: {
            daysSinceLastSession: 1,
            timeWaitingForSession: 10,
            sessionCountBonusForCalendarYear: 0,
          },
          score: 11,
        },
        {
          candidate: waiting1min,
          metricScores: {
            daysSinceLastSession: 1,
            timeWaitingForSession: 1,
            sessionCountBonusForCalendarYear: 0,
          },
          score: 2,
        },
      ],
    })
  })

  test('gives no daysSinceLastSession points to a coach who has never had a session', () => {
    const scorecard = DEFAULT_SCORECARD
    const neverHadSession = candidate('neverHadSession', {
      onlineMinutesAgo: 10,
      lastSessionDaysAgo: null,
    })
    const hadSessionYesterday = candidate('hadSessionYesterday', {
      onlineMinutesAgo: 10,
      lastSessionDaysAgo: 1,
    })
    const result = rank(
      {
        now: NOW,
        candidates: [neverHadSession, hadSessionYesterday],
      },
      scorecard
    )

    expect(result).toStrictEqual({
      scorecardVersion: '3',
      now: NOW,
      ranked: [
        {
          candidate: hadSessionYesterday,
          metricScores: {
            daysSinceLastSession: 1,
            timeWaitingForSession: 10,
            sessionCountBonusForCalendarYear: 0,
          },
          score: 11,
        },
        {
          candidate: neverHadSession,
          metricScores: {
            daysSinceLastSession: 0,
            timeWaitingForSession: 10,
            sessionCountBonusForCalendarYear: 0,
          },
          score: 10,
        },
      ],
    })
  })

  test('tie breaks on volunteer id', () => {
    const scorecard = DEFAULT_SCORECARD
    const a = candidate('waitingfor10minA', {
      onlineMinutesAgo: 10,
      lastSessionDaysAgo: 1,
    })
    const b = candidate('waitingfor10minB', {
      onlineMinutesAgo: 10,
      lastSessionDaysAgo: 1,
    })
    const result = rank(
      {
        now: NOW,
        candidates: [b, a],
      },
      scorecard
    )

    expect(result).toStrictEqual({
      scorecardVersion: '3',
      now: NOW,
      ranked: [
        {
          candidate: a,
          metricScores: {
            daysSinceLastSession: 1,
            timeWaitingForSession: 10,
            sessionCountBonusForCalendarYear: 0,
          },
          score: 11,
        },
        {
          candidate: b,
          metricScores: {
            daysSinceLastSession: 1,
            timeWaitingForSession: 10,
            sessionCountBonusForCalendarYear: 0,
          },
          score: 11,
        },
      ],
    })
  })

  test('scores a metric as 0 when the candidate is missing a fact it needs', () => {
    const scorecard = DEFAULT_SCORECARD
    const { sessionCountThisCalendarYear, ...facts } = candidate('noCount', {
      onlineMinutesAgo: 10,
      lastSessionDaysAgo: 1,
      sessionCount: 2,
    }).facts
    const result = rank(
      { now: NOW, candidates: [{ volunteerId: 'noCount', facts }] },
      scorecard
    )

    expect(result.ranked[0].metricScores).toStrictEqual({
      daysSinceLastSession: 1,
      timeWaitingForSession: 10,
      sessionCountBonusForCalendarYear: 0,
    })
  })
})
