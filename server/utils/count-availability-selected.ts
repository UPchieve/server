import { Availability } from '../models/Availability'
import { DAYS, HOURS } from '../constants'

const countAvailabilitySelected = (availability: Availability): number => {
  let selectedHours = 0
  for (const day in availability) {
    if (Object.prototype.hasOwnProperty.call(availability, day)) {
      const hours = availability[day as DAYS]
      for (const hour in hours) {
        if (Object.prototype.hasOwnProperty.call(hours, hour)) {
          const isSelected = hours[hour as HOURS]
          if (isSelected) selectedHours++
        }
      }
    }
  }

  return selectedHours
}

export default countAvailabilitySelected
