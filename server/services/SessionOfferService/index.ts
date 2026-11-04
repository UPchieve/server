import { CurrentSession } from '../../types/session'
import { Ulid } from '../../types/shared'
import * as MatchScoringService from '../MatchScoringService'
import SocketService from '../SocketService'
import * as SessionOfferRepo from '../../models/SessionOffer'
import logger from '../../logger'
import { eligibleCoaches } from './coaches'
import * as OfferStore from './offerStore'
import { DEFAULT_SCORECARD } from '../MatchScoringService/scorecard'
import { SUBJECTS } from '../../constants/subjects'
import { OfferSession } from './types'

/** @TODO decide how many coaches to offer a session to */
export const MAX_OFFERS = 5

function toOfferSession(session: CurrentSession): OfferSession {
  return {
    id: session.id,
    subject: session.subject,
    subjectDisplayName: session.subjectDisplayName,
    topic: session.topic,
    studentFirstName: session.student.firstName,
  }
}

export async function makeInitialOffer(session: CurrentSession) {
  try {
    const offerSession = toOfferSession(session)
    await OfferStore.saveEmptyOfferHistory(offerSession)
    await offerToTopCoach(offerSession)
  } catch (err) {
    logger.error('Failed to start offering session', {
      err,
      sessionId: session.id,
    })
  }
}

export async function withoutSessionsBeingOffered<T extends { id: Ulid }>(
  sessions: T[]
): Promise<T[]> {
  const beingOffered = await OfferStore.getSessionIdsBeingOffered(
    sessions.map(({ id }) => id)
  )
  return sessions.filter(({ id }) => !beingOffered.has(id))
}

async function claimTopCoach(session: OfferSession) {
  const coaches = await eligibleCoaches(session.subject as SUBJECTS)
  if (!coaches.length) return null

  const { result } = await MatchScoringService.rankCoaches(
    coaches,
    DEFAULT_SCORECARD
  )
  return OfferStore.claimFirstAvailableCoach(session.id, result)
}

async function offerToTopCoach(offerSession: OfferSession): Promise<void> {
  const sessionId = offerSession.id
  try {
    const offer = await claimTopCoach(offerSession)
    if (!offer) return await stopOffering(sessionId)

    const { session, pending } = offer
    SocketService.getInstance().emitSessionOffer(pending.volunteerId, {
      sessionId: session.id,
      subject: session.subject,
      subjectDisplayName: session.subjectDisplayName,
      topic: session.topic,
      studentFirstName: session.studentFirstName,
      expiresAt: new Date(
        pending.offeredAt.getTime() + OfferStore.OFFER_DURATION_MS
      ),
    })
  } catch (err) {
    logger.error('Failed to offer session, stopping offers', {
      err,
      sessionId,
    })
    await stopOffering(sessionId)
  }
}

async function offerToNextCoach(sessionId: Ulid): Promise<void> {
  const history = await OfferStore.getOfferHistory(sessionId)
  // offering already stopped
  if (!history) return
  if (history.closed.length >= MAX_OFFERS) return stopOffering(sessionId)

  await offerToTopCoach(history.session)
}

// tells every one of the coach's open clients, so the offer goes away even
// where they did not respond
function tellCoachOfferClosed(
  sessionId: Ulid,
  volunteerId: Ulid,
  outcome: SessionOfferRepo.SessionOfferOutcome
): void {
  try {
    SocketService.getInstance().emitSessionOfferClosed(volunteerId, {
      sessionId,
      outcome,
    })
  } catch (err) {
    logger.error('Failed to tell coach their session offer closed', {
      err,
      sessionId,
      volunteerId,
      outcome,
    })
  }
}

async function closeOffer(
  sessionId: Ulid,
  volunteerId: Ulid,
  outcome: SessionOfferRepo.SessionOfferOutcome
): Promise<boolean> {
  const history = await OfferStore.closePendingOffer(
    sessionId,
    volunteerId,
    outcome
  )
  if (!history) return false

  tellCoachOfferClosed(sessionId, volunteerId, outcome)
  return true
}

async function closeOffersFor(
  sessionId: Ulid,
  outcomeFor: (volunteerId: Ulid) => SessionOfferRepo.SessionOfferOutcome
): Promise<void> {
  const closed = await OfferStore.closePendingOfferAndClear(
    sessionId,
    outcomeFor
  )
  if (closed)
    tellCoachOfferClosed(sessionId, closed.volunteerId, closed.outcome)
}

/** TEMPORARY: a coach other than the one with the pending offer picking it up counts as shadow-offered */
export async function onSessionJoined(
  sessionId: Ulid,
  volunteerId: Ulid
): Promise<void> {
  await closeOffersFor(sessionId, (offeredTo) =>
    /** NOTE: shadow-offered is temporary. there won't be a ternary once we're actually offering */
    offeredTo === volunteerId ? 'accepted' : 'shadow-offered'
  )
}

export async function onOfferWithdrawn(sessionId: Ulid): Promise<void> {
  await closeOffersFor(sessionId, () => 'withdrawn-by-student')
}

export async function onOfferDeclined(
  sessionId: Ulid,
  volunteerId: Ulid
): Promise<void> {
  if (await closeOffer(sessionId, volunteerId, 'declined'))
    await offerToNextCoach(sessionId)
}

async function onOfferExpired(
  sessionId: Ulid,
  volunteerId: Ulid
): Promise<void> {
  if (await closeOffer(sessionId, volunteerId, 'expired'))
    await offerToNextCoach(sessionId)
}

export function listenForOfferExpiries() {
  OfferStore.onOfferTimerExpired(async (sessionId, volunteerId) => {
    try {
      await onOfferExpired(sessionId, volunteerId)
    } catch (err) {
      logger.error('Failed to handle session offer expiry', {
        err,
        sessionId,
        volunteerId,
      })
    }
  })
}

async function stopOffering(sessionId: Ulid): Promise<void> {
  await OfferStore.clearOfferHistory(sessionId)
}
