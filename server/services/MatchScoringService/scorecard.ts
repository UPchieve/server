import { Metric } from './metric-scorers'

export type Scorecard = Readonly<{
  version: string
  scale: number
  metrics: readonly Metric[]
}>

export const DEFAULT_SCORECARD = {
  version: '1',
  scale: 100,
  metrics: [
    {
      name: 'timeWaitingForSession',
      maxPoints: 600,
      // @TODO must be sorted by fromMinutes
      // could add a defensive toSorted in scorer
      segments: [
        { fromMinutes: 0, pointsPerMinute: 1 },
        { fromMinutes: 30, pointsPerMinute: 3 },
      ],
    },
  ],
} satisfies Scorecard
