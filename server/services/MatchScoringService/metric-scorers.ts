import { ScoringCandidate } from '.'
import logger from '../../logger'
import { minutesInMs, daysInMs } from '../../utils/time-utils'

type Unit = 'minutes' | 'days'

const UNIT_IN_MS: Record<Unit, number> = {
  minutes: minutesInMs(1),
  days: daysInMs(1),
}

type MetricBase = Readonly<{
  name: string
  maxPoints: number
}>

type Segment = Readonly<{ from: number; pointsPerUnit: number }>

type PointsForElapsedTimeMetric<U extends Unit> = MetricBase &
  Readonly<{
    unit: U
    segments: readonly Segment[]
  }>

export type TimeWaitingForSessionMetric =
  PointsForElapsedTimeMetric<'minutes'> &
    Readonly<{ name: 'timeWaitingForSession' }>

export type DaysSinceLastSessionMetric = PointsForElapsedTimeMetric<'days'> &
  Readonly<{
    name: 'daysSinceLastSession'
    pointsIfNeverHadSession: number
  }>

function pointsForElapsedTimeMetric(
  metric: PointsForElapsedTimeMetric<Unit>,
  ms: number
): number {
  const units = ms / UNIT_IN_MS[metric.unit]
  const points = metric.segments.reduce((points, segment, i) => {
    const end = metric.segments[i + 1]?.from ?? Infinity
    const minutesInSegment = Math.min(units, end) - segment.from
    return points + Math.max(0, minutesInSegment) * segment.pointsPerUnit
  }, 0)
  return Math.min(points, metric.maxPoints)
}

function timeWaitingForSessionScorer(
  metric: TimeWaitingForSessionMetric,
  candidate: ScoringCandidate
) {
  return pointsForElapsedTimeMetric(metric, candidate.onlineAndWaitingInMs)
}

function daysSinceLastSessionScorer(
  metric: DaysSinceLastSessionMetric,
  candidate: ScoringCandidate
): number {
  if (candidate.timeSinceLastSessionInMs === null)
    return Math.min(metric.pointsIfNeverHadSession, metric.maxPoints)
  return pointsForElapsedTimeMetric(metric, candidate.timeSinceLastSessionInMs)
}

type MetricScorer<M extends Metric> = (
  metric: M,
  candidate: ScoringCandidate
) => number

export type Metric = TimeWaitingForSessionMetric | DaysSinceLastSessionMetric

export const MetricScorers = {
  timeWaitingForSession: timeWaitingForSessionScorer,
  daysSinceLastSession: daysSinceLastSessionScorer,
} satisfies { [M in Metric as M['name']]: MetricScorer<M> }

export function scoreMetric(
  metric: Metric,
  candidate: ScoringCandidate
): number {
  switch (metric.name) {
    case 'timeWaitingForSession':
      return MetricScorers.timeWaitingForSession(metric, candidate)
    case 'daysSinceLastSession':
      return MetricScorers.daysSinceLastSession(metric, candidate)
    default: {
      const unknownMetric: never = metric
      logger.error('Unknown metric. Scoring as 0', {
        err: new Error('Unknown metric'),
        metric: unknownMetric,
        candidate,
      })
      return 0
    }
  }
}
