import { Router } from 'express'
import * as EssayReviewService from '../../services/EssayReviewService'
import { EVENTS, USER_BAN_TYPES } from '../../constants'
import { authPassport } from '../../utils/auth-utils'
import {
  asString,
  asOptional,
  asArray,
  asBoolean,
} from '../../utils/type-utils'
import { resError } from '../res-error'
import * as AnalyticsService from '../../services/AnalyticsService'
import { extractUser } from '../extract-user'
import { resSuccess } from '../res-success'
import { getLegacyUserObject } from '../../models/User/legacy-user'
import { NotAllowedError } from '../../models/Errors'
import type { Uuid } from '../../types/shared'

async function requireApplicationEssayVolunteer(userId: Uuid): Promise<void> {
  const user = await getLegacyUserObject(userId)
  if (
    user.banType === USER_BAN_TYPES.COMPLETE ||
    user.banType === USER_BAN_TYPES.SHADOW
  ) {
    throw new NotAllowedError('Banned volunteers cannot review essays')
  }
  if (!(user.subjects ?? []).includes('applicationEssays')) {
    throw new NotAllowedError('Application Essays certification required')
  }
}

export function routeEssayReviews(apiRouter: Router): void {
  const router = Router()

  router.post('/', async function (req, res) {
    try {
      const user = extractUser(req)
      const submission = await EssayReviewService.createEssayReviewSubmission({
        userId: user.id,
        studentEmail: user.email,
        studentFirstName: user.firstName,
        essay: asString(req.body.essay),
        essayPurpose: asOptional(asString)(req.body.essayPurpose),
        essayPrompt: asOptional(asString)(req.body.essayPrompt),
        additionalContext: asOptional(asString)(req.body.additionalContext),
        reviewReasons: req.body.reviewReasons
          ? asArray(asString)(req.body.reviewReasons)
          : [],
        reviewEmail: asString(req.body.reviewEmail),
      })

      AnalyticsService.captureEvent(
        user.id,
        EVENTS.STUDENT_SUBMITTED_ESSAY_FOR_REVIEW,
        { submissionId: submission.id }
      )

      resSuccess(res, {
        essayReview: {
          id: submission.id,
          status: submission.status,
          submittedAt: submission.submittedAt,
        },
      })
    } catch (error) {
      resError(res, error)
    }
  })

  router.get('/list', async function (req, res) {
    try {
      const user = extractUser(req)
      await requireApplicationEssayVolunteer(user.id)

      const submissions =
        await EssayReviewService.getAvailableEssayReviewSubmissions()
      const essayReviews = submissions.map(
        ({
          studentEmail,
          studentFirstName,
          userId,
          reviews,
          ...submission
        }) => ({
          ...submission,
          reviewCount: reviews.length,
          hasReviewed: reviews.some((review) => review.reviewerId === user.id),
        })
      )
      resSuccess(res, { essayReviews })
    } catch (error) {
      resError(res, error)
    }
  })

  router.get('/volunteer/email-preference', async function (req, res) {
    try {
      const user = extractUser(req)
      await requireApplicationEssayVolunteer(user.id)

      const optedIn = await EssayReviewService.getEssayReviewEmailPreference(
        user.id
      )
      resSuccess(res, { optedIn })
    } catch (error) {
      resError(res, error)
    }
  })

  router.post('/volunteer/email-preference', async function (req, res) {
    try {
      const user = extractUser(req)
      await requireApplicationEssayVolunteer(user.id)

      const optedIn = asBoolean(req.body.optedIn) === true
      await EssayReviewService.setEssayReviewEmailPreference(user.id, optedIn)
      AnalyticsService.captureEvent(
        user.id,
        EVENTS.VOLUNTEER_UPDATED_ESSAY_REVIEW_EMAIL_OPT_IN,
        { optedIn }
      )
      res.sendStatus(200)
    } catch (error) {
      resError(res, error)
    }
  })

  router.post('/volunteer/:submissionId/reviews', async function (req, res) {
    try {
      const user = extractUser(req)
      const submissionId = asString(req.params.submissionId)
      await requireApplicationEssayVolunteer(user.id)

      const submission = await EssayReviewService.createTutorEssayReview({
        submissionId,
        reviewerId: user.id,
        reviewerFirstName: user.firstName,
        review: asString(req.body.review),
      })
      if (!submission) {
        res.status(404).json({
          err: 'Unable to find the essay you are reviewing',
        })
        return
      }

      AnalyticsService.captureEvent(
        user.id,
        EVENTS.VOLUNTEER_SUBMITTED_ESSAY_REVIEW,
        {
          submissionId,
          reviewCount: submission.reviews.length,
          turnaroundHours:
            (Date.now() - new Date(submission.submittedAt).getTime()) /
            (60 * 60 * 1000),
        }
      )
      res.sendStatus(200)
    } catch (error) {
      resError(res, error)
    }
  })

  apiRouter.use('/essay-reviews', authPassport.isAuthenticated, router)
}
