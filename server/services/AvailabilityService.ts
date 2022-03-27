import { Ulid } from '../models/pgUtils'
import { AvailabilityDay, getAvailabilityHistoryForDatesByVolunteerId } from '../models/Availability'

export function getElapsedAvailabilityForDay(day: AvailabilityDay): number {
  let elapsedAvailability = 0
  const availabileTimes = Object.values(day)
  for (const time of availabileTimes) {
    if (time) elapsedAvailability++
  }
  return elapsedAvailability
}

export async function getElapsedAvailabilityForDateRange(
  volunteerId: Ulid,
  fromDate: Date,
  toDate: Date
): Promise<number> {
  const historyDocs = await getAvailabilityHistoryForDatesByVolunteerId(
    volunteerId,
    fromDate,
    toDate
  )

  let totalElapsedAvailability = 0
  for (const doc of historyDocs) {
    for (const [day, avail] of Object.entries(doc.availability))
      totalElapsedAvailability += getElapsedAvailabilityForDay(avail)
  }

  return totalElapsedAvailability
}
