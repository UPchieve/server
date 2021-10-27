import expressWs from 'express-ws'
import Case from 'case'
import * as FeedbackService from '../../services/FeedbackService'
import { getFeedbackBySessionIdUserType } from '../../models/Feedback/queries'
import { InputError } from '../../models/Errors'
import { asString, asObjectId } from '../../utils/type-utils'
import { resError } from '../res-error'

export function routeFeedback(router: expressWs.Router): void {
  router.post('/feedback', async (req, res) => {
    // TODO: duck type validators
    const {
      sessionId,
      topic,
      subTopic,
      responseData,
      studentTutoringFeedback,
      studentCounselingFeedback,
      volunteerFeedback,
      userType,
      studentId,
      volunteerId,
    } = req.body
    try {
      const feedback = await FeedbackService.saveFeedback({
        sessionId,
        type: Case.camel(topic),
        subTopic: Case.camel(subTopic),
        responseData,
        studentTutoringFeedback,
        studentCounselingFeedback,
        volunteerFeedback,
        userType,
        studentId,
        volunteerId,
      })
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
