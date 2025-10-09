import _ from 'lodash'
import { DAYS, HOURS } from '../constants'
import * as VolunteerService from '../services/VolunteerService'
import {
  clearAvailabilityForVolunteer,
  saveCurrentAvailabilityAsHistory,
  updateAvailabilityByVolunteerId,
  Availability,
} from '../models/Availability'
import { UserContactInfo } from '../models/User'
import {
  getVolunteerForScheduleUpdate,
  updateTimezoneByUserId,
} from '../models/Volunteer'
import { runInTransaction, TransactionClient } from '../db'

// TODO: duck type validation
export interface UpdateScheduleOptions {
  ip: string
  user: UserContactInfo
  // @note: this is set to optional to test the absence of an availability object
  availability?: Availability
  tz: string // TODO: Remove timezones: Use UTC.
  skipAvailabilityOnboardingRequirement: boolean
}

export async function updateSchedule(
  options: UpdateScheduleOptions
): Promise<void> {
  return runInTransaction(async (tc: TransactionClient) => {
    const user = options.user
    const newAvailability = options.availability
    const newTimezone = options.tz
    const ip = options.ip

    if (!newAvailability) {
      throw new Error('No availability object specified.')
    }

    const volunteer = await getVolunteerForScheduleUpdate(user.id, tc)
    if (
      Object.keys(volunteer.availability).some((key) => {
        if (typeof newAvailability[key as DAYS] === 'undefined') {
          // day-of-week property needs to be defined
          return true
        }

        // time-of-day properties also need to be defined
        return Object.keys(volunteer.availability[key as DAYS]).some(
          (key2) =>
            typeof newAvailability[key as DAYS][key2 as HOURS] === 'undefined'
        )
      })
    ) {
      throw new Error('Availability object missing required keys')
    }

    await saveCurrentAvailabilityAsHistory(volunteer.id, tc)
    await clearAvailabilityForVolunteer(volunteer.id, tc)
    await Promise.all([
      updateAvailabilityByVolunteerId(
        volunteer.id,
        newAvailability,
        newTimezone,
        tc
      ),
      updateTimezoneByUserId(volunteer.id, newTimezone, tc),
    ])

    await VolunteerService.onboardVolunteer(
      volunteer.id,
      ip,
      options.skipAvailabilityOnboardingRequirement,
      tc
    )
  })
}

export async function clearSchedule(
  user: UserContactInfo,
  tz: string // TODO: constrain this to official timezones
): Promise<void> {
  // TODO: run these with the same client
  await saveCurrentAvailabilityAsHistory(user.id)
  await clearAvailabilityForVolunteer(user.id)
  await updateTimezoneByUserId(user.id, tz)
}
