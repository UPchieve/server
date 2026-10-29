import logger from '../../../logger'
import type { Ulid } from '../../../types/shared'
import { Fact, FactsOf } from '../facts'
import { MetricDefinition } from './define'
import { daysSinceLastSession } from './days-since-last-session'
import { sessionCountBonusForCalendarYear } from './session-count-bonus-for-calendar-year'
import { timeWaitingForSession } from './time-waiting-for-session'

export const Metrics = {
  timeWaitingForSession,
  daysSinceLastSession,
  sessionCountBonusForCalendarYear,
}

type MetricOf<D> =
  D extends MetricDefinition<infer M, readonly Fact[]> ? M : never

export type Metric = {
  [K in keyof typeof Metrics]: MetricOf<(typeof Metrics)[K]>
}[keyof typeof Metrics]

type Assert<T extends true> = T
// fails to compile if a Metrics key differs from its metric's name
type MetricKeysMatchNames = Assert<
  {
    [K in keyof typeof Metrics]: MetricOf<(typeof Metrics)[K]>['name']
  } extends { [K in keyof typeof Metrics]: K }
    ? true
    : false
>

export type CandidateFacts = Partial<
  FactsOf<(typeof Metrics)[keyof typeof Metrics]['needs']>
>

export type ScoringCandidate = Readonly<{
  volunteerId: Ulid
  facts: CandidateFacts
}>

function scoreWith<M extends Metric, Needs extends readonly Fact[]>(
  definition: MetricDefinition<M, Needs>,
  metric: M,
  candidate: ScoringCandidate,
  now: Date
): number {
  const missing = definition.needs
    .map(({ key }) => key)
    .filter((key) => !(key in candidate.facts))
  if (missing.length) {
    logger.error('Missing facts for metric. Scoring as 0', {
      err: new Error('Missing facts for metric'),
      metric,
      missing,
      volunteerId: candidate.volunteerId,
    })
    return 0
  }
  return definition.score(metric, candidate.facts as FactsOf<Needs>, now)
}

export function scoreMetric(
  metric: Metric,
  candidate: ScoringCandidate,
  now: Date
): number {
  if (!Object.hasOwn(Metrics, metric.name)) {
    logger.error('Unknown metric. Scoring as 0', {
      err: new Error('Unknown metric'),
      metric,
      candidate,
    })
    return 0
  }
  // MetricKeysMatchNames guarantees this is the definition for metric.name
  const definition = Metrics[metric.name] as MetricDefinition<
    Metric,
    readonly Fact[]
  >
  return scoreWith(definition, metric, candidate, now)
}
