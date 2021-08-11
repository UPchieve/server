import expressWs from '@small-tech/express-ws'
import * as SurveyService from '../../services/SurveyService'
import { Request, Response, NextFunction } from 'express'

export function routeSurvey(router: expressWs.Router): void {
  router.post('/survey/presession/:sessionId', async (req: Request, res: Response, next: NextFunction) => {
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
  })

  router.get('/survey/presession/:sessionId', async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req
    const { sessionId } = req.params

    try {
      const survey = await SurveyService.getPresessionSurvey({
        user,
        session: sessionId
      })
      res.json({ survey })
    } catch (error) {
      next(error)
    }
  })
}
