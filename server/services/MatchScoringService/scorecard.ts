import { Metric } from './metric-scorers'

export type Scorecard = Readonly<{
  version: string
  scale: number
  metrics: readonly Metric[]
}>

export const DEFAULT_SCORECARD = {
  version: '2',
  scale: 100,
  metrics: [
    {
      name: 'timeWaitingForSession',
      maxPoints: 100,
      unit: 'minutes',
      // @TODO must be sorted by fromMinutes
      // could add a defensive toSorted in scorer
      segments: [
        { from: 0, pointsPerUnit: 1 },
        { from: 30, pointsPerUnit: 3 },
      ],
    },
    {
      name: 'daysSinceLastSession',
      maxPoints: 50,
      unit: 'days',
      pointsIfNeverHadSession: 0,
      segments: [
        { from: 0, pointsPerUnit: 1 },
        { from: 7, pointsPerUnit: 2 },
      ],
    },
  ],
} satisfies Scorecard
