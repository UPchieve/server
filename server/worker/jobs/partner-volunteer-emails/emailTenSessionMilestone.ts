import { Job } from 'bull'
import { Types } from 'mongoose'
import logger from '../../../logger'
import MailService from '../../../services/MailService'
import { getSessionsWithPipeline } from '../../../services/SessionService'
import { getVolunteers } from '../../../services/VolunteerService'
import { USER_SESSION_METRICS, FEEDBACK_VERSIONS } from '../../../constants'
import { EMAIL_RECIPIENT } from '../../../utils/aggregation-snippets'

/**
 *
 * conditions for sending the email:
 * - partner volunteer who has had 10 sessions
 * - each session must be 15+ minutes long and must have a session flag for an absent user
 * - must have not left 3 ratings of 1 - 3 session ratings
 *
 */

interface EmailTenSessionJobData {
  volunteerId: string | Types.ObjectId
  firstName: string
  email: string
}

export default async (job: Job<EmailTenSessionJobData>): Promise<void> => {
  const {
    data: { volunteerId, firstName, email },
    name: currentJob
  } = job

  const [volunteer] = await getVolunteers({
    ...EMAIL_RECIPIENT,
    _id: volunteerId
  })
  // Do not send email if volunteer does not match email recipient spec
  if (!volunteer) return

  const fifteenMins = 1000 * 60 * 15
  const sessions = await getSessionsWithPipeline([
    {
      $match: {
        volunteer:
          typeof volunteerId === 'string'
            ? Types.ObjectId(volunteerId)
            : volunteerId,
        timeTutored: { $gte: fifteenMins },
        reviewFlags: {
          $nin: [
            USER_SESSION_METRICS.absentStudent,
            USER_SESSION_METRICS.absentVolunteer
          ]
        }
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
        sessionRating: {
          $switch: {
            branches: [
              {
                case: {
                  $and: [
                    {
                      $eq: ['$feedback.versionNumber', FEEDBACK_VERSIONS.ONE]
                    },
                    '$feedback.responseData.session-rating.rating'
                  ]
                },
                then: '$feedback.responseData.session-rating.rating'
              },
              {
                case: {
                  $and: [
                    {
                      $eq: ['$feedback.versionNumber', FEEDBACK_VERSIONS.TWO]
                    },
                    '$feedback.volunteerFeedback.session-enjoyable'
                  ]
                },
                then: '$feedback.volunteerFeedback.session-enjoyable'
              }
            ],
            default: null
          }
        }
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
      throw new Error(
        `Failed to send ${currentJob} to volunteer ${volunteerId}: ${error}`
      )
    }
  }
}
