import moment from 'moment-timezone'
import VolunteerModel from '../../models/Volunteer'
import { log } from '../logger'
import { AvailabilitySnapshot } from '../../models/Availability/Snapshot'
import {
  createAvailabilityHistory,
  getAvailability,
  getElapsedAvailability
} from '../../services/AvailabilityService'
import { Jobs } from '.'

export default async (): Promise<void> => {
  const volunteers = await VolunteerModel.find({
    isOnboarded: true,
    isApproved: true
  })
    .select({ _id: 1 })
    .lean()
    .exec()

  let totalUpdated = 0
  const errors = []

  for (const volunteer of volunteers) {
    const availability: AvailabilitySnapshot = await getAvailability({
      volunteerId: volunteer._id
    })
    if (!availability) return

    const endOfYesterday = moment()
      .utc()
      .subtract(1, 'days')
      .endOf('day')
      .toDate()
    const yesterday = moment()
      .utc()
      .subtract(1, 'days')
      .format('dddd')
    const availabilityDay = availability.onCallAvailability[yesterday]
    const elapsedAvailability = getElapsedAvailability(availabilityDay)

    try {
      await VolunteerModel.updateOne(
        {
          _id: volunteer._id
        },
        { $inc: { elapsedAvailability } }
      )
    } catch (error) {
      errors.push(
        `Volunteer ${volunteer._id} failed to update elapsed availability: ${error}`
      )
      continue
    }

    const newAvailabilityHistory = {
      availability: availabilityDay,
      volunteerId: volunteer._id,
      timezone: availability.timezone,
      date: endOfYesterday
    }
    try {
      await createAvailabilityHistory(newAvailabilityHistory)
    } catch (error) {
      errors.push(
        `Volunteer ${volunteer._id} updated availability but failed to create availability history: ${error}`
      )
      continue
    }
    totalUpdated += 1
  }
  log(
    `Successfully ${Jobs.UpdateElapsedAvailability} for ${totalUpdated} volunteers`
  )
  if (errors.length) {
    throw new Error(
      `Failed to ${Jobs.UpdateElapsedAvailability} for volunteers ${errors}`
    )
  }
}
