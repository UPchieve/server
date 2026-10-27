import { DEFAULT_SCORECARD, Scorecard } from './scorecard'
import { compareRanked, score, ScoredCandidate } from './score'
import type { Ulid } from '../../types/shared'

export type ScoringCandidate = Readonly<{
  volunteerId: Ulid
  onlineAndWaitingInMs: number
}>

type MatchScoringInput = Readonly<{
  candidates: readonly ScoringCandidate[]
}>

export type MatchScoringResult = Readonly<{
  scorecardVersion: string
  ranked: readonly ScoredCandidate[]
}>

export function rankCoaches(
  input: MatchScoringInput,
  scorecard: Scorecard = DEFAULT_SCORECARD
): MatchScoringResult {
  return {
    scorecardVersion: scorecard.version,
    ranked: input.candidates
      .map((candidate) => score(scorecard, candidate))
      .toSorted(compareRanked),
  }
}
