import { Job } from 'bull'
import { Types } from 'mongoose'
import logger from '../../../logger'
import MailService from '../../../services/MailService'
import { getSessionsWithPipeline } from '../../../services/SessionService'
import { volunteerPartnerManifests } from '../../../partnerManifests'
import { SESSION_FLAGS, FEEDBACK_VERSIONS } from '../../../constants'

/**
 *
 * conditions for sending the email:
 * - partner volunteer who has had 5 sessions
 * - each session must be 15+ minutes long and must have a session flag for an absent user
 * - must have not left 2 ratings of 1 - 3 session ratings
 *
 */

interface EmailReferCoworkerJobData {
  volunteerId: string | Types.ObjectId
  firstName: string
  email: string
  partnerOrg: string
}

export default async (job: Job<EmailReferCoworkerJobData>): Promise<void> => {
  const {
    data: { volunteerId, firstName, email, partnerOrg },
    name: currentJob
  } = job

  const fifteenMins = 1000 * 60 * 15
  const sessions = await getSessionsWithPipeline([
    {
      $match: {
        volunteer:
          typeof volunteerId === 'string'
            ? Types.ObjectId(volunteerId)
            : volunteerId,
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

  if (sessions.length === 5) {
    let totalLowSessionRatings = 0
    const lowSessionRating = 3
    const totalLowSessionRatingsLimit = 2
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
        email,
        partnerOrg,
        partnerOrgDisplay: volunteerPartnerManifests[partnerOrg].name
      }
      await MailService.sendPartnerVolunteerReferACoworker(contactInfo)
      logger.info(`Sent ${currentJob} to volunteer ${volunteerId}`)
    } catch (error) {
      throw new Error(
        `Failed to send ${currentJob} to volunteer ${volunteerId}: ${error}`
      )
    }
  }
}
