import mongoose from 'mongoose'
import dbconnect from '../dbconnect'
import VolunteerModel from '../../models/Volunteer'
import * as VolunteerService from '../../services/VolunteerService'
import { USER_ACTION } from '../../constants'
import logger from '../../logger'

/**
 *
 * Incident Range (UTC):
 * 2021-04-10T13:30:00.000+00:00
 * 2021-04-14T17:25:00.000+00:00
 *
 * Notes:
 * Get all volunteers who were onboarded within the
 * incident range and queue their onboarding event emails
 *
 *
 */
const main = async (): Promise<void> => {
  try {
    await dbconnect()

    const volunteers: any = await VolunteerModel.aggregate([
      {
        $match: {
          isDeactivated: false
        }
      },
      {
        $lookup: {
          from: 'useractions',
          localField: '_id',
          foreignField: 'user',
          as: 'userActions'
        }
      },
      {
        $match: {
          'userActions.action': USER_ACTION.ACCOUNT.ONBOARDED,
          'userActions.createdAt': {
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
      VolunteerService.queueOnboardingEventEmails(volunteer._id)
    }
  } catch (error) {
    logger.error(error)
  }
  logger.info('Disconnecting')
  mongoose.disconnect()
}

main()
