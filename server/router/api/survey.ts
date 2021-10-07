import expressWs from 'express-ws'
import { Types } from 'mongoose'
import * as SurveyService from '../../services/SurveyService'
import { LoadedRequest } from '../app'

export function routeSurvey(router: expressWs.Router): void {
  router.post(
    '/survey/presession/:sessionId',
    async (req: LoadedRequest, res, next) => {
      const { user } = req
      const { sessionId } = req.params
      const { responseData } = req.body
      try {
        await SurveyService.savePresessionSurvey({
          user,
          sessionId,
          responseData
        })
        res.sendStatus(200)
      } catch (error) {
        next(error)
      }
    }
  )

  router.get(
    '/survey/presession/:sessionId',
    async (req: LoadedRequest, res, next) => {
      const { user } = req
      const { sessionId } = req.params

      try {
        const survey = await SurveyService.getPresessionSurvey({
          user: user?._id,
          session: Types.ObjectId(sessionId)
        })
        res.json({ survey })
      } catch (error) {
        next(error)
      }
    }
  )
}
