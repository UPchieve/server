import expressWs from 'express-ws'
import {
  savePresessionSurvey,
  getPresessionSurvey,
} from '../../models/Survey/queries'
import { asObjectId } from '../../utils/type-utils'
import { extractUser } from '../extract-user'

export function routeSurvey(router: expressWs.Router): void {
  router.post('/survey/presession/:sessionId', async (req, res, next) => {
    const user = extractUser(req)
    const { sessionId } = req.params
    const { responseData } = req.body
    try {
      await savePresessionSurvey(
        user._id,
        asObjectId(sessionId),
        responseData // TODO: duck type validation
      )
      res.sendStatus(200)
    } catch (error) {
      next(error)
    }
  })

  router.get('/survey/presession/:sessionId', async (req, res, next) => {
    const user = extractUser(req)
    const { sessionId } = req.params

    try {
      const survey = await getPresessionSurvey(user._id, asObjectId(sessionId))
      res.json({ survey })
    } catch (error) {
      next(error)
    }
  })
}
