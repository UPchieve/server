import { Job } from 'bull'
import { Types } from 'mongoose'
import { USER_SESSION_METRICS } from '../../../constants'
import logger from '../../../logger'
import MailService from '../../../services/MailService'
import { getSessionsWithPipeline } from '../../../services/SessionService'
import { emailRecipientPrefixed } from '../../../utils/aggregation-snippets'

interface EmailStudentFirstSessionJobData {
  sessionId: string | Types.ObjectId
}

export default async (
  job: Job<EmailStudentFirstSessionJobData>
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
            USER_SESSION_METRICS.absentStudent,
            USER_SESSION_METRICS.absentVolunteer,
            USER_SESSION_METRICS.lowCoachRatingFromStudent,
            USER_SESSION_METRICS.lowSessionRatingFromStudent
          ]
        }
      }
    },
    {
      $lookup: {
        from: 'users',
        foreignField: '_id',
        localField: 'student',
        as: 'student'
      }
    },
    {
      $unwind: '$student'
    },
    {
      $match: emailRecipientPrefixed('student')
    },
    {
      $project: { student: 1 }
    }
  ])

  if (session) {
    const { _id: studentId, firstname: firstName, email } = session.student
    try {
      const contactInfo = { firstName, email }
      await MailService.sendStudentFirstSessionCongrats(contactInfo)
      logger.info(`Sent ${currentJob} to student ${studentId}`)
    } catch (error) {
      throw new Error(
        `Failed to send ${currentJob} to student ${studentId}: ${error}`
      )
    }
  }
}
