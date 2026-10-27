import { ScoringCandidate } from '.'
import { minutesInMs } from '../../utils/time-utils'

type MetricBase = Readonly<{
  name: string
  maxPoints: number
}>

type Segment = Readonly<{ fromMinutes: number; pointsPerMinute: number }>

export type TimeWaitingForSessionMetric = MetricBase &
  Readonly<{
    name: 'timeWaitingForSession'
    segments: readonly Segment[]
  }>

function timeWaitingForSessionScorer(
  metric: TimeWaitingForSessionMetric,
  candidate: ScoringCandidate
): number {
  const minutes = candidate.onlineAndWaitingInMs / minutesInMs(1)
  return metric.segments.reduce((points, segment, i) => {
    const end = metric.segments[i + 1]?.fromMinutes ?? Infinity
    const minutesInSegment = Math.min(minutes, end) - segment.fromMinutes
    return points + Math.max(0, minutesInSegment) * segment.pointsPerMinute
  }, 0)
}

type MetricScorer<M extends Metric> = (
  metric: M,
  candidate: ScoringCandidate
) => number

export type Metric = TimeWaitingForSessionMetric

export const MetricScorers = {
  timeWaitingForSession: timeWaitingForSessionScorer,
} satisfies { [M in Metric as M['name']]: MetricScorer<M> }

export function scoreMetric(
  metric: Metric,
  candidate: ScoringCandidate
): number {
  switch (metric.name) {
    case 'timeWaitingForSession':
      return MetricScorers.timeWaitingForSession(metric, candidate)
  }
}
