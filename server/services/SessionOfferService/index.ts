import { CurrentSession } from '../../types/session'
import { captureEvent } from '../AnalyticsService'
import { Ulid } from '../../types/shared'
import * as MatchScoringService from '../MatchScoringService'
import SocketService from '../SocketService'
import * as SessionOfferRepo from '../../models/SessionOffer'
import logger from '../../logger'
import { eligibleCoaches } from './coaches'
import * as OfferStore from './offer-store'
import { DEFAULT_SCORECARD } from '../MatchScoringService/scorecard'
import { SUBJECTS } from '../../constants/subjects'
import {
  LeaveQueueReason,
  OfferHistoryWithPending,
  OfferSession,
} from './types'
import * as NotifyVolunteerService from '../NotifyVolunteerService'
import * as PresenceService from '../PresenceService'
import { registerOfflineHandler } from '../PresenceService/offline-handlers'
import * as SessionRepo from '../../models/Session'
import { OFFERING_PERIOD_MS, OFFER_DURATION_MS } from './offer-config'
import * as Queue from './queue'
import Logger from '../../logger'
import * as VolunteerRepo from '../../models/Volunteer'
import { canCoach } from '../../utils/coach-utils'
import { EVENTS } from '../../constants'

function toOfferSession(session: CurrentSession): OfferSession {
  return {
    id: session.id,
    subject: session.subject,
    subjectDisplayName: session.subjectDisplayName,
    topic: session.topic,
    studentFirstName: session.student.firstName,
  }
}

/**
 * hides the session from the session list so it can be offered.
 * returns false if it could not be hidden, so the session should be listed
 */
export async function hideFromSessionList(
  session: CurrentSession
): Promise<boolean> {
  try {
    await OfferStore.saveEmptyOfferHistory(toOfferSession(session))
    return true
  } catch (err) {
    logger.error('Failed to start offering session', {
      err,
      sessionId: session.id,
    })
    return false
  }
}

