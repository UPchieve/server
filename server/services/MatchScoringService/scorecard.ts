import { Metric } from './metrics'

export type Scorecard = Readonly<{
  version: string
  scale: number
  metrics: readonly Metric[]
}>

export const DEFAULT_SCORECARD = {
  version: '4',
  scale: 100,
  metrics: [
    {
      name: 'timeWaitingForSession',
      maxPoints: 240,
      unit: 'minutes',
      segments: [
        { from: 0, pointsPerUnit: 5 },
        { from: 20, pointsPerUnit: 8 },
      ],
    },
    {
      name: 'daysSinceLastSession',
      maxPoints: 25,
      unit: 'days',
      pointsIfNeverHadSession: 0,
      segments: [
        { from: 0, pointsPerUnit: 1 },
        { from: 7, pointsPerUnit: 2 },
      ],
    },
    {
      name: 'sessionCountBonusForCalendarYear',
      maxPoints: 50,
      tiers: [
        { from: 2, points: 50 },
        { from: 7, points: 25 },
        { from: 13, points: 0 },
        { from: 50, points: 25 },
      ],
    },
  ],
} satisfies Scorecard
