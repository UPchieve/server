import mongoose from 'mongoose'
import dbconnect from '../dbconnect'
import VolunteerModel from '../../models/Volunteer'
import MailService from '../../services/MailService'
import logger from '../../logger'

/**
 *
 * Incident Range (UTC):
 * 2021-04-10T13:30:00.000+00:00
 * 2021-04-14T03:44:00.000+00:00
 * 
 * 
 * Notes:
 * EmailNiceToMeetYou is scheduled on a daily cron job to send an email
 * to volunteer accounts that were created a day before
 * 
 * 04/14 at 03:44:00 UTC is when the worker queue started
 * working and EmailNiceToMeetYou was fired off to send emails to accounts
 * created a day before
 *
 * We're unsure if accounts created on 4/12 received the email or if
 * accounts on 4/13 received when the worker first started working again
 *
 * In order to avoid potentially sending the email again to the same users,
 * we'll only target accounts created on 4/9, 4/10, 4/11
 *
 */
const main = async (): Promise<void> => {
  try {
    await dbconnect()

    const volunteers: any = await VolunteerModel.aggregate([
      {
        $match: {
          isDeactivated: false,
          createdAt: {
            $gte: new Date('2021-04-09T00:00:00.000+00:00'),
            $lt: new Date('2021-04-12T00:00:00.000+00:00')
          }
        }
      },
      {
        $project: {
          _id: 1,
          firstname: 1,
          email: 1
        }
      }
    ])

    for (const volunteer of volunteers) {
      MailService.sendNiceToMeetYou(volunteer)
    }
  } catch (error) {
    logger.error(error)
  }
  logger.info('Disconnecting')
  mongoose.disconnect()
}

main()
