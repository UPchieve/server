import _ from 'lodash'
import { ACCOUNT_USER_ACTIONS, EVENTS, DAYS, HOURS } from '../constants'

import { captureEvent } from '../services/AnalyticsService'
import {
  queueOnboardingEventEmails,
  queuePartnerOnboardingEventEmails,
} from '../services/VolunteerService'
import {
  clearAvailabilityForVolunteer,
  saveCurrentAvailabilityAsHistory,
  updateAvailabilityByVolunteerId,
  Availability,
} from '../models/Availability'
import { createAccountAction } from '../models/UserAction'
import { UserContactInfo } from '../models/User'
import {
  getVolunteerForScheduleUpdate,
  VolunteerForScheduleUpdate,
  updateVolunteerThroughAvailability,
} from '../models/Volunteer'

// TODO: duck type validation
export interface UpdateScheduleOptions {
  ip: string
  user: UserContactInfo
  // @note: this is set to optional to test the absence of an availability object
  availability?: Availability
  tz: string // TODO: constrain this to official timezones
}

export async function updateSchedule(
  options: UpdateScheduleOptions
): Promise<void> {
  const user = options.user
  const newAvailability = options.availability
  const newTimezone = options.tz
  const ip = options.ip

  const volunteer = await getVolunteerForScheduleUpdate(user.id)
  // an onboarded volunteer must have updated their availability, completed required training, and unlocked a subject
  let onboarded = volunteer.onboarded
  if (
    !volunteer.onboarded &&
    volunteer.subjects &&
    volunteer.subjects.length > 0 &&
    volunteer.passedRequiredTraining
  ) {
    onboarded = true
    await queueOnboardingEventEmails(volunteer.id)
    if (volunteer.volunteerPartnerOrg)
      await queuePartnerOnboardingEventEmails(volunteer.id)
    await createAccountAction({
      userId: volunteer.id,
      action: ACCOUNT_USER_ACTIONS.ONBOARDED,
      ipAddress: ip,
    })
    captureEvent(volunteer.id, EVENTS.ACCOUNT_ONBOARDED, {
      event: EVENTS.ACCOUNT_ONBOARDED,
    })
  }

  await executeUpdate(volunteer, newTimezone, onboarded, newAvailability)
}

async function executeUpdate(
  user: VolunteerForScheduleUpdate,
  // @note: this is set to optional to test the absence of an availability object
  tz: string, // FIXME: constrain this to official timezones
  onboarded: boolean,
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
    updateVolunteerThroughAvailability(user.id, tz, onboarded),
  ])
}

export async function clearSchedule(
  user: UserContactInfo,
  tz: string // TODO: constrain this to official timezones
): Promise<void> {
  // TODO: run these with the same client
  await saveCurrentAvailabilityAsHistory(user.id)
  await clearAvailabilityForVolunteer(user.id)
  await updateVolunteerThroughAvailability(user.id, tz)
}
