import { CurrentSession } from '../../types/session'
import { Ulid } from '../../types/shared'
import * as MatchScoringService from '../MatchScoringService'
import * as SessionOfferRepo from '../../models/SessionOffer'
import { calculateOnlineAndWaitingInMs, eligibleCoaches } from './coaches'
import { DEFAULT_SCORECARD } from '../MatchScoringService/scorecard'
import { SUBJECTS } from '../../constants/subjects'

export type Offer = {
  sessionId: Ulid
  volunteerId: Ulid
  offeredAt: Date
  scores: MatchScoringService.MatchScoringResult
}

export type ClosedOffer = {
  sessionId: Ulid
  volunteerId: Ulid
  outcome: SessionOfferRepo.SessionOfferOutcome
  offeredAt: Date
  closedAt: Date
  scores: MatchScoringService.MatchScoringResult
}

export type OfferHistory = {
  session: CurrentSession
  pending: Offer | null
  closed: ClosedOffer[]
}

type SessionOffersWithPending = OfferHistory & { pending: Offer }

export function initOfferHistory(
  scores: MatchScoringService.MatchScoringResult,
  session: CurrentSession
): SessionOffersWithPending {
  return {
    session,
    pending: {
      sessionId: session.id,
      volunteerId: scores.ranked[0].candidate.volunteerId,
      offeredAt: new Date(),
      scores,
    },
    closed: [],
  }
}

export async function recordShadowOffer(session: CurrentSession) {
  const coaches = await eligibleCoaches(session.subject as SUBJECTS)
  if (!coaches.length) return

  const candidates = await calculateOnlineAndWaitingInMs(coaches)
  if (!candidates.length) return
  const scorecard = DEFAULT_SCORECARD
  const rankedCoaches = MatchScoringService.rankCoaches(
    { candidates },
    scorecard
  )
  const { pending } = initOfferHistory(rankedCoaches, session)

  await SessionOfferRepo.insertSessionOffer({
    sessionId: pending.sessionId,
    volunteerId: pending.volunteerId,
    offeredAt: pending.offeredAt,
    outcome: 'shadow-offered',
    closedAt: pending.offeredAt,
    scorecardVersion: scorecard.version,
    input: candidates,
    output: pending.scores,
  })
}
