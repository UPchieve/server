import { Availability } from '../models/Availability/types'

// @note: expects a lean mongoose availability object
// @todo: handle non-lean mongoose availability object
const countAvailabilitySelected = (availability: Availability): number => {
  let selectedHours = 0
  for (const day in availability) {
    if (Object.prototype.hasOwnProperty.call(availability, day)) {
      const hours = availability[day]
      for (const hour in hours) {
        if (Object.prototype.hasOwnProperty.call(hours, hour)) {
          const isSelected = hours[hour]
          if (isSelected) selectedHours++
        }
      }
    }
  }

  return selectedHours
}

module.exports = countAvailabilitySelected
export default countAvailabilitySelected
