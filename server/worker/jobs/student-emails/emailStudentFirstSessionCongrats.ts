import { Job } from 'bull'
import { USER_SESSION_METRICS } from '../../../constants'
import { log } from '../../logger'
import * as MailService from '../../../services/MailService'
import { getSessionsWithPipeline } from '../../../models/Session/queries'
import { emailRecipientPrefixed } from '../../../utils/aggregation-snippets'
import { asObjectId } from '../../../utils/type-utils'

interface EmailStudentFirstSessionJobData {
  sessionId: string
}

export default async (
  job: Job<EmailStudentFirstSessionJobData>
): Promise<void> => {
  const { name: currentJob } = job
  const sessionId = asObjectId(job.data.sessionId)
  // TODO: repo pattern
  const [session] = await getSessionsWithPipeline([
    {
      $match: {
        _id: sessionId,
        flags: {
          $nin: [
            USER_SESSION_METRICS.absentStudent,
            USER_SESSION_METRICS.absentVolunteer,
            USER_SESSION_METRICS.lowCoachRatingFromStudent,
            USER_SESSION_METRICS.lowSessionRatingFromStudent,
          ],
        },
      },
    },
    {
      $lookup: {
        from: 'users',
        foreignField: '_id',
        localField: 'student',
        as: 'student',
      },
    },
    {
      $unwind: '$student',
    },
    {
      $match: emailRecipientPrefixed('student'),
    },
    {
      $project: { student: 1 },
    },
  ])

  if (session) {
    const { _id: studentId, firstname, email } = session.student
    try {
      await MailService.sendStudentFirstSessionCongrats(email, firstname)
      log(`Sent ${currentJob} to student ${studentId}`)
    } catch (error) {
      throw new Error(
        `Failed to send ${currentJob} to student ${studentId}: ${error}`
      )
    }
  }
}
