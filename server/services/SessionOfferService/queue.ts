import { Ulid } from '../../types/shared'
import {
  EXPIRED_KEY_CHANNEL,
  redisClient,
  redisSubClient,
} from '../RedisService'

const QUEUE_KEY = 'volunteerPool'

export type QueueUser = { userId: Ulid; inQueueSince: Date }

/*
 * Presence is sensitive to momentary disconnections. Generally speaking, we kick
 * a coach out of the session queue if they are no longer present/go inactive, but
 * to allow for page refreshes or just momentary disconnections, we want to
 * observe a grace period before we kick them out of the queue.
 */
const INACTIVITY_GRACE_PERIOD_KEY_PREFIX = `${QUEUE_KEY}:leave-queue-grace:`
const INACTIVITY_GRACE_PERIOD_SECONDS = 20
function getGracePeriodKey(coachId: Ulid): string {
  return `${INACTIVITY_GRACE_PERIOD_KEY_PREFIX}${coachId}`
}

export async function startLeaveQueueGracePeriod(coachId: Ulid) {
  await redisClient.set(
    getGracePeriodKey(coachId),
    1,
    'EX',
    INACTIVITY_GRACE_PERIOD_SECONDS
  )
}

export function onLeaveQueueGracePeriodExpired(
  handler: (coachId: Ulid) => Promise<void>
) {
  redisSubClient.on('message', async (channel: string, key: string) => {
    if (
      channel !== EXPIRED_KEY_CHANNEL ||
      !key.startsWith(INACTIVITY_GRACE_PERIOD_KEY_PREFIX)
    ) {
      return
    }
    await handler(key.slice(INACTIVITY_GRACE_PERIOD_KEY_PREFIX.length))
  })
}

/**
 * Adds coach to the queued coaches set
 * @returns true if added to the queue, false if not (was already in queue)
 */
export async function addToQueue(coachId: Ulid): Promise<boolean> {
  // NX: only add new members, so rejoining keeps the original join time
  const added = await redisClient.zadd(QUEUE_KEY, 'NX', Date.now(), coachId)
  return added === 1
}

/**
 * Removes coach from the queued coaches set
 * @returns true if the coach was both in the queue already and now removed from it
 */
export async function removeFromQueue(coachId: Ulid): Promise<boolean> {
  const removed = await redisClient.zrem(QUEUE_KEY, coachId)
  return removed === 1
}

/**
 * every coach in the queue with when they joined it, longest waiting first
 */
export async function getQueueUsers(): Promise<QueueUser[]> {
  // WITHSCORES returns a flat [member, score, member, score, ...] array, lowest score first.
  // the score is the epoch-ms time the coach joined the queue
  const flat = await redisClient.zrange(QUEUE_KEY, 0, -1, 'WITHSCORES')
  const queueUsers: QueueUser[] = []
  for (let i = 0; i < flat.length; i += 2) {
    queueUsers.push({
      userId: flat[i],
      inQueueSince: new Date(Number(flat[i + 1])),
    })
  }
  return queueUsers
}

/**
 * when the coach joined the queue (they keep this time until they leave it),
 * or null if they aren't in the queue
 */
export async function getInQueueSince(userId: Ulid): Promise<Date | null> {
  // the score is the epoch-ms time the coach joined the queue
  const score = await redisClient.zscore(QUEUE_KEY, userId)
  return score === null ? null : new Date(Number(score))
}

export async function isUserInQueue(userId: Ulid): Promise<boolean> {
  return (await getInQueueSince(userId)) !== null
}
