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
import { InputError, NotAllowedError } from '../../models/Errors'
import type { Uuid } from '../../types/shared'

async function requireAsyncReviewVolunteer(
  userId: Uuid,
  requiredSubject?: EssayReviewService.AsyncReviewSubject
): Promise<EssayReviewService.AsyncReviewSubject[]> {
  const user = await getLegacyUserObject(userId)
  if (
    user.banType === USER_BAN_TYPES.COMPLETE ||
    user.banType === USER_BAN_TYPES.SHADOW
  ) {
    throw new NotAllowedError('Banned volunteers cannot review submissions')
  }

  const certifiedSubjects = EssayReviewService.asyncReviewSubjects.filter(
    (subject) => (user.subjects ?? []).includes(subject)
  )
  if (
    !certifiedSubjects.length ||
    (requiredSubject && !certifiedSubjects.includes(requiredSubject))
  ) {
    throw new NotAllowedError('Required subject certification not found')
  }

  // Return the subjects the volunteer is certified to review
  return certifiedSubjects
}

function asAsyncReviewSubject(value: string) {
  if (
    !EssayReviewService.asyncReviewSubjects.includes(
      value as EssayReviewService.AsyncReviewSubject
    )
  ) {
    throw new InputError('Async review is not available for this subject')
  }
  return value as EssayReviewService.AsyncReviewSubject
}

export function routeEssayReviews(apiRouter: Router): void {
  const router = Router()

  router.post('/', async function (req, res) {
    try {
      const user = extractUser(req)
      const subject = asAsyncReviewSubject(asString(req.body.subject))
      const submission = await EssayReviewService.createEssayReviewSubmission({
        userId: user.id,
        subject,
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
        { submissionId: submission.id, subject: submission.subject }
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
      const volunteerSubjects = await requireAsyncReviewVolunteer(user.id)

      const submissions =
        await EssayReviewService.getAvailableEssayReviewSubmissions(
          volunteerSubjects
        )
      const essayReviews = submissions.map(
        ({
          studentEmail,
          studentFirstName,
          reviewEmail,
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

  router.get('/count', async function (req, res) {
    try {
      const user = extractUser(req)
      const volunteerSubjects = await requireAsyncReviewVolunteer(user.id)
      const count = await EssayReviewService.getPendingAsyncReviewCount(
        user.id,
        volunteerSubjects
      )

      resSuccess(res, { count })
    } catch (error) {
      resError(res, error)
    }
  })

  router.get('/volunteer/email-preference', async function (req, res) {
    try {
      const user = extractUser(req)
      await requireAsyncReviewVolunteer(user.id)

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
      await requireAsyncReviewVolunteer(user.id)

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
      const existingSubmission =
        await EssayReviewService.getEssayReviewSubmission(submissionId)
      await requireAsyncReviewVolunteer(user.id, existingSubmission.subject)

      const submission = await EssayReviewService.createTutorEssayReview({
        submissionId,
        reviewerId: user.id,
        reviewerFirstName: user.firstName,
        review: asString(req.body.review),
      })

      AnalyticsService.captureEvent(
        user.id,
        EVENTS.VOLUNTEER_SUBMITTED_ESSAY_REVIEW,
        {
          submissionId,
          subject: submission.subject,
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
