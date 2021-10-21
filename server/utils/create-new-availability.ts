import {
  Availability,
  AvailabilityDay,
  DAYS,
  HOURS,
} from '../models/Availability/types'

function createNewAvailability(): Availability {
  const availability: any = {}

  for (const day in DAYS) {
    const currentDay: any = {}
    for (const hour in HOURS) {
      currentDay[hour] = false
    }
    availability[day] = currentDay as AvailabilityDay
  }

  return availability as Availability
}

export default createNewAvailability
