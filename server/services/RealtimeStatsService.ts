import * as PresenceService from './PresenceService'
import * as SessionRepo from '../models/Session'
import * as Cache from '../cache'

export type VolunteerStats = {
  ongoingSessions: number
  studentsOnline: number
}
export async function getVolunteerFacingStats(): Promise<VolunteerStats> {
  const cached = await getCachedVolunteerStats()
  if (cached) {
    return cached
  }

  const fromDb = await getVolunteerStatsFromDb()
  await saveToCache(fromDb)
  return fromDb
}

const CACHE_KEY = 'VOLUNTEER_STATS'
async function getCachedVolunteerStats(): Promise<VolunteerStats | undefined> {
  const cached = await Cache.getIfExists(CACHE_KEY)
  if (cached) {
    return JSON.parse(cached) as VolunteerStats
  }
}

async function saveToCache(stats: VolunteerStats) {
  const ttlSeconds = 30
  await Cache.saveWithExpiration(CACHE_KEY, JSON.stringify(stats), ttlSeconds)
}

async function getVolunteerStatsFromDb(): Promise<VolunteerStats> {
  const [studentsOnline, ongoingSessions] = await Promise.all([
    PresenceService.countOnlineUsers('student'),
    SessionRepo.countOngoingMatchedSessions(),
  ])
  return {
    studentsOnline,
    ongoingSessions,
  }
}
