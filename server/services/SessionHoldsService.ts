import * as SessionRepo from '../models/Session'
import * as PresenceService from './PresenceService'
import { Uuid } from '../types/shared'
import logger from '../logger'
import { shuffle } from 'lodash'
import { SUBJECTS } from '../constants'
import * as cache from '../cache'
import * as VolunteerRepo from '../models/Volunteer'
import * as FeatureFlagService from './FeatureFlagService'
import moment from 'moment'
import { minutesInSeconds } from '../utils/time-utils'
import { filterAsync } from '../utils/filter-async'
import { VolunteerSessionHoldEligibilityData } from '../models/Volunteer'

const coachHoldLengthSeconds = 10
const maxHoldsPerSession = 3
export const HOLD_PARAMETERS = {
  // exported for testing
  COACH_HOLD_LENGTH_SECONDS: coachHoldLengthSeconds,
  MAX_HOLDS_PER_SESSION: maxHoldsPerSession,
  MAX_SESSION_HOLD_LENGTH_SECONDS: coachHoldLengthSeconds * maxHoldsPerSession,
  COACH_SET_TTL_SECONDS: minutesInSeconds(10),
  SESSION_TTL_SECONDS: minutesInSeconds(10),
}

export type SessionHold = {
  coachId: Uuid
  startsAt: Date
  endsAt: Date
}

/**
 * Builds an ordered sequence of SessionHolds based off the given coach IDs.
 * Start and end of each hold is determined by {@link HOLD_PARAMETERS}
 */
export function buildHolds(orderedCoachIds: Uuid[]): SessionHold[] {
  // exported for testing
  const holds: SessionHold[] = []
  const now = moment()
  const secondsPerHold = HOLD_PARAMETERS.COACH_HOLD_LENGTH_SECONDS
  for (let i = 0; i < orderedCoachIds.length; i++) {
    const startsAt = now.clone().add(secondsPerHold * i, 'seconds')
    const endsAt = startsAt.clone().add(secondsPerHold, 'seconds')
    holds.push({
      coachId: orderedCoachIds[i],
      startsAt: startsAt.toDate(),
      endsAt: endsAt.toDate(),
    })
  }
  return holds
}

export async function getOrCreateSessionHolds( // exported for testing
  sessionData: {
    id: Uuid
    subject: SUBJECTS
    createdAt: Date
    studentId: Uuid
  },
  coachData: VolunteerSessionHoldEligibilityData[]
): Promise<SessionHold[]> {
  const cachedHolds = await getCachedHoldsForSession(sessionData.id)
  if (cachedHolds) {
    return cachedHolds
  }

  if (!coachData.length) {
    await saveHoldsToCache(sessionData.id, [])
    return []
  }

  // Certain sessions should not have holds created. This is driven by the FF status of
  // the student creating the session.
  const isHoldEnabledForSession =
    await FeatureFlagService.getSessionHoldsStudentFeatureFlag(
      sessionData.studentId
    )
  if (!isHoldEnabledForSession) {
    await saveHoldsToCache(sessionData.id, [])
    return []
  }
  const enabledSubjects = (
    await FeatureFlagService.getSessionHoldsStudentFeatureFlagPayload(
      sessionData.studentId
    )
  ).subjects
  if (!enabledSubjects.includes(sessionData.subject)) {
    await saveHoldsToCache(sessionData.id, [])
    return []
  }

  // Filter down to those who are certified in the subject _and_ don't have it muted
  const canTutor = coachData.filter((coach) => {
    return (
      coach.unlockedSubjects.includes(sessionData.subject) &&
      !coach.mutedSubjects.includes(sessionData.subject)
    )
  })

  // Order those coaches by recency of the last session they coached, least recently coached first. Also limit to max number of holds.
  const randomized = shuffle(canTutor).slice(
    0,
    HOLD_PARAMETERS.MAX_HOLDS_PER_SESSION
  )

  // Build holds. Cache them.
  const coachIds = randomized.map((coach) => coach.userId)
  const holds = buildHolds(coachIds)
  await saveHoldsToCache(sessionData.id, holds)
  return holds
}

async function saveHoldsToCache(
  sessionId: Uuid,
  holds: SessionHold[]
): Promise<void> {
  await Promise.all(holds.map(async (hold) => saveCoachHold(hold)))
  await saveSessionHoldToCache(sessionId, holds)
}

export async function clearSessionHolds(sessionId: Uuid) {
  const sessionKey = getSessionHoldCacheKey(sessionId)
  const sessionHold = await cache.getIfExists(sessionKey)
  if (sessionHold) {
    // Remove hold for session, plus hold for all coaches
    await cache.remove(sessionKey)
    const coachHolds: SessionHold[] = JSON.parse(sessionHold)
    for (const hold of coachHolds) {
      await cache.remove(getCoachHoldCacheKey(hold.coachId))
    }
  }
}

export async function attachHoldData(
  sessionData: {
    id: Uuid
    subject: SUBJECTS
    createdAt: Date
    studentId: Uuid
  },
  coachData: VolunteerSessionHoldEligibilityData[]
): Promise<{
  id: Uuid
  studentId: Uuid
  createdAt: Date
  subject: SUBJECTS
  holds: SessionHold[]
}> {
  const holds = await getOrCreateSessionHolds(sessionData, coachData)
  return {
    ...sessionData,
    holds: holds,
  }
}

