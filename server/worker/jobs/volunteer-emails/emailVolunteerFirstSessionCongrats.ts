import { Job } from 'bull'
import { USER_SESSION_METRICS } from '../../../constants'
import { log } from '../../logger'
import * as MailService from '../../../services/MailService'
import { getSessionsWithPipeline } from '../../../models/Session/queries'
import { emailRecipientPrefixed } from '../../../utils/aggregation-snippets'
import { asObjectId } from '../../../utils/type-utils'

interface EmailVolunteerFirstSessionJobData {
  sessionId: string
}

export default async (
  job: Job<EmailVolunteerFirstSessionJobData>
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
            USER_SESSION_METRICS.lowSessionRatingFromCoach,
          ],
        },
      },
    },
    {
      $lookup: {
        from: 'users',
        foreignField: '_id',
        localField: 'volunteer',
        as: 'volunteer',
      },
    },
    {
      $unwind: '$volunteer',
    },
    {
      $match: emailRecipientPrefixed('volunteer'),
    },
    {
      $project: { volunteer: 1 },
    },
  ])

  if (session) {
    const { _id: volunteerId, firstname, email } = session.volunteer
    try {
      await MailService.sendVolunteerFirstSessionCongrats(email, firstname)
      log(`Sent ${currentJob} to volunteer ${volunteerId}`)
    } catch (error) {
      throw new Error(
        `Failed to send ${currentJob} to volunteer ${volunteerId}: ${error}`
      )
    }
  }
}
