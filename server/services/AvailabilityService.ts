import _ from 'lodash'
import moment from 'moment'
import {
  AvailabilityDay,
  AvailabilityHistory,
  getAvailabilityDay,
  getAvailabilityHistoryForDatesByVolunteerId,
  getLegacyAvailabilityHistoryForDatesByVolunteerId,
} from '../models/Availability'
import { Ulid } from '../models/pgUtils'

export function getElapsedAvailabilityForDay(day: AvailabilityDay): number {
  let elapsedAvailability = 0
  const availableTimes = Object.values(day)
  for (const time of availableTimes) {
    if (time) elapsedAvailability++
  }
  return elapsedAvailability
}

export async function getElapsedAvailabilityForTelecomReport(
  volunteerId: Ulid,
  fromDate: Date,
  toDate: Date
): Promise<AvailabilityHistory[]> {
  const startShifted = moment(fromDate)
    .utc()
    .add(1, 'day')
    .startOf('day')
    .toDate()
  const endShifted = moment(toDate).utc().add(1, 'day').endOf('day').toDate()
  const historyDocs = await getAvailabilityHistoryForDatesByVolunteerId(
    volunteerId,
    startShifted,
    endShifted
  )
  const legacyDocs = await getLegacyAvailabilityHistoryForDatesByVolunteerId(
    volunteerId,
    startShifted,
    endShifted
  )

  return historyDocs.concat(legacyDocs)
}

/**
 *
 *
 * Why the +1 day shift on `fromDate` and `toDate`:
 *
 * Our daily cron job, updateElapsedAvailability, writes a snapshot with `recorded_at` = "today"
 * that represents yesterday's availability. For a Monday to Sunday date range that means:
 *   - Tuesday's earliest snapshot is Monday's availability
 *   - Wednesday's earliest snapshot is Tuesday's availability
 *   - ...
 *   - The Monday after the range holds Sunday’s availability
 *
 * Easiest way to line that up:
 *   1. query snapshots in [fromDate + 1 day .. toDate + 1 day]
 *   2. for each UTC day, take the earliest snapshot and credit it to the previous weekday
 *
 * That keeps this weekly calculation consistent with what the daily cron job does
 * and makes sure Sunday is included. Without the +1 shift, a Monday through Sunday input
 * would actually capture Sunday through Saturday
 *
 * TODO: Make this calculation simpler. A couple of options to consider:
 * - Add a small rollup table where we write daily elapsed availability hours earned and for which date
 * - Add a calculated_for date column to the availabilities_histories table
 *
 * That way we can just sum weekly totals without worrying about day shifts
 *
 *
 */
export async function getTotalElapsedAvailabilityForDateRange(
  volunteerId: Ulid,
  fromDate: Date,
  toDate: Date
): Promise<number> {
  const startShifted = moment(fromDate)
    .utc()
    .add(1, 'day')
    .startOf('day')
    .toDate()
  const endShifted = moment(toDate).utc().add(1, 'day').endOf('day').toDate()

  const historyDocs = await getAvailabilityHistoryForDatesByVolunteerId(
    volunteerId,
    startShifted,
    endShifted
  )
  const legacyDocs = await getLegacyAvailabilityHistoryForDatesByVolunteerId(
    volunteerId,
    startShifted,
    endShifted
  )

  const allDocs = historyDocs.concat(legacyDocs)
  const bySnapshotDate = _.groupBy(allDocs, (doc) =>
    moment(doc.recordedAt).utc().startOf('day').format('YYYY-MM-DD')
  )
  let totalElapsedAvailability = 0

  for (const date in bySnapshotDate) {
    // earliest snapshot of that day
    const doc = bySnapshotDate[date].sort((a, b) =>
      a.recordedAt > b.recordedAt ? 1 : -1
    )[0]
    const prevDayOfWeek = getAvailabilityDay(
      moment(doc.recordedAt).utc().subtract(1, 'day').day()
    )
    totalElapsedAvailability += getElapsedAvailabilityForDay(
      doc.availability[prevDayOfWeek]
    )
  }

  return totalElapsedAvailability
}
