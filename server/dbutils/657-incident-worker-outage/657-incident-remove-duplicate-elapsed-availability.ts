import mongoose from 'mongoose'
import * as db from '../../db'
import VolunteerModel from '../../models/Volunteer'
import logger from '../../logger'
import { getElapsedAvailability } from '../../services/AvailabilityService'
import AvailabilityHistoryModel from '../../models/Availability/History'

/**
 *
 * Incident Range (UTC):
 * 2021-04-10T13:30:00.000+00:00
 * 2021-04-14T03:44:00.000+00:00
 *
 * Duplicate availability history snapshots stored:
 * 2021-04-13T23:59:59.999+00:00
 * 2021-04-13T23:59:59.999+00:00
 *
 * Notes:
 * UpdateElapsedAvailability is a daily cron job processed at 08:00 (UTC)
 *
 * 04/14 at 03:44:00 UTC is when the worker queue started working
 * again and UpdatedElapsedAvailability was fired off and created new
 * availability history snapshots only for 04/13.
 *
 * A few hours later, the cron job was executed again.
 * Because UpdateElapsedAvailability was ran twice in one day, there
 * are currenly duplicate history snapshot entries for 04/13 and
 * the elapsed availability for that day was added to a volunteer's
 * total elapsed availability twice
 *
 * Steps:
 * 1. Per duplicate availability history snapshot for date 04/13 remove
 *    the amount of elapsed availability from the volunteer
 * 2. Remove the duplicate availability history snapshot for date 04/13
 *
 */
const main = async (): Promise<void> => {
  try {
    await db.connect()

    const availabilityHistoryDocs = await AvailabilityHistoryModel.find({
      date: new Date('2021-04-13T23:59:59.999+00:00'),
      createdAt: { $lt: new Date('2021-04-14T06:00:00.000+00:00') }
    })
      .lean()
      .exec()

    for (const doc of availabilityHistoryDocs) {
      // elapsedAvailabilityToRemove will be a negative number
      const elapsedAvailabilityToRemove =
        Math.abs(getElapsedAvailability(doc.availability)) * -1
      await VolunteerModel.updateOne(
        { _id: doc.volunteerId },
        { $inc: { elapsedAvailability: elapsedAvailabilityToRemove } }
      )
    }

    await AvailabilityHistoryModel.deleteMany({
      date: new Date('2021-04-13T23:59:59.999+00:00'),
      // delete the docs that were created before the cron job ran again
      // on the same date at 2021-04-14T06:00:00.000+00:00
      createdAt: { $lt: new Date('2021-04-14T06:00:00.000+00:00') }
    })
  } catch (error) {
    logger.error(error)
  }
  // Only disconnect after uploading has finished
  logger.info('Disconnecting')
  mongoose.disconnect()
}

main()
