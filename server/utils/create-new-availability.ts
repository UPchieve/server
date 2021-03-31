import { Availability, DAYS, HOURS } from '../models/Availability/types'

function createNewAvailability(): Availability {
  const availability = {}

  for (const day in DAYS) {
    const currentDay = {}
    for (const hour in HOURS) {
      currentDay[HOURS[hour]] = false
    }
    availability[DAYS[day]] = currentDay
  }

  return availability as Availability
}

export default createNewAvailability
