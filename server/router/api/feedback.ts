import expressWs from 'express-ws'
import { getFeedbackBySessionIdUserType } from '../../models/Feedback/queries'
import { InputError } from '../../models/Errors'
import { asString, asUlid } from '../../utils/type-utils'
import { resError } from '../res-error'

export function routeFeedback(router: expressWs.Router): void {
  router.get('/feedback', async (req, res) => {
    if (
      !req.query.hasOwnProperty('sessionId') ||
      !req.query.hasOwnProperty('userType')
    )
      throw new InputError('Missing query parameters')
    const { sessionId, userType } = req.query
    try {
      const feedback = await getFeedbackBySessionIdUserType(
        asUlid(sessionId),
        asString(userType)
      )

      res.json({
        feedback: feedback ? feedback.id : null,
      })
    } catch (error) {
      resError(res, error)
    }
  })
}
