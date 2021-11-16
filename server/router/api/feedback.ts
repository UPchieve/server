import expressWs from 'express-ws'
import * as FeedbackService from '../../services/FeedbackService'
import { getFeedbackBySessionIdUserType } from '../../models/Feedback/queries'
import { InputError } from '../../models/Errors'
import { asString, asObjectId } from '../../utils/type-utils'
import { resError } from '../res-error'

export function routeFeedback(router: expressWs.Router): void {
  router.post('/feedback', async (req, res) => {
    try {
      const feedback = await FeedbackService.saveFeedback(req.body)
      res.json({
        feedback: feedback._id,
      })
    } catch (error) {
      resError(res, error)
    }
  })

  router.get('/feedback', async (req, res) => {
    if (
      !req.query.hasOwnProperty('sessionId') ||
      !req.query.hasOwnProperty('userType')
    )
      throw new InputError('Missing query parameters')
    const { sessionId, userType } = req.query
    try {
      const feedback = await getFeedbackBySessionIdUserType(
        asObjectId(sessionId),
        asString(userType)
      )

      res.json({
        feedback: feedback ? feedback._id : null,
      })
    } catch (error) {
      resError(res, error)
    }
  })
}
