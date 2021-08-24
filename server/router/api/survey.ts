const expressWs: any = require('@small-tech/express-ws')
import * as SurveyService from '../../services/SurveyService'
import { Request, Response, NextFunction, Router } from 'express'
import { ObjectId } from 'mongodb'
import { User } from '../../models/User'

export function routeSurvey(router: Router): void {
  router.post('/survey/presession/:sessionId', async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as User
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
    const user = req.user as User
    const { sessionId } = req.params

    try {
      const survey = await SurveyService.getPresessionSurvey({
        user: user._id,
        session: new ObjectId(sessionId)
      })
      res.json({ survey })
    } catch (error) {
      next(error)
    }
  })
}
