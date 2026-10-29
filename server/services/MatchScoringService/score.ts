import { Scorecard } from './scorecard'
import { ScoringCandidate, scoreMetric } from './metrics'

export type ScoredCandidate = Readonly<{
  candidate: ScoringCandidate
  score: number
  metricScores: Readonly<Record<string, number>>
}>

function compareIds(a: string, b: string): number {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

export function compareRanked(a: ScoredCandidate, b: ScoredCandidate): number {
  return (
    b.score - a.score ||
    compareIds(a.candidate.volunteerId, b.candidate.volunteerId)
  )
}

export function score(
  scorecard: Scorecard,
  candidate: ScoringCandidate,
  now: Date
): ScoredCandidate {
  const metricScores = Object.fromEntries(
    scorecard.metrics.map((metric) => {
      return [metric.name, scoreMetric(metric, candidate, now)]
    })
  )
  const total = Object.values(metricScores).reduce(
    (sum, points) => sum + points,
    0
  )
  return {
    candidate,
    score: Math.round(total * scorecard.scale) / scorecard.scale,
    metricScores,
  }
}
