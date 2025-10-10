import * as CacheService from '../../cache'
import * as VolunteerService from '../../services/VolunteerService'
import { TextableVolunteer } from '../../models/Volunteer'
import logger from '../../logger'

const CACHE_KEY = 'VOLUNTEERS-FOR-TEXT-NOTIFICATIONS'
const LOG_PREFIX = 'Caching textable volunteers: '
export default async (): Promise<void> => {
  const textableVolunteers: TextableVolunteer[] =
    await VolunteerService.getVolunteersForTextNotifications()
  logger.info(
    `${LOG_PREFIX}Found ${textableVolunteers.length} candidate volunteers.`
  )

  await saveToCache(textableVolunteers)
  logger.info(`${LOG_PREFIX}Saved volunteers to cache.`)
}

async function saveToCache(volunteers: TextableVolunteer[]) {
  await CacheService.save(CACHE_KEY, JSON.stringify(volunteers))
}
