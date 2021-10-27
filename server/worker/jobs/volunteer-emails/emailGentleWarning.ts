import { Job } from 'bull'
import { Types } from 'mongoose'
import { log } from '../../logger'
import * as MailService from '../../../services/MailService'
import { getNotificationsWithPipeline } from '../../../models/Notification/queries'
import { getSessionsWithPipeline } from '../../../models/Session/queries'
import { emailRecipientPrefixed } from '../../../utils/aggregation-snippets'
import { asObjectId } from '../../../utils/type-utils'

interface GentleWarningAggregation {
  _id: Types.ObjectId
  totalNotifications: number
  firstName: string
  email: string
}

interface EmailGentleWarningJobData {
  sessionId: string
}

/**
 *
 * conditions for sending email:
 * - Volunteer received 5 texts and completed 0 tutoring sessions
 *
 */
export default async (job: Job<EmailGentleWarningJobData>): Promise<void> => {
  const { name: currentJob } = job
  const sessionId = asObjectId(job.data.sessionId)
  const documentsWithVolunteerIds = await getSessionsWithPipeline([
    {
      $match: {
        _id:
          typeof sessionId === 'string' ? Types.ObjectId(sessionId) : sessionId,
      },
    },
    {
      $lookup: {
        from: 'notifications',
        foreignField: '_id',
        localField: 'notifications',
        as: 'notifications',
      },
    },
    { $unwind: '$notifications' },
    {
      $project: {
        isSessionsVolunteer: {
          $eq: ['$volunteer', '$notifications.volunteer'],
        },
        volunteerId: '$notifications.volunteer',
      },
    },
    {
      $match: {
        // Exclude from sending the email to the volunteer who joined this session
        isSessionsVolunteer: false,
      },
    },
    {
      $group: {
        _id: '$volunteerId',
      },
    },
  ])

  if (documentsWithVolunteerIds.length === 0) return

  const volunteerIds = documentsWithVolunteerIds.map(doc => doc._id)

  const volunteerNotifications: GentleWarningAggregation[] = ((await getNotificationsWithPipeline(
    [
      {
        $match: {
          volunteer: { $in: volunteerIds },
          priorityGroup: { $ne: 'follow-up' },
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
      { $unwind: '$volunteer' },
      {
        $match: {
          'volunteer.pastSessions': { $size: 0 },
          ...emailRecipientPrefixed('volunteer'),
        },
      },
      {
        $group: {
          _id: '$volunteer._id',
          totalNotifications: { $sum: 1 },
          firstName: { $first: '$volunteer.firstname' },
          email: { $first: '$volunteer.email' },
        },
      },
    ]
  )) as any) as GentleWarningAggregation[]

  const errors = []
  for (const volunteer of volunteerNotifications) {
    if (volunteer.totalNotifications === 5) {
      const { firstName, email, _id } = volunteer
      try {
        await MailService.sendVolunteerGentleWarning(email, firstName)
        log(`Sent ${currentJob} to volunteer ${_id}`)
      } catch (error) {
        errors.push(`volunteer ${_id}: ${error}`)
      }
    }
  }
  if (errors.length) {
    throw new Error(`Failed to send ${currentJob} to: ${[errors]}`)
  }
}
