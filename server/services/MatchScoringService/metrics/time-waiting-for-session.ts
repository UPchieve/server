import { defineMetric } from './define'
import { lastSessionEndedAt, onlineSince } from '../facts'
import {
  PointsForElapsedTimeMetric,
  pointsForElapsedTimeMetric,
} from './elapsed-time'

export type TimeWaitingForSessionMetric =
  PointsForElapsedTimeMetric<'minutes'> &
    Readonly<{ name: 'timeWaitingForSession' }>

export const timeWaitingForSession =
  defineMetric<TimeWaitingForSessionMetric>()({
    needs: [onlineSince, lastSessionEndedAt],
    score(metric, { onlineSince, lastSessionEndedAt }, now) {
      const waitingSince = Math.max(
        onlineSince.getTime(),
        lastSessionEndedAt?.getTime() ?? 0
      )
      return pointsForElapsedTimeMetric(metric, now.getTime() - waitingSince)
    },
  })
