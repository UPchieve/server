import {
  Availability,
  AvailabilityDay,
  DAYS,
  HOURS,
  enumKeys,
} from '../models/Availability/types'

function createNewAvailability(): Availability {
  const availability: any = {}

  for (const day of enumKeys(DAYS)) {
    const currentDay: any = {}
    for (const hour of enumKeys(HOURS)) {
      const hourLabel = HOURS[hour as keyof typeof HOURS]
      currentDay[hourLabel] = false
    }
    const dayLabel = DAYS[day as keyof typeof DAYS]
    availability[dayLabel] = currentDay as AvailabilityDay
  }

  return availability as Availability
}

export default createNewAvailability
