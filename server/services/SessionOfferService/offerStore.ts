import { Redlock } from '@sesamecare-oss/redlock'
import {
  EXPIRED_KEY_CHANNEL,
  redisClient,
  redisSubClient,
} from '../RedisService'
import * as MatchScoringService from '../MatchScoringService'
import * as SessionOfferRepo from '../../models/SessionOffer'
import logger from '../../logger'
import { Ulid } from '../../types/shared'
import { minutesInMs, secondsInMs } from '../../utils/time-utils'
import {
  ClosedOffer,
  OfferHistory,
  OfferHistoryWithPending,
  OfferSession,
} from './types'

/** @TODO decide per-offer duration and timeout grace period */
// the time the coach has to respond
export const OFFER_DURATION_MS = secondsInMs(30)
// plus grace for high-line's response. when the timer expires, the offer has
// timed out
const OFFER_TIMEOUT_MS = OFFER_DURATION_MS + secondsInMs(10)

// the claim is deleted when the offer closes or offering
// stops, so it only lapses if subway dies mid-offer. it must outlast any live
// offer, including a late expiry, or the coach could get a second offer
const CLAIM_TTL_MS = minutesInMs(5)

// the history is normally cleared when offering stops.
// refreshed on every write, which a working loop makes at least once per
// offer timeout, so it lapses soon after offering stalls and the session is
// listed for every coach again
const HISTORY_TTL_MS = OFFER_TIMEOUT_MS + secondsInMs(10)

// the expired key's value is gone by the time we hear about it,
// so everything the handler needs is in the key name
const TIMER_KEY_PREFIX = 'sessionOffers:timer:'
const timerKey = (sessionId: Ulid, volunteerId: Ulid) =>
  `${TIMER_KEY_PREFIX}${sessionId}:${volunteerId}`
const historyKey = (sessionId: Ulid) => `sessionOffers:history:${sessionId}`
const claimKey = (volunteerId: Ulid) => `sessionOffers:claim:${volunteerId}`
const lockKey = (sessionId: Ulid) => `sessionOffers:lock:${sessionId}`

// waiters retry instead of giving up: the lock is only held for a few redis
// calls, and a waiter may be a valid response that still needs to run its check
const redlock = new Redlock([redisClient], {
  retryCount: 20,
  retryDelay: 50,
  retryJitter: 25,
})

function parseTimerKey(
  key: string
): { sessionId: Ulid; volunteerId: Ulid } | null {
  if (!key.startsWith(TIMER_KEY_PREFIX)) return null
  const [sessionId, volunteerId] = key.slice(TIMER_KEY_PREFIX.length).split(':')
  if (!sessionId || !volunteerId) return null
  return { sessionId, volunteerId }
}

export function onOfferTimerExpired(
  handler: (sessionId: Ulid, volunteerId: Ulid) => Promise<void>
): void {
  redisSubClient.on('message', async (channel: string, key: string) => {
    if (channel !== EXPIRED_KEY_CHANNEL) return
    const offer = parseTimerKey(key)
    if (offer) await handler(offer.sessionId, offer.volunteerId)
  })
}

function isPendingFor(
  history: OfferHistory | null,
  volunteerId: Ulid
): history is OfferHistoryWithPending {
  return history?.pending?.volunteerId === volunteerId
}

function close(
  history: OfferHistoryWithPending,
  outcome: SessionOfferRepo.SessionOfferOutcome
): OfferHistory {
  return {
    session: history.session,
    pending: null,
    closed: [
      ...history.closed,
      { ...history.pending, outcome, closedAt: new Date() },
    ],
  }
}

function parseOfferHistory(json: string): OfferHistory {
  const OFFER_DATE_KEYS = ['offeredAt', 'closedAt']
  return JSON.parse(json, (key, value) =>
    OFFER_DATE_KEYS.includes(key) && typeof value === 'string'
      ? new Date(value)
      : value
  )
}

export async function getOfferHistory(
  sessionId: Ulid
): Promise<OfferHistory | null> {
  const json = await redisClient.get(historyKey(sessionId))
  return json === null ? null : parseOfferHistory(json)
}

/** a session is being offered from when its history is created until it is cleared */
export async function saveEmptyOfferHistory(
  session: OfferSession
): Promise<void> {
  const history: OfferHistory = { session, pending: null, closed: [] }
  await redisClient.set(
    historyKey(session.id),
    JSON.stringify(history),
    'PX',
    HISTORY_TTL_MS
  )
}

export async function getSessionIdsBeingOffered(
  sessionIds: Ulid[]
): Promise<Set<Ulid>> {
  if (!sessionIds.length) return new Set()
  const histories = await redisClient.mget(sessionIds.map(historyKey))
  return new Set(sessionIds.filter((_, i) => histories[i] !== null))
}

