import type { Fact, FactsOf } from '../facts'

export type MetricBase = Readonly<{
  name: string
  maxPoints: number
}>

export type MetricDefinition<
  M extends MetricBase,
  Needs extends readonly Fact[],
> = Readonly<{
  needs: Needs
  score: (metric: M, facts: FactsOf<Needs>, now: Date) => number
}>

type MetricDefiner<M extends MetricBase> = <
  const Needs extends readonly Fact[],
>(
  definition: MetricDefinition<M, Needs>
) => MetricDefinition<M, Needs>

// we've curried this fn so M can be given by the caller
// while `Needs` can be inferred from the given `Fact`s
export function defineMetric<M extends MetricBase>(): MetricDefiner<M> {
  return (definition) => definition
}
