import * as VolunteerRepo from '../models/Volunteer'
import { DAYS, HOURS } from '../constants'
import {
  Availability,
  getAvailabilityForVolunteerHeatmap,
} from '../models/Availability'

// TODO: refactor this to be more functional (testable)
interface AvailabilityAggregation {
  daysOfWeek?: DAYS[]
  timesOfDay?: HOURS[]
  table: any[][]
  min?: number
  max?: number
}

/**
 * Helper function that, given a single users's
 * availability, adds when they are free to the
 * aggAvailabilities object
 * @param {*} availability
 */
function aggregateAvailabilities(
  availability: Availability,
  aggAvailabilities: AvailabilityAggregation
): AvailabilityAggregation {
  Object.keys(availability).map(day => {
    Object.keys(availability[day as DAYS]).map(time => {
      // create headers based on the user's availability object
      if (!aggAvailabilities.daysOfWeek) {
        aggAvailabilities.daysOfWeek = Object.keys(availability) as DAYS[]
      }
      if (!aggAvailabilities.timesOfDay) {
        aggAvailabilities.timesOfDay = Object.keys(
          availability[day as DAYS]
        ) as HOURS[]
      }
      // gets corresponding day and time index inorder to store in aggAvailabilities table
      let dayIndex = aggAvailabilities.daysOfWeek.indexOf(day as DAYS)
      let timeIndex = aggAvailabilities.timesOfDay.indexOf(time as HOURS)

      if (availability[day as DAYS][time as HOURS]) {
        aggAvailabilities.table[dayIndex][timeIndex]++
      }
    })
  })
  return aggAvailabilities
}

/**
 * Helper function that finds the minimum and maxmimum number of
 * volunteers who signed up that week
 * @param {*} aggAvailabilities
 */
function findMinAndMax(
  aggAvailabilities: AvailabilityAggregation
): AvailabilityAggregation {
  let flatTable = aggAvailabilities.table.flat()
  aggAvailabilities.min = Math.min.apply(Math, flatTable)
  aggAvailabilities.max = Math.max.apply(Math, flatTable)
  return aggAvailabilities
}

/**
 * Gets all users who are volunteers, and who are certified in the
 * subject passed in, and aggregates their availability tables into
 * aggAvailabilities.table
 * @param {*} certifiedSubject
 */
export async function getVolunteersAvailability(
  certifiedSubject: string
): Promise<AvailabilityAggregation> {
  const availabilities = await getAvailabilityForVolunteerHeatmap(
    certifiedSubject
  )
  const check = availabilities.find(v => v.availability.Sunday['12a'] === true)

  let aggAvailabilities: AvailabilityAggregation = {
    table: Array(7)
      .fill(0)
      .map(() => Array(24).fill(0)),
  }
  aggAvailabilities.min = undefined
  aggAvailabilities.max = 0

  aggAvailabilities = availabilities.reduce((aggAvailabilities, doc) => {
    return aggregateAvailabilities(doc.availability, aggAvailabilities)
  }, aggAvailabilities)
  aggAvailabilities = findMinAndMax(aggAvailabilities)
  return aggAvailabilities
}
