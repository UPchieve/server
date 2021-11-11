import mongoose from 'mongoose'
import * as db from '../../db'
import { AvailabilitySnapshot } from '../../models/Availability/Snapshot'
import VolunteerModel from '../../models/Volunteer'
import { USER_ACTION } from '../../constants'
import moment from 'moment'
import 'moment-timezone'
import {
  createAvailabilityHistory,
  getAvailability,
  getElapsedAvailability
} from '../../services/AvailabilityService'
import logger from '../../logger'

/**
 *
 * Incident Range (UTC):
 * 2021-04-10T13:30:00.000+00:00
 * 2021-04-14T03:44:00.000+00:00
 *
 * Availability history snapshot dates not stored in the database:
 * 2021-04-10T23:59:59.999+00:00
 * 2021-04-11T23:59:59.999+00:00
 * 2021-04-12T23:59:59.999+00:00
 *
 * Notes:
 * UpdateElapsedAvailability is a daily cron job processed at 08:00 (UTC)
 *
 * 04/14 at 03:44:00 UTC is when the worker queue started working
 * again and UpdatedElapsedAvailability was fired off and created new
 * availability history snapshots only for 04/13.
 *
 *
 * Steps:
 * 1. Get all volunteers who are onboarded and approved (ready to coach)
 * 2: If the volunteer was ready to coach inbetween the incident range:
 *      - Only add history snapshots from the date they became ready to coach
 * 3. Create new history snapshots for 4/10, 4/11, and 4/12
 * 4. Increment the volunteer's total elapsed availability by the amount
 *    elapsed availability passed for that day
 *
 */

const startOfMissingHistorySnapshots = new Date('2021-04-10T00:00:00.000+00:00')
const endOfMissingHistorySnapshots = new Date('2021-04-13T00:00:00.000+00:00')

const main = async (): Promise<void> => {
  try {
    await db.connect()

    const volunteers: any = await VolunteerModel.aggregate([
      {
        $match: {
          isOnboarded: true,
          isApproved: true
        }
      },
      {
        $lookup: {
          from: 'useractions',
          let: { userId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$user', '$$userId']
                }
              }
            },
            {
              $sort: {
                createdAt: -1
              }
            }
          ],
          as: 'userActions'
        }
      },
      {
        $addFields: {
          actions: {
            $filter: {
              input: '$userActions',
              as: 'userAction',
              cond: {
                $or: [
                  {
                    $eq: ['$$userAction.action', USER_ACTION.ACCOUNT.APPROVED]
                  },
                  {
                    $eq: ['$$userAction.action', USER_ACTION.ACCOUNT.ONBOARDED]
                  }
                ]
              }
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          readyToCoachDate: { $arrayElemAt: ['$actions.createdAt', 0] }
        }
      }
    ])


    for (const volunteer of volunteers) {
      const availability: AvailabilitySnapshot = await getAvailability({
        volunteerId: volunteer._id
      })
      if (!availability) continue

      // There are legacy volunteers who are onboarded and approved (ready to coach), but
      // pre-date us tracking when they got onboarded and approved
      const legacyReadyToCoachDate = new Date('2020-01-01T00:00:00.000+00:00')
      if (!volunteer.readyToCoachDate)
        volunteer.readyToCoachDate = legacyReadyToCoachDate

      const readyToCoachDate = new Date(
        moment(volunteer.readyToCoachDate)
          .utc()
          .startOf('day')
      ).getTime()

      let currentDate = startOfMissingHistorySnapshots.getTime()
      while (currentDate < endOfMissingHistorySnapshots.getTime()) {
        if (readyToCoachDate <= currentDate) {
          const endOfDate = moment(currentDate)
            .utc()
            .endOf('day')
          const day = moment(currentDate)
            .utc()
            .format('dddd')
          const availabilityDay = availability.onCallAvailability[day]
          const elapsedAvailability = getElapsedAvailability(availabilityDay)

          await VolunteerModel.updateOne(
            {
              _id: volunteer._id
            },
            { $inc: { elapsedAvailability } }
          )

          const newAvailabilityHistory = {
            availability: availabilityDay,
            volunteerId: volunteer._id,
            timezone: availability.timezone,
            date: endOfDate
          }
          await createAvailabilityHistory(newAvailabilityHistory)
        }
        currentDate = new Date(moment(currentDate).add(1, 'days')).getTime()
      }
    }
  } catch (error) {
    logger.error(error)
  }
  logger.info('Disconnecting')
  mongoose.disconnect()
}

main()
