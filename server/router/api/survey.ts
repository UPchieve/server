import expressWs from 'express-ws'
import {
  savePresessionSurvey,
  getPresessionSurvey,
  getPresessionSurveyNew,
} from '../../models/Survey'
import { getContextSharingForVolunteer } from '../../services/SurveyService'
import { asString, asUlid } from '../../utils/type-utils'
import { extractUser } from '../extract-user'
import { resError } from '../res-error'

export function routeSurvey(router: expressWs.Router): void {
  router.post('/survey/presession/:sessionId', async (req, res) => {
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
      resError(res, error)
    }
  })

  router.get('/survey/presession/:sessionId', async (req, res) => {
    const user = extractUser(req)
    const { sessionId } = req.params

    try {
      const survey = await getPresessionSurvey(user.id, asUlid(sessionId))
      res.json({ survey })
    } catch (error) {
      resError(res, error)
    }
  })

  router.get('/survey/presession', async (req, res, next) => {
    try {
      const survey = await getPresessionSurveyNew(
        asString(req.body.subjectName)
      )
      res.json({ survey })
    } catch (error) {
      resError(res, error)
    }
  })

  router.get('/survey/presession/response/:sessionId', async (req, res) => {
    try {
      const { sessionId } = req.params
      const surveyResponse = await getContextSharingForVolunteer(
        asUlid(sessionId)
      )
      res.json(surveyResponse)
    } catch (error) {
      resError(res, error)
    }
  })
}
