import { defineMetric } from './define'
import { inQueueSince, lastSessionEndedAt } from '../facts'
import {
  PointsForElapsedTimeMetric,
  pointsForElapsedTimeMetric,
} from './elapsed-time'

export type TimeWaitingForSessionMetric =
  PointsForElapsedTimeMetric<'minutes'> &
    Readonly<{ name: 'timeWaitingForSession' }>

export const timeWaitingForSession =
  defineMetric<TimeWaitingForSessionMetric>()({
    needs: [inQueueSince, lastSessionEndedAt],
    score(metric, { inQueueSince, lastSessionEndedAt }, now) {
      const waitingSince = Math.max(
        inQueueSince.getTime(),
        lastSessionEndedAt?.getTime() ?? 0
      )
      return pointsForElapsedTimeMetric(metric, now.getTime() - waitingSince)
    },
  })
