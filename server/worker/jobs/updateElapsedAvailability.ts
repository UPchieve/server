import moment from 'moment'
import 'moment-timezone'
import {
  getVolunteerIdsForElapsedAvailability,
  updateVolunteerElapsedAvailabilityById,
} from '../../models/Volunteer/queries'
import { log } from '../logger'
import { DAYS } from '../../constants'
import { getElapsedAvailabilityForDay } from '../../services/AvailabilityService'
import {
  getAvailabilityForVolunteer,
  saveCurrentAvailabilityAsHistory,
} from '../../models/Availability'
import { Jobs } from '.'
import countAvailabilitySelected from '../../utils/count-availability-selected'

export default async (): Promise<void> => {
  const volunteerIds = await getVolunteerIdsForElapsedAvailability()

  let totalUpdated = 0
  const errors: string[] = []

  for (const volunteerId of volunteerIds) {
    const availability = await getAvailabilityForVolunteer(volunteerId)
    if (!availability || countAvailabilitySelected(availability) === 0) continue

    const yesterday = moment()
      .utc()
      .subtract(1, 'days')
      .format('dddd')
    const availabilityDay = availability[yesterday as DAYS]
    const elapsedAvailability = getElapsedAvailabilityForDay(availabilityDay)

    try {
      await updateVolunteerElapsedAvailabilityById(
        volunteerId,
        elapsedAvailability
      )
    } catch (error) {
      errors.push(
        `Volunteer ${volunteerId} failed to update elapsed availability: ${error}`
      )
      continue
    }

    try {
      await saveCurrentAvailabilityAsHistory(volunteerId)
    } catch (error) {
      errors.push(
        `Volunteer ${volunteerId} updated availability but failed to create availability history: ${error}`
      )
      continue
    }
    totalUpdated += 1
  }
  log(
    `Successfully ${Jobs.UpdateElapsedAvailability} for ${totalUpdated} volunteers`
  )
  if (errors.length) {
    throw new Error(
      `Failed to ${Jobs.UpdateElapsedAvailability} for volunteers ${errors}`
    )
  }
}
