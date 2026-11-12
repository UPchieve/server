import { MetricBase, defineMetric } from './define'
import { sessionCountThisCalendarYear } from '../facts'

type Tier = Readonly<{ from: number; points: number }>

export type SessionCountBonusForCalendarYearMetric = MetricBase &
  Readonly<{
    name: 'sessionCountBonusForCalendarYear'
    tiers: readonly Tier[]
  }>

export const sessionCountBonusForCalendarYear =
  defineMetric<SessionCountBonusForCalendarYearMetric>()({
    needs: [sessionCountThisCalendarYear],
    score(metric, { sessionCountThisCalendarYear: count }) {
      const tier = metric.tiers
        .toSorted((a, b) => a.from - b.from)
        .findLast(({ from }) => count >= from)
      return Math.min(tier?.points ?? 0, metric.maxPoints)
    },
  })
