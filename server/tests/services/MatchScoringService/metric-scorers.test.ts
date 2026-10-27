import { MetricScorers } from '../../../services/MatchScoringService/metric-scorers'
import { DEFAULT_SCORECARD } from '../../../services/MatchScoringService/scorecard'
import { minutesInMs } from '../../../utils/time-utils'

describe('MetricScorers', () => {
  test('timeWaitingForSession', () => {
    const scorecard = DEFAULT_SCORECARD
    const timeWaitingForSession = scorecard.metrics[0]
    const candidate = {
      volunteerId: 'abc',
      onlineAndWaitingInMs: minutesInMs(1),
    }
    const result = MetricScorers['timeWaitingForSession'](
      timeWaitingForSession,
      candidate
    )
    expect(result).toBe(1)

    const candidate2 = {
      volunteerId: 'abc',
      onlineAndWaitingInMs: minutesInMs(30),
    }
    const result2 = MetricScorers['timeWaitingForSession'](
      timeWaitingForSession,
      candidate2
    )
    expect(result2).toBe(30)

    const candidate3 = {
      volunteerId: 'abc',
      onlineAndWaitingInMs: minutesInMs(31),
    }
    const result3 = MetricScorers['timeWaitingForSession'](
      timeWaitingForSession,
      candidate3
    )
    expect(result3).toBe(33)

    const candidate4 = {
      volunteerId: 'abc',
      onlineAndWaitingInMs: minutesInMs(60),
    }
    const result4 = MetricScorers['timeWaitingForSession'](
      timeWaitingForSession,
      candidate4
    )
    expect(result4).toBe(120)
  })
})
