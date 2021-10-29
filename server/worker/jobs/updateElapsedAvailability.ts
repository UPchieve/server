import moment from 'moment'
import 'moment-timezone'
import {
  getVolunteerIdsForElapsedAvailability,
  updateVolunteerElapsedAvailabilityById,
} from '../../models/Volunteer/queries'
import { log } from '../logger'
import { DAYS } from '../../models/Availability/types'
import { getElapsedAvailability } from '../../services/AvailabilityService'
import {
  getSnapshotByVolunteerId,
  createHistoryFromBaseHistory,
} from '../../models/Availability/queries'
import { Jobs } from '.'

export default async (): Promise<void> => {
  const volunteerIds = await getVolunteerIdsForElapsedAvailability()

  let totalUpdated = 0
  const errors: string[] = []

  for (const volunteerId of volunteerIds) {
    const availability = await getSnapshotByVolunteerId(volunteerId)
    if (!availability) return

    const endOfYesterday = moment()
      .utc()
      .subtract(1, 'days')
      .endOf('day')
      .toDate()
    const yesterday = moment()
      .utc()
      .subtract(1, 'days')
      .format('dddd')
    const availabilityDay = availability.onCallAvailability[yesterday as DAYS]
    const elapsedAvailability = getElapsedAvailability(availabilityDay)

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

    const newAvailabilityHistory = {
      availability: availabilityDay,
      volunteerId,
      timezone: availability.timezone,
      date: endOfYesterday,
    }
    try {
      await createHistoryFromBaseHistory(newAvailabilityHistory)
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
