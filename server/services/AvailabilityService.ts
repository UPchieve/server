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
  const availabileTimes = Object.values(day)
  for (const time of availabileTimes) {
    if (time) elapsedAvailability++
  }
  return elapsedAvailability
}

export async function getElapsedAvailabilityForTelecomReport(
  volunteerId: Ulid,
  fromDate: Date,
  toDate: Date
): Promise<AvailabilityHistory[]> {
  const historyDocs = await getAvailabilityHistoryForDatesByVolunteerId(
    volunteerId,
    fromDate,
    toDate
  )
  const legacyDocs = await getLegacyAvailabilityHistoryForDatesByVolunteerId(
    volunteerId,
    fromDate,
    toDate
  )

  return historyDocs.concat(legacyDocs)
}

export async function getTotalElapsedAvailabilityForDateRange(
  volunteerId: Ulid,
  fromDate: Date,
  toDate: Date
): Promise<number> {
  const historyDocs = await getAvailabilityHistoryForDatesByVolunteerId(
    volunteerId,
    fromDate,
    toDate
  )
  const legacyDocs = await getLegacyAvailabilityHistoryForDatesByVolunteerId(
    volunteerId,
    fromDate,
    toDate
  )

  let totalElapsedAvailability = 0
  for (const doc of historyDocs.concat(legacyDocs)) {
    const dayOfWeek = getAvailabilityDay(moment(doc.recordedAt).day())
    totalElapsedAvailability += getElapsedAvailabilityForDay(
      doc.availability[dayOfWeek]
    )
  }

  return totalElapsedAvailability
}
