import * as CacheService from '../../cache'
import * as VolunteerService from '../../services/VolunteerService'
import { TextableVolunteer } from '../../models/Volunteer'
import logger from '../../logger'
import { omit } from 'lodash'

const CACHE_KEY = 'VOLUNTEERS-FOR-TEXT-NOTIFICATIONS'
const LOG_PREFIX = 'Caching textable volunteers: '
export default async (): Promise<void> => {
  const textableVolunteers: TextableVolunteer[] =
    await VolunteerService.getVolunteersForTextNotifications()
  logger.info(
    `${LOG_PREFIX}Found ${textableVolunteers.length} candidate volunteers.`
  )

  const volunteersWithoutMutedSubjects: Omit<
    TextableVolunteer,
    'mutedSubjects'
  >[] = removeMutedSubjects(textableVolunteers)

  await saveToCache(volunteersWithoutMutedSubjects)
  logger.info(`${LOG_PREFIX}Saved volunteers to cache.`)
}

async function saveToCache(
  volunteers: Omit<TextableVolunteer, 'mutedSubjects'>[]
) {
  await CacheService.save(CACHE_KEY, JSON.stringify(volunteers))
}

function removeMutedSubjects(
  volunteers: TextableVolunteer[]
): Omit<TextableVolunteer, 'mutedSubjects'>[] {
  return volunteers.map((volunteer) => {
    const mutedSubjects = volunteer.mutedSubjects
    const updatedVolunteer = omit(volunteer, ['mutedSubjects']) as Omit<
      TextableVolunteer,
      'mutedSubjects'
    >
    updatedVolunteer.unlockedSubjects =
      updatedVolunteer.unlockedSubjects.filter(
        (subject) => !mutedSubjects.includes(subject)
      )
    return updatedVolunteer
  })
}
