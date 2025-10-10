import * as CacheService from '../../cache'
import * as VolunteerService from '../../services/VolunteerService'
import { TextableVolunteer } from '../../models/Volunteer'
import logger from '../../logger'

export const TEXTABLE_VOLUNTEERS_CACHE_KEY = 'VOLUNTEERS-FOR-TEXT-NOTIFICATIONS'
const LOG_PREFIX = 'Caching textable volunteers: '
export default async (): Promise<void> => {
  await getAndCacheAvailableVolunteers()
}

export async function getAndCacheAvailableVolunteers(): Promise<
  TextableVolunteer[]
> {
  const textableVolunteers: TextableVolunteer[] =
    await VolunteerService.getVolunteersForTextNotifications()
  logger.info(
    `${LOG_PREFIX}Found ${textableVolunteers.length} candidate volunteers.`
  )

  await saveToCache(textableVolunteers)
  logger.info(
    `${LOG_PREFIX}Saved ${textableVolunteers.length} volunteers to cache.`
  )
  return textableVolunteers
}

async function saveToCache(volunteers: TextableVolunteer[]) {
  await CacheService.save(
    TEXTABLE_VOLUNTEERS_CACHE_KEY,
    JSON.stringify(volunteers)
  )
}
