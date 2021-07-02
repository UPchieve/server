import mongoose from 'mongoose'
import * as db from '../../db'
import VolunteerModel from '../../models/Volunteer'
import * as VolunteerService from '../../services/VolunteerService'
import logger from '../../logger'

/**
 *
 * Incident Range (UTC):
 * 2021-04-10T13:30:00.000+00:00
 * 2021-04-14T17:25:00.000+00:00
 *
 *
 * Notes:
 * Get all volunteer account who are not onboarded and
 * created within the incident range and queue their
 * onboarding reminder emails
 *
 */
const main = async (): Promise<void> => {
  try {
    await db.connect()

    const volunteers: any = await VolunteerModel.aggregate([
      {
        $match: {
          isDeactivated: false,
          isOnboarded: false,
          createdAt: {
            $gte: new Date('2021-04-10T13:30:00.000+00:00'),
            $lt: new Date('2021-04-14T17:25:00.000+00:00')
          }
        }
      },
      {
        $project: {
          _id: 1
        }
      }
    ])

    for (const volunteer of volunteers) {
      VolunteerService.queueOnboardingReminderOneEmail(volunteer._id)
    }
  } catch (error) {
    logger.error(error)
  }
  logger.info('Disconnecting')
  mongoose.disconnect()
}

main()