/** returns false if the coach already has a pending offer for another session */
async function cachePendingOffer(
  history: OfferHistoryWithPending
): Promise<boolean> {
  const sessionId = history.session.id
  const { volunteerId } = history.pending
  const claimed = await redisClient.set(
    claimKey(volunteerId),
    sessionId,
    'PX',
    CLAIM_TTL_MS,
    'NX'
  )
  if (claimed !== 'OK') return false

  try {
    await redisClient
      .multi()
      .set(historyKey(sessionId), JSON.stringify(history), 'PX', HISTORY_TTL_MS)
      .set(timerKey(sessionId, volunteerId), '', 'PX', OFFER_TIMEOUT_MS)
      .exec()
  } catch (err) {
    await redisClient.del(claimKey(volunteerId))
    throw err
  }
  return true
}

/**
 * walks down the ranking, offering to the first coach who has not already had
 * an offer for this session and is not claimed by another session. returns
 * null if there is no such coach, or if offering stopped while ranking
 */
export async function claimFirstAvailableCoach(
  sessionId: Ulid,
  scores: MatchScoringService.MatchScoringResult
): Promise<OfferHistoryWithPending | null> {
  return redlock.using([lockKey(sessionId)], secondsInMs(5), async () => {
    const history = await getOfferHistory(sessionId)
    if (!history || history.pending) return null

    const alreadyOffered = new Set(
      history.closed.map(({ volunteerId }) => volunteerId)
    )
    for (const { candidate } of scores.ranked) {
      if (alreadyOffered.has(candidate.volunteerId)) continue
      const offer = {
        ...history,
        pending: {
          volunteerId: candidate.volunteerId,
          offeredAt: new Date(),
          scores,
        },
      }
      if (await cachePendingOffer(offer)) return offer
    }
    return null
  })
}

export async function closePendingOffer(
  sessionId: Ulid,
  volunteerId: Ulid,
  outcome: SessionOfferRepo.SessionOfferOutcome
): Promise<OfferHistory | null> {
  // skips the lock for the common case of a session that was never offered
  if (!isPendingFor(await getOfferHistory(sessionId), volunteerId)) return null

  const history = await redlock.using(
    [lockKey(sessionId)],
    secondsInMs(5),
    async () => {
      const history = await getOfferHistory(sessionId)
      if (!isPendingFor(history, volunteerId)) return null

      const closed = close(history, outcome)
      await redisClient
        .multi()
        .set(
          historyKey(sessionId),
          JSON.stringify(closed),
          'PX',
          HISTORY_TTL_MS
        )
        .del(claimKey(volunteerId), timerKey(sessionId, volunteerId))
        .exec()
      return closed
    }
  )
  if (history) await saveClosedOffer(history)
  return history
}

// a failed write loses one row of data, but must not stop the offer loop
async function saveClosedOffer(history: OfferHistory): Promise<void> {
  const sessionId = history.session.id
  const offer = history.closed[history.closed.length - 1]
  try {
    await SessionOfferRepo.insertSessionOffer({
      sessionId,
      volunteerId: offer.volunteerId,
      offeredAt: offer.offeredAt,
      outcome: offer.outcome,
      closedAt: offer.closedAt,
      scorecardVersion: offer.scores.scorecardVersion,
      output: offer.scores,
    })
  } catch (err) {
    logger.error('Failed to save closed session offer', {
      err,
      sessionId,
      volunteerId: offer.volunteerId,
      outcome: offer.outcome,
    })
  }
}

async function deleteOfferHistory(
  sessionId: Ulid,
  history: OfferHistory
): Promise<void> {
  const transaction = redisClient.multi().del(historyKey(sessionId))
  if (history.pending) {
    const { volunteerId } = history.pending
    transaction.del(claimKey(volunteerId), timerKey(sessionId, volunteerId))
  }
  await transaction.exec()
}

/**
 * stops offering the session, freeing the coach of any offer still pending.
 * returns false if the session was not being offered, so that only one caller
 * acts on offering having stopped
 */
export async function clearOfferHistory(sessionId: Ulid): Promise<boolean> {
  // skips the lock for the common case of a session that was never offered
  if (!(await redisClient.exists(historyKey(sessionId)))) return false

  return redlock.using([lockKey(sessionId)], secondsInMs(5), async () => {
    const history = await getOfferHistory(sessionId)
    if (!history) return false

    await deleteOfferHistory(sessionId, history)
    return true
  })
}

export async function closePendingOfferAndClear(
  sessionId: Ulid,
  outcomeFor: (volunteerId: Ulid) => SessionOfferRepo.SessionOfferOutcome
): Promise<ClosedOffer | null> {
  // skips the lock for the common case of a session that was never offered
  if (!(await redisClient.exists(historyKey(sessionId)))) return null

  const closed = await redlock.using(
    [lockKey(sessionId)],
    secondsInMs(5),
    async () => {
      const history = await getOfferHistory(sessionId)
      if (!history) return null

      await deleteOfferHistory(sessionId, history)
      const { pending } = history
      return pending
        ? close({ ...history, pending }, outcomeFor(pending.volunteerId))
        : null
    }
  )
  if (!closed) return null

  await saveClosedOffer(closed)
  return closed.closed[closed.closed.length - 1]
}
