import { defineMetric } from './define'
import { lastSessionEndedAt } from '../facts'
import {
  PointsForElapsedTimeMetric,
  pointsForElapsedTimeMetric,
} from './elapsed-time'

export type DaysSinceLastSessionMetric = PointsForElapsedTimeMetric<'days'> &
  Readonly<{
    name: 'daysSinceLastSession'
    pointsIfNeverHadSession: number
  }>

export const daysSinceLastSession = defineMetric<DaysSinceLastSessionMetric>()({
  needs: [lastSessionEndedAt],
  score(metric, { lastSessionEndedAt }, now) {
    if (lastSessionEndedAt === null)
      return Math.min(metric.pointsIfNeverHadSession, metric.maxPoints)
    return pointsForElapsedTimeMetric(
      metric,
      now.getTime() - lastSessionEndedAt.getTime()
    )
  },
})