/**
 * Ends the hold for the given coach and moves all the other holds up in their timeline.
 */
export async function dismissHold(coachId: Uuid, sessionId: Uuid) {
  // Get holds from cache
  const cachedHolds = await getCachedHoldsForSession(sessionId)
  if (!cachedHolds) {
    logger.warn(
      {
        coachId,
        sessionId,
      },
      'Could not find cached session holds while dismissing a hold'
    )
    return
  }
  const updatedHolds = buildUpdatedHolds(coachId, cachedHolds)
  await saveSessionHoldToCache(sessionId, updatedHolds)
  for (const hold of updatedHolds) {
    await saveCoachHold(hold)
  }
}

/**
 * Removes the hold for the coach. Shifts up the timeline of all the remaining holds.
 */
function buildUpdatedHolds(coachId: Uuid, holds: SessionHold[]): SessionHold[] {
  const removeIndex = holds.findIndex((hold) => hold.coachId === coachId)
  if (removeIndex < 0) {
    return holds
  }

  // Attach the sublist of past holds to the list of future holds with updated times.
  const previousHolds = holds.slice(0, removeIndex)
  const remainingHolds = holds.slice(removeIndex + 1)
  const endedHold: SessionHold = {
    ...holds[removeIndex],
    endsAt: new Date(),
  }
  return [
    ...previousHolds,
    endedHold,
    ...buildHolds(remainingHolds.map((hold) => hold.coachId)),
  ]
}

function getSessionHoldCacheKey(sessionId: Uuid): string {
  return `SESSION_HOLD:${sessionId}`
}

function getCoachHoldCacheKey(coachId: Uuid): string {
  return `COACH_HOLDS:${coachId}`
}

/**
 * Saves the given hold under the coach cache key.
 * Cleans up expired holds and sets a TTL as well.
 */
async function saveCoachHold(hold: SessionHold) {
  const key = getCoachHoldCacheKey(hold.coachId)
  await cache.removeFromSortedSetByRange(key, '-inf', new Date().getTime())
  await cache.addToSortedSet(key, JSON.stringify(hold), hold.endsAt.getTime())
  await cache.setExpiration(key, HOLD_PARAMETERS.COACH_SET_TTL_SECONDS)
}

async function getCoachHoldsInRange(
  coachId: Uuid,
  startTime: number,
  endTime: number
) {
  return await cache.getFromSortedSetByRange(
    getCoachHoldCacheKey(coachId),
    startTime,
    endTime
  )
}

export async function saveSessionHoldToCache(
  sessionId: Uuid,
  holds: SessionHold[]
) {
  // exported for testing
  await cache.saveWithExpiration(
    getSessionHoldCacheKey(sessionId),
    JSON.stringify(holds),
    HOLD_PARAMETERS.SESSION_TTL_SECONDS
  )
}

async function getCachedHoldsForSession(
  sessionId: Uuid
): Promise<SessionHold[] | undefined> {
  const maybeHolds = await cache.getIfExists(getSessionHoldCacheKey(sessionId))
  if (maybeHolds) {
    function dateStringToDate(key: string, value: any) {
      if (!['startsAt', 'endsAt'].includes(key)) return value
      if (typeof value === 'string' && !isNaN(Date.parse(value))) {
        return new Date(value)
      }
      return value
    }
    return JSON.parse(maybeHolds, dateStringToDate)
  }
}

/**
 * Returns coaches with their subject data, from all the coaches
 * currently online who are able to pick up sessions.
 */
export async function getEligibleOnlineCoaches(): Promise<
  VolunteerSessionHoldEligibilityData[]
> {
  // TODO: Cache any of this data with a reasonably short TTL?
  const onlineCoachIds = (await PresenceService.getOnlineUserIds()).volunteers
  if (!onlineCoachIds.length) return []

  const coachData =
    await VolunteerRepo.getSubjectAndReadyToCoachInfoByUserIds(onlineCoachIds)
  const inSessions = await SessionRepo.getVolunteersInSessions()
  const availableCoaches = coachData.filter(
    (coach) =>
      coach.isReadyToCoach &&
      coach.banType !== 'complete' &&
      coach.banType !== 'shadow' &&
      !coach.isDeactivated &&
      !inSessions.includes(coach.userId)
  )

  // Remove coaches who have a current or upcoming hold
  const startTime = new Date().getTime()
  const endTime = moment()
    .add(HOLD_PARAMETERS.MAX_SESSION_HOLD_LENGTH_SECONDS, 'seconds')
    .toDate()
    .getTime()
  const withNoOtherHolds = (
    await filterAsync(availableCoaches, async (coach) => {
      const upcomingHolds = await getCoachHoldsInRange(
        coach.userId,
        startTime,
        endTime
      )
      return upcomingHolds?.length === 0
    })
  ).filtered

  // Remove coaches who do not have the session holds FF on
  const withFlagOn = (
    await filterAsync(withNoOtherHolds, async (coach) =>
      FeatureFlagService.getSessionHoldsCoachFeatureFlag(coach.userId)
    )
  ).filtered
  return withFlagOn
}
