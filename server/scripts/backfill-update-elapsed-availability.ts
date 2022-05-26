import { Jobs } from '../worker/jobs'
import { Job } from 'bull'
import { asString } from '../utils/type-utils'
import { log } from '../worker/logger'
import { DAYS } from '../constants'
import { getElapsedAvailabilityForDay } from '../services/AvailabilityService'
import {
  getAvailabilityForVolunteerByDate,
  saveAvailabilityAsHistoryByDate,
} from '../models/Availability'
import {
  getVolunteerIdsForElapsedAvailability,
  updateVolunteerElapsedAvailabilityById,
} from '../models/Volunteer/queries'
import moment from 'moment'
import 'moment-timezone'
import countAvailabilitySelected from '../utils/count-availability-selected'

type BackfillUpdateElapsedAvailabilityData = {
  // example: '2022-05-08 04:00:00.000000+00'
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
    const availability = await getAvailabilityForVolunteerByDate(
      volunteerId,
      outageDate
    )
    if (!availability || countAvailabilitySelected(availability) === 0) continue

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
      await saveAvailabilityAsHistoryByDate(volunteerId, outageDate)
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
