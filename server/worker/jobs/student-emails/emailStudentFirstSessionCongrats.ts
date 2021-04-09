import { Job } from 'bull'
import { Types } from 'mongoose'
import { SESSION_FLAGS } from '../../../constants'
import logger from '../../../logger'
import MailService from '../../../services/MailService'
import { getSessionsWithPipeline } from '../../../services/SessionService'

const ObjectId = Types.ObjectId

export default async (
  job: Job<{
    sessionId: string
  }>
): Promise<void> => {
  const {
    data: { sessionId },
    name: currentJob
  } = job
  const [session] = await getSessionsWithPipeline([
    {
      $match: {
        _id: ObjectId(sessionId),
        flags: {
          $nin: [
            SESSION_FLAGS.ABSENT_USER,
            SESSION_FLAGS.STUDENT_RATING,
            SESSION_FLAGS.LOW_MESSAGES
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
      logger.error(
        `Failed to send ${currentJob} to student ${studentId}: ${error}`
      )
    }
  }
}
