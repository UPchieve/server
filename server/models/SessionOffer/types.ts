import { Ulid } from '../pgUtils'

export type SessionOfferOutcome =
  | 'declined'
  | 'expired'
  | 'accepted'
  | 'withdrawn-by-student'
  | 'shadow-offered'

export type InsertSessionOfferArgs = {
  sessionId: Ulid
  volunteerId: Ulid
  offeredAt: Date
  outcome: SessionOfferOutcome
  closedAt: Date
  scorecardVersion: string
  output: object
}
