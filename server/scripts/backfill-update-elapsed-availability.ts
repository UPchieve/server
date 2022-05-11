import { Jobs } from '../worker/jobs'
import { Job } from 'bull'
import { asString } from '../utils/type-utils'
import { log } from '../worker/logger'
import { DAYS } from '../constants'
import { getElapsedAvailabilityForDay } from '../services/AvailabilityService'
import {
  getAvailabilityForVolunteer,
  saveCurrentAvailabilityAsHistoryBackfill,
} from '../models/Availability'
import {
  getVolunteerIdsForElapsedAvailability,
  updateVolunteerElapsedAvailabilityById,
} from '../models/Volunteer/queries'
import moment from 'moment'
import 'moment-timezone'

type BackfillUpdateElapsedAvailabilityData = {
  // example: '2022-05-08 04:00:00.000+00'
  outageDate: string
}

export default async function backfillUpdateElapsedAvailability(
  job: Job<BackfillUpdateElapsedAvailabilityData>
): Promise<void> {
  const outageDate = new Date(asString(job.data.outageDate))
  const volunteerIds = await getVolunteerIdsForElapsedAvailability()

  let totalUpdated = 0
  const errors: string[] = []

  for (const volunteerId of volunteerIds) {
    const availability = await getAvailabilityForVolunteer(volunteerId)
    if (!availability) return

    const dayBeforeOutage = moment(outageDate)
      .utc()
      .subtract(1, 'days')
      .format('dddd')
    const availabilityDay = availability[dayBeforeOutage as DAYS]
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
      await saveCurrentAvailabilityAsHistoryBackfill(volunteerId, outageDate)
    } catch (error) {
      errors.push(
        `Volunteer ${volunteerId} updated availability but failed to create availability history: ${error}`
      )
      continue
    }
    totalUpdated += 1
  }
  log(
    `Successfully ${Jobs.BackfillUpdateElapsedAvailability} for ${totalUpdated} volunteers`
  )
  if (errors.length) {
    throw new Error(
      `Failed to ${Jobs.BackfillUpdateElapsedAvailability} for volunteers ${errors}`
    )
  }
}
