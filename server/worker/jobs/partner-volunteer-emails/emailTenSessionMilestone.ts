import { Job } from 'bull'
import { Types } from 'mongoose'
import logger from '../../../logger'
import MailService from '../../../services/MailService'
import { getSessionsWithPipeline } from '../../../services/SessionService'
import { SESSION_FLAGS } from '../../../constants'

/**
 *
 * conditions for sending the email:
 * - partner volunteer who has had 10 sessions
 * - each session must be 15+ minutes long and must have a session flag for an absent user
 * - must have not left 3 ratings of 1 - 3 session ratings
 *
 */
export default async (
  job: Job<{
    volunteerId: string
    firstName: string
    email: string
  }>
): Promise<void> => {
  const {
    data: { volunteerId, firstName, email },
    name: currentJob
  } = job

  const fifteenMins = 1000 * 60 * 15
  const sessions = await getSessionsWithPipeline([
    {
      $match: {
        volunteer: Types.ObjectId(volunteerId),
        timeTutored: { $gte: fifteenMins },
        reviewFlags: { $ne: SESSION_FLAGS.ABSENT_USER }
      }
    },
    {
      $lookup: {
        from: 'feedbacks',
        localField: 'volunteer',
        foreignField: 'volunteerId',
        as: 'feedbacks'
      }
    },
    {
      $lookup: {
        from: 'feedbacks',
        let: {
          volunteerId: '$volunteer',
          sessionId: '$_id'
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$sessionId', '$$sessionId'] },
                  { $eq: ['$volunteerId', '$$volunteerId'] }
                ]
              }
            }
          }
        ],
        as: 'feedback'
      }
    },
    {
      $unwind: {
        path: '$feedback',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $project: {
        _id: 1,
        sessionRating: '$feedback.responseData.session-rating.rating'
      }
    }
  ])

  if (sessions.length === 10) {
    let totalLowSessionRatings = 0
    const lowSessionRating = 3
    const totalLowSessionRatingsLimit = 3
    for (const session of sessions) {
      if (
        typeof session.sessionRating === 'number' &&
        session.sessionRating <= lowSessionRating
      )
        totalLowSessionRatings++
    }
    if (totalLowSessionRatings >= totalLowSessionRatingsLimit) return

    try {
      const contactInfo = {
        firstName,
        email
      }
      await MailService.sendPartnerVolunteerTenSessionMilestone(contactInfo)
      logger.info(`Sent ${currentJob} to volunteer ${volunteerId}`)
    } catch (error) {
      logger.error(
        `Failed to send ${currentJob} to volunteer ${volunteerId}: ${error}`
      )
    }
  }
}