export async function makeInitialOffer(session: CurrentSession): Promise<void> {
  try {
    await offerToTopCoach(toOfferSession(session))
  } catch (err) {
    logger.error('Failed to offer session', { err, sessionId: session.id })
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

/**
 * exported just for testing!
 */
export async function claimTopCoach(session: OfferSession) {
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
      expiresAt: new Date(pending.offeredAt.getTime() + OFFER_DURATION_MS),
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
  const offeringEndsAt = history.startedAt.getTime() + OFFERING_PERIOD_MS
  if (Date.now() + OFFER_DURATION_MS > offeringEndsAt)
    return stopOffering(sessionId)

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
  outcomeFor: (
    history: OfferHistoryWithPending
  ) => SessionOfferRepo.SessionOfferOutcome | null
): Promise<void> {
  const closed = await OfferStore.closePendingOfferAndClear(
    sessionId,
    outcomeFor
  )
  if (closed)
    tellCoachOfferClosed(
      sessionId,
      closed.volunteerId,
      closed.outcome ?? 'expired'
    )
}

export async function onSessionJoined(
  sessionId: Ulid,
  volunteerId: Ulid
): Promise<void> {
  let leftQueue = false
  try {
    await closeOffersFor(sessionId, ({ pending }) =>
      pending.volunteerId === volunteerId ? 'accepted' : null
    )
  } catch (err) {
    logger.error(`Error while closing offers for ${sessionId}`, {
      err,
      sessionId,
      joinedVolunteerId: volunteerId,
    })
  } finally {
    leftQueue = await leaveQueue(volunteerId, 'joined session')
  }

  try {
    if (leftQueue) {
      await scheduleCoachToRejoinQueue(volunteerId) // only schedule rejoins for people who were in the queue to begin with
    }
  } catch (err) {
    logger.error(
      'Failed to schedule coach to rejoin queue after session ends',
      { err, sessionId, volunteerId }
    )
  }
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

async function markOfflineIfPassive(volunteerId: Ulid): Promise<void> {
  try {
    await PresenceService.markOfflineIfPassive(volunteerId)
  } catch (err) {
    logger.error('Failed to mark coach offline after their offer expired', {
      err,
      volunteerId,
    })
  }
}

async function onOfferExpired(
  sessionId: Ulid,
  volunteerId: Ulid
): Promise<void> {
  if (!(await closeOffer(sessionId, volunteerId, 'expired'))) return
  await markOfflineIfPassive(volunteerId)
  await offerToNextCoach(sessionId)
}

/**
 * Registers what should happen when a coach goes offline.
 *
 * This MUST run in every process that can mark a user offline!
 *
 * The worker also loads PresenceService, so it also runs:
 *  - PresenceService's presence-key expiry listener. Every process hears every
 *    expiry, but only the one that wins the redlock acts on it, so a worker
 *    can be the one to mark a coach offline.
 *  - sweepOnline, through getOnlineUsers/countOnlineUsers in worker jobs.
 *
 * Both remove the coach from the online set and run that process's offline
 * handlers. If the worker had no handlers registered, the grace period would
 * never start and the coach would stay in the queue indefinitely. That's
 * why this is called from the shared registerListeners() init and not from
 * listenForOfferExpiries(), which only API instances run.
 *
 * The handler only sets a Redis key, so it's safe to run from any process.
 */
export function registerOfflineHandlers() {
  registerOfflineHandler(
    ['volunteer'],
    'Start grace period for kicking the coach out of the queue',
    async (coachId: Ulid) => {
      await Queue.startLeaveQueueGracePeriod(coachId)
    }
  )
}

/**
 * Listens for offer timer and queue grace period key expiries.
 *
 * Every instance hears each expiry, so these handlers have to be safe to
 * run more than once. For the grace period, the atomic ZREM in
 * {@link Queue.removeFromQueue} makes sure only one instance emits `left queue`.
 */
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

  // If the grace period key for this user has expired, we need to kick them out of the queue.
  Queue.onLeaveQueueGracePeriodExpired(async (coachId: Ulid) => {
    try {
      if (!(await PresenceService.isOnline(coachId, 'volunteer'))) {
        await leaveQueue(coachId, 'inactive')
      }
    } catch (err) {
      logger.error('Failed to handle queue exit grace period expiry', {
        err,
        coachId,
      })
    }
  })
}

async function stopOffering(sessionId: Ulid): Promise<void> {
  if (!(await OfferStore.clearOfferHistory(sessionId))) return

  const session = await SessionRepo.getCurrentSessionBySessionId(sessionId)
  if (session) {
    await NotifyVolunteerService.beginRegularNotifications(session)
    await PresenceService.expectPassiveCoachesToRespondTo(session)
  }
  await SocketService.getInstance().emitSessionChange(sessionId)
}

/**
 * Returns the Date the queue was joined at if it was joined.
 * @param coachId
 */
export async function joinQueue(coachId: Ulid): Promise<Date | undefined> {
  const isOnlineAsVolunteer = await PresenceService.isOnline(
    coachId,
    'volunteer'
  )
  if (!isOnlineAsVolunteer) {
    logger.warn('Non-volunteer attempted to join queue', { userId: coachId })
    return
  }
  const joinedAt = await Queue.addToQueue(coachId)
  if (joinedAt) {
    captureEvent(coachId, EVENTS.QUEUE_JOINED)
  } else {
    logger.warn('User was not joined to queue', { userId: coachId })
  }
  return joinedAt
}

/**
 * Returns true if the coach was in the queue and left it, false otherwise
 */
export async function leaveQueue(
  coachId: Ulid,
  reason: LeaveQueueReason
): Promise<boolean> {
  const removed = await Queue.removeFromQueue(coachId)
  if (removed) {
    captureEvent(coachId, EVENTS.QUEUE_LEFT, {
      reason,
    })
    // Avoid emitting the event if the user was not actually removed / wasn't in the queue in the first place
    SocketService.getInstance().emitLeftQueue(coachId, reason)
  } else {
    logger.warn('User was not removed from queue', {
      userId: coachId,
      intendedLeaveReason: reason,
    })
  }
  return removed
}

export async function isInQueue(coachId: Ulid): Promise<boolean> {
  return Queue.isUserInQueue(coachId)
}

/**
 * when the coach last joined the queue, or null if they aren't in it
 */
export async function getInQueueSince(coachId: Ulid): Promise<Date | null> {
  return Queue.getInQueueSince(coachId)
}

export async function scheduleCoachToRejoinQueue(coachId: Ulid) {
  await Queue.scheduleQueueRejoin(coachId)
  captureEvent(coachId, EVENTS.SCHEDULED_USER_TO_REJOIN_QUEUE, {
    userId: coachId,
  })
}

/**
 * Rejoins the coach to the queue if we had scheduled this to happen once they become available again.
 * This serves as a mechanism for us to add coaches back to the queue after they are removed from it
 * for picking up a session.
 */
export async function maybeRejoinQueue(coachId: Ulid) {
  try {
    const scheduledAt = await Queue.takeQueueRejoin(coachId)
    if (!scheduledAt) {
      return
    }
    const [isOnlineInCoachMode, coachEligibilities] = await Promise.all([
      PresenceService.isOnline(coachId, 'volunteer'),
      VolunteerRepo.getSubjectAndReadyToCoachInfoByUserIds([coachId]),
    ])
    const isEligible = canCoach(coachEligibilities[0])
    if (isOnlineInCoachMode && isEligible) {
      const joinedAt = await joinQueue(coachId)
      if (joinedAt) {
        SocketService.getInstance().emitRejoinedQueue(coachId, joinedAt)
        captureEvent(coachId, EVENTS.AUTO_REJOINED_QUEUE, {
          userId: coachId,
        })
      }
    }
  } catch (err) {
    Logger.error('maybeRejoinQueue failed', { err, coachId })
  }
}
