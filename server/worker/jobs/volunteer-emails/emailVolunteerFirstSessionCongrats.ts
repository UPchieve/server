import { Job } from 'bull'
import { Types } from 'mongoose'
import { SESSION_FLAGS } from '../../../constants'
import logger from '../../../logger'
import MailService from '../../../services/MailService'
import { getSessionsWithPipeline } from '../../../services/SessionService'
import { emailRecipientPrefixed } from '../../../utils/aggregation-snippets'

interface EmailVolunteerFirstSessionJobData {
  sessionId: string | Types.ObjectId
}

export default async (
  job: Job<EmailVolunteerFirstSessionJobData>
): Promise<void> => {
  const {
    data: { sessionId },
    name: currentJob
  } = job
  const [session] = await getSessionsWithPipeline([
    {
      $match: {
        _id:
          typeof sessionId === 'string' ? Types.ObjectId(sessionId) : sessionId,
        flags: {
          $nin: [
            SESSION_FLAGS.ABSENT_USER,
            SESSION_FLAGS.VOLUNTEER_RATING,
            SESSION_FLAGS.LOW_MESSAGES
          ]
        }
      }
    },
    {
      $lookup: {
        from: 'users',
        foreignField: '_id',
        localField: 'volunteer',
        as: 'volunteer'
      }
    },
    {
      $unwind: '$volunteer'
    },
    {
      $match: emailRecipientPrefixed('volunteer')
    },
    {
      $project: { volunteer: 1 }
    }
  ])

  if (session) {
    const { _id: volunteerId, firstname: firstName, email } = session.volunteer
    try {
      const contactInfo = { firstName, email }
      await MailService.sendVolunteerFirstSessionCongrats(contactInfo)
      logger.info(`Sent ${currentJob} to volunteer ${volunteerId}`)
    } catch (error) {
      throw new Error(
        `Failed to send ${currentJob} to volunteer ${volunteerId}: ${error}`
      )
    }
  }
}
