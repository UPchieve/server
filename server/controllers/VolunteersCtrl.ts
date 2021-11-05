import VolunteerModel from '../models/Volunteer'
import { DAYS, HOURS, Availability } from '../models/Availability/types'
import { getSnapshotsByVolunteerIds } from '../models/Availability/queries'

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
  const certifiedSubjectQuery = `certifications.${certifiedSubject}.passed`

  const volunteerQuery = {
    [certifiedSubjectQuery]: true,
    isFakeUser: false,
    isTestUser: false,
    isFailsafeVolunteer: false,
    isOnboarded: true,
    isDeactivated: false,
    isBanned: false,
  }

  // TODO: repo pattern
  // the projection returns { _id: 1, type: 1}
  const volunteers = await VolunteerModel.find(volunteerQuery)
    .select({ _id: 1 })
    .lean()
    .exec()
  const volunteerIds = volunteers.map(vol => vol._id)
  const availabilityDocs = await getSnapshotsByVolunteerIds(volunteerIds)

  let aggAvailabilities: AvailabilityAggregation = {
    table: Array(7)
      .fill(0)
      .map(() => Array(24).fill(0)),
  }
  aggAvailabilities.min = undefined
  aggAvailabilities.max = 0

  aggAvailabilities = availabilityDocs.reduce((aggAvailabilities, doc) => {
    return aggregateAvailabilities(doc.onCallAvailability, aggAvailabilities)
  }, aggAvailabilities)
  aggAvailabilities = findMinAndMax(aggAvailabilities)
  return aggAvailabilities
}
