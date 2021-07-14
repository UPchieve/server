import mongoose from 'mongoose'
import * as db from '../../db'
import * as StudentService from '../../services/StudentService'
import StudentModel from '../../models/Student'
import logger from '../../logger'

/**
 *
 * Incident Range (UTC):
 * 2021-04-10T13:30:00.000+00:00
 * 2021-04-14T17:25:00.000+00:00
 *
 *
 * Notes:
 * Get all student account created within the incident range and queue
 * their welcome emails
 *
 *
 */
const main = async (): Promise<void> => {
  try {
    await db.connect()

    const students: any = await StudentModel.aggregate([
      {
        $match: {
          isDeactivated: false,
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

    for (const student of students) {
      StudentService.queueWelcomeEmails(student._id)
    }
  } catch (error) {
    logger.error(error)
  }
  logger.info('Disconnecting')
  mongoose.disconnect()
}

main()
