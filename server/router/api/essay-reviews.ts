import { Router } from 'express'
import * as EssayReviewService from '../../services/EssayReviewService'
import { EVENTS } from '../../constants'
import { authPassport } from '../../utils/auth-utils'
import { asString, asOptional, asArray } from '../../utils/type-utils'
import { resError } from '../res-error'
import * as AnalyticsService from '../../services/AnalyticsService'
import { extractUser } from '../extract-user'
import { resSuccess } from '../res-success'

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

  apiRouter.use('/essay-reviews', authPassport.isAuthenticated, router)
}
