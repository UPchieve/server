import { DEFAULT_SCORECARD, Scorecard } from './scorecard'
import { compareRanked, score, ScoredCandidate } from './score'
import { CandidateFacts, Metrics, ScoringCandidate } from './metrics'
import { Fact, FactContext } from './facts'
import type { OnlineUser } from '../PresenceService'
import logger from '../../logger'

export type MatchScoringInput = Readonly<{
  now: Date
  candidates: readonly ScoringCandidate[]
}>

export type MatchScoringResult = Readonly<{
  scorecardVersion: string
  now: Date
  ranked: readonly ScoredCandidate[]
}>

async function gatherFacts(
  coaches: readonly OnlineUser[],
  scorecard: Scorecard
): Promise<MatchScoringInput> {
  const scoringCoaches = coaches.flatMap(({ userId, onlineSince }) =>
    onlineSince ? [{ volunteerId: userId, onlineSince }] : []
  )
  const now = new Date()
  const ctx: FactContext = { coaches: scoringCoaches, now }
  const facts = new Set(
    scorecard.metrics.flatMap(({ name }): readonly Fact[] => {
      if (Object.hasOwn(Metrics, name)) return Metrics[name].needs
      logger.error('Unknown metric. Loading no facts for it', {
        err: new Error('Unknown metric'),
        metric: name,
        scorecardVersion: scorecard.version,
      })
      return []
    })
  )
  const lookups = await Promise.all(
    [...facts].map(async ({ key, load }) => [key, await load(ctx)] as const)
  )

  return {
    now,
    candidates: scoringCoaches.map((coach) => ({
      volunteerId: coach.volunteerId,
      facts: Object.fromEntries(
        lookups.map(([key, lookup]) => [key, lookup(coach)])
      ) as CandidateFacts,
    })),
  }
}

export function rank(
  input: MatchScoringInput,
  scorecard: Scorecard = DEFAULT_SCORECARD
): MatchScoringResult {
  return {
    scorecardVersion: scorecard.version,
    now: input.now,
    ranked: input.candidates
      .map((candidate) => score(scorecard, candidate, input.now))
      .toSorted(compareRanked),
  }
}

export async function rankCoaches(
  coaches: readonly OnlineUser[],
  scorecard: Scorecard
): Promise<{ input: MatchScoringInput; result: MatchScoringResult }> {
  const input = await gatherFacts(coaches, scorecard)
  return { input, result: rank(input, scorecard) }
}
