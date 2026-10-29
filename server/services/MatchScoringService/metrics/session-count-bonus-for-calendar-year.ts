import { MetricBase, defineMetric } from './define'
import { sessionCountThisCalendarYear } from '../facts'

export type SessionCountBonusForCalendarYearMetric = MetricBase &
  Readonly<{
    name: 'sessionCountBonusForCalendarYear'
    minSessions: number
    maxSessions: number
  }>

export const sessionCountBonusForCalendarYear =
  defineMetric<SessionCountBonusForCalendarYearMetric>()({
    needs: [sessionCountThisCalendarYear],
    score(metric, { sessionCountThisCalendarYear: count }) {
      return count >= metric.minSessions && count <= metric.maxSessions
        ? metric.maxPoints
        : 0
    },
  })
