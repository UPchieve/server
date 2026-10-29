import * as SessionRepo from '../../models/Session'
import config from '../../config'
import { startOfUtcYear } from '../../utils/time-utils'
import type { Ulid } from '../../types/shared'

export type ScoringCoach = Readonly<{ volunteerId: Ulid; onlineSince: Date }>

export type FactContext = Readonly<{
  coaches: readonly ScoringCoach[]
  now: Date
}>

export type Fact<K extends string = string, V = unknown> = Readonly<{
  key: K
  load: (ctx: FactContext) => Promise<(coach: ScoringCoach) => V>
}>

export type FactsOf<Needs extends readonly Fact[]> = {
  readonly [F in Needs[number] as F['key']]: F extends Fact<string, infer V>
    ? V
    : never
}

function defineFact<const K extends string, V>(
  key: K,
  load: Fact<K, V>['load']
): Fact<K, V> {
  return { key, load }
}

export const onlineSince = defineFact(
  'onlineSince',
  async () =>
    ({ onlineSince }) =>
      onlineSince
)

export const lastSessionEndedAt = defineFact(
  'lastSessionEndedAt',
  async ({ coaches }) => {
    const rows = await SessionRepo.getLastSessionEndedAtByVolunteerIds(
      coaches.map(({ volunteerId }) => volunteerId),
      config.minSessionLength
    )
    const byId = new Map(
      rows.map(({ volunteerId, endedAt }) => [volunteerId, endedAt])
    )
    return ({ volunteerId }): Date | null => byId.get(volunteerId) ?? null
  }
)

export const sessionCountThisCalendarYear = defineFact(
  'sessionCountThisCalendarYear',
  async ({ coaches, now }) => {
    const rows = await SessionRepo.getSessionCountsSinceByVolunteerIds(
      coaches.map(({ volunteerId }) => volunteerId),
      startOfUtcYear(now),
      config.minSessionLength
    )
    const byId = new Map(
      rows.map(({ volunteerId, sessionCount }) => [volunteerId, sessionCount])
    )
    return ({ volunteerId }) => byId.get(volunteerId) ?? 0
  }
)
