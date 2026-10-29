import { MetricBase } from './define'
import { minutesInMs, daysInMs } from '../../../utils/time-utils'

type Unit = 'minutes' | 'days'

const UNIT_IN_MS: Record<Unit, number> = {
  minutes: minutesInMs(1),
  days: daysInMs(1),
}

type Segment = Readonly<{ from: number; pointsPerUnit: number }>

export type PointsForElapsedTimeMetric<U extends Unit> = MetricBase &
  Readonly<{
    unit: U
    segments: readonly Segment[]
  }>

export function pointsForElapsedTimeMetric(
  metric: PointsForElapsedTimeMetric<Unit>,
  ms: number
): number {
  const units = ms / UNIT_IN_MS[metric.unit]
  const points = metric.segments.reduce((points, segment, i) => {
    const end = metric.segments[i + 1]?.from ?? Infinity
    const unitsInSegment = Math.min(units, end) - segment.from
    return points + Math.max(0, unitsInSegment) * segment.pointsPerUnit
  }, 0)
  return Math.min(points, metric.maxPoints)
}
