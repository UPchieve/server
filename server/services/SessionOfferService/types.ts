import { Ulid } from '../../types/shared'
import { CurrentSession } from '../../types/session'
import * as MatchScoringService from '../MatchScoringService'
import * as SessionOfferRepo from '../../models/SessionOffer'

export type OfferSession = Pick<
  CurrentSession,
  'id' | 'subject' | 'subjectDisplayName' | 'topic'
> & { studentFirstName: string }

export type Offer = {
  volunteerId: Ulid
  offeredAt: Date
  scores: MatchScoringService.MatchScoringResult
}

export type ClosedOffer = {
  volunteerId: Ulid
  outcome: SessionOfferRepo.SessionOfferOutcome
  offeredAt: Date
  closedAt: Date
  scores: MatchScoringService.MatchScoringResult
}

export type OfferHistory = {
  session: OfferSession
  startedAt: Date
  pending: Offer | null
  closed: ClosedOffer[]
}

export type OfferHistoryWithPending = OfferHistory & { pending: Offer }
