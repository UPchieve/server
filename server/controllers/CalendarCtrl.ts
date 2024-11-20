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
  VolunteerForScheduleUpdate,
  updateTimezoneByUserId,
} from '../models/Volunteer'
import { runInTransaction, TransactionClient } from '../db'

// TODO: duck type validation
export interface UpdateScheduleOptions {
  ip: string
  user: UserContactInfo
  // @note: this is set to optional to test the absence of an availability object
  availability?: Availability
  tz: string // TODO: constrain this to official timezones
}

export async function updateSchedule(
  options: UpdateScheduleOptions,
  tc?: TransactionClient
): Promise<void> {
  return runInTransaction(async (tc: TransactionClient) => {
    const user = options.user
    const newAvailability = options.availability
    const newTimezone = options.tz
    const ip = options.ip

    const volunteer = await getVolunteerForScheduleUpdate(user.id)
    // an onboarded volunteer must have updated their availability, completed required training, and unlocked a subject
    let onboarded = volunteer.onboarded
    if (
      //move these checks into service method
      !volunteer.onboarded &&
      volunteer.subjects &&
      volunteer.subjects.length > 0 &&
      volunteer.passedRequiredTraining
    ) {
      onboarded = true
      VolunteerService.onboardVolunteer(
        volunteer.id,
        volunteer.volunteerPartnerOrg,
        ip,
        tc
      )
    }

    await executeUpdate(volunteer, newTimezone, newAvailability)
  }, tc)
}

async function executeUpdate(
  user: VolunteerForScheduleUpdate,
  // @note: this is set to optional to test the absence of an availability object
  tz: string, // FIXME: constrain this to official timezones
  availability?: Availability
): Promise<void> {
  // verify that newAvailability is defined and not null
  if (!availability) {
    // early exit
    throw new Error('No availability object specified')
  }

  // verify that all of the day-of-week and time-of-day properties are defined on the
  // new availability object
  if (
    Object.keys(user.availability).some(key => {
      if (typeof availability[key as DAYS] === 'undefined') {
        // day-of-week property needs to be defined
        return true
      }

      // time-of-day properties also need to be defined
      return Object.keys(user.availability[key as DAYS]).some(
        key2 => typeof availability[key as DAYS][key2 as HOURS] === 'undefined'
      )
    })
  ) {
    throw new Error('Availability object missing required keys')
  }

  // TODO: run these with the same client
  await saveCurrentAvailabilityAsHistory(user.id)
  await clearAvailabilityForVolunteer(user.id)
  await Promise.all([
    updateAvailabilityByVolunteerId(user.id, availability, tz),
    updateTimezoneByUserId(user.id, tz),
  ])
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
