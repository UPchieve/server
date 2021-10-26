import { Types } from 'mongoose'
import { AvailabilityDay } from '../models/Availability/types'
import { getHistoryForDatesByVolunteerId } from '../models/Availability/queries'

export function getElapsedAvailability(day: AvailabilityDay): number {
  let elapsedAvailability = 0
  const availabileTimes = Object.values(day)
  for (const time of availabileTimes) {
    if (time) elapsedAvailability++
  }

  return elapsedAvailability
}

export async function getElapsedAvailabilityForDateRange(
  volunteerId: Types.ObjectId,
  fromDate: Date,
  toDate: Date
): Promise<number> {
  const historyDocs = await getHistoryForDatesByVolunteerId(
    volunteerId,
    fromDate,
    toDate
  )

  let totalElapsedAvailability = 0
  for (const doc of historyDocs) {
    totalElapsedAvailability += getElapsedAvailability(doc.availability)
  }

  return totalElapsedAvailability
}
