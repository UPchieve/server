import _ from 'lodash'
import VolunteerModel, { Volunteer } from '../models/Volunteer'
import {
  DAYS,
  HOURS,
  AvailabilityDay,
  Availability,
} from '../models/Availability/types'
import { updateSnapshotFullByVolunteerId } from '../models/Availability/queries'
import { captureEvent } from '../services/AnalyticsService'
import { EVENTS } from '../constants'
import {
  queueOnboardingEventEmails,
  queuePartnerOnboardingEventEmails,
} from '../services/VolunteerService'
import { AccountActionCreator } from './UserActionCtrl'

// TODO: duck type validation
export interface UpdateScheduleOptions {
  ip: string
  user: Volunteer
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

  // an onboarded volunteer must have updated their availability, completed required training, and unlocked a subject
  let onboarded = false
  if (!user.isOnboarded && user.subjects.length > 0) {
    onboarded = true
    queueOnboardingEventEmails(user._id)
    if (user.volunteerPartnerOrg) queuePartnerOnboardingEventEmails(user._id)
    await new AccountActionCreator(user._id, ip).accountOnboarded()
    captureEvent(user._id, EVENTS.ACCOUNT_ONBOARDED, {
      event: EVENTS.ACCOUNT_ONBOARDED,
    })
  }

  await executeUpdate(user, newTimezone, newAvailability, onboarded)
}

async function executeUpdate(
  user: Volunteer,
  // @note: this is set to optional to test the absence of an availability object
  tz: string, // FIXME: constrain this to official timezones
  availability?: Availability,
  onboarded?: boolean
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

  const currentDate = new Date()
  const volunteerUpdates: Partial<Volunteer> = {
    // @note: keep "availability", "timezone", "availabilityLastModifiedAt" for a volunteer until new availability schema is migrated
    availabilityLastModifiedAt: currentDate,
    availability: availability,
    timezone: tz,
  }
  if (onboarded) volunteerUpdates.isOnboarded = true

  const availabilityUpdates = {
    onCallAvailability: availability,
    timezone: tz,
    modifiedAt: currentDate,
  }

  await Promise.all([
    updateSnapshotFullByVolunteerId(user._id, availability, tz, currentDate),
    // TODO: repo pattern
    VolunteerModel.updateOne({ _id: user._id }, volunteerUpdates),
  ])
}

export async function clearSchedule(
  user: Volunteer,
  tz: string // FIXME: constrain this to official timezones
): Promise<void> {
  const clearedAvailability = _.reduce(
    user.availability,
    (clearedWeek, dayVal, dayKey) => {
      clearedWeek[dayKey as DAYS] = _.reduce(
        dayVal,
        (clearedDay, hourVal, hourKey) => {
          clearedDay[hourKey as HOURS] = false
          return clearedDay
        },
        {} as AvailabilityDay
      )
      return clearedWeek
    },
    {} as Availability
  )

  await executeUpdate(user, tz, clearedAvailability)
}
