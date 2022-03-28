import {
  Availability,
  AvailabilityDay,
  DAYS,
  HOURS,
} from '../models/Availability'

function createNewAvailability(): Availability {
  const availability: any = {}

  for (const day of DAYS) {
    const currentDay: any = {}
    for (const hour of HOURS) {
      currentDay[hour] = false
    }
    availability[day] = currentDay as AvailabilityDay
  }

  return availability as Availability
}

export default createNewAvailability
