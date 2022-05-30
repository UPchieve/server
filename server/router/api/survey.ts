import expressWs from 'express-ws'
import { savePresessionSurvey, getPresessionSurvey } from '../../models/Survey'
import { asString, asUlid } from '../../utils/type-utils'
import { extractUser } from '../extract-user'
import * as SurveyService from '../../services/SurveyService'
import { resError } from '../res-error'

export function routeSurvey(router: expressWs.Router): void {
  router.post('/survey/presession/:sessionId', async (req, res, next) => {
    const user = extractUser(req)
    const { sessionId } = req.params
    const { responseData } = req.body
    try {
      await savePresessionSurvey(
        user.id,
        asUlid(sessionId),
        responseData // TODO: duck type validation
      )
      res.sendStatus(200)
    } catch (error) {
      next(error)
    }
  })

  router.get('/survey/presession', async (req, res, next) => {
    // const user = extractUser(req)
    // const { sessionId } = req.params
    const { subjectName } = req.body.subjectName

    try {
      const survey = await SurveyService.getPresessionSurvey(
        asString(subjectName)
      )
      res.json({ survey })
    } catch (error) {
      resError(res, error)
    }
  })
}
