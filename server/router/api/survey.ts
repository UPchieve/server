import expressWs from 'express-ws'
import {
  getStudentsPresessionGoal,
  getSimpleSurveyDefinition,
  getPostsessionSurveyResponse,
  getProgressReportSurveyResponse,
  getSimpleSurveyDefinitionBySurveyId,
} from '../../models/Survey'
import {
  getContextSharingForVolunteer,
  getLatestImpactStudySurveyResponses,
  parseUserRole,
  getImpactSurveyDefinition,
} from '../../services/SurveyService'
import * as SurveyService from '../../services/SurveyService'
import { asNumber, asString, asUlid } from '../../utils/type-utils'
import { extractUser } from '../extract-user'
import { resError } from '../res-error'

export function routeSurvey(router: expressWs.Router): void {
  router.post('/survey/save', async (req, res) => {
    try {
      const user = extractUser(req)
      const data = SurveyService.asSaveUserSurveyAndSubmissions(req.body)
      await SurveyService.saveUserSurvey(user.id, data)
      res.sendStatus(200)
    } catch (error) {
      resError(res, error)
    }
  })

  router.get('/survey/presession/:sessionId/goal', async (req, res) => {
    const { sessionId } = req.params
    try {
      const goal = await getStudentsPresessionGoal(sessionId)
      res.json({ goal })
    } catch (error) {
      resError(res, error)
    }
  })

  router.get('/survey/presession', async (req, res) => {
    try {
      const { subject } = req.query
      const survey = await getSimpleSurveyDefinition(
        'presession',
        asString(subject)
      )
      res.json(survey)
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

  router.get('/survey/postsession', async (req, res) => {
    try {
      const { sessionId, role } = req.query
      let parsedRole = parseUserRole(asString(role))
      const survey = await SurveyService.getPostsessionSurveyDefinition(
        asString(sessionId),
        parsedRole
      )
      res.json({ survey })
    } catch (error) {
      resError(res, error)
    }
  })

  router.get('/survey/postsession/response', async (req, res) => {
    try {
      const { sessionId, role } = req.query
      let parsedRole = parseUserRole(asString(role))
      const surveyResponse = await getPostsessionSurveyResponse(
        asUlid(sessionId),
        parsedRole
      )
      res.json(surveyResponse)
    } catch (error) {
      resError(res, error)
    }
  })

  router.get('/survey/progress-report', async function (req, res) {
    try {
      const survey = await getSimpleSurveyDefinition('progress-report')
      res.json({ survey })
    } catch (err) {
      resError(res, err)
    }
  })

  router.get(
    '/survey/progress-report/:progressReportId/response',
    async function (req, res) {
      try {
        const user = extractUser(req)
        const progressReportId = asString(req.params.progressReportId)
        const survey = await getProgressReportSurveyResponse(
          user.id,
          progressReportId
        )
        res.json({ survey })
      } catch (err) {
        resError(res, err)
      }
    }
  )

  router.get('/survey/impact-study', async (req, res) => {
    try {
      const survey = await getImpactSurveyDefinition()
      return res.json(survey)
    } catch (err) {
      resError(res, err)
    }
  })

  router.get('/survey/impact-study/responses', async (req, res) => {
    try {
      const user = extractUser(req)
      const survey = await getLatestImpactStudySurveyResponses(user.id)
      return res.json(survey)
    } catch (err) {
      resError(res, err)
    }
  })

  router.get('/surveys/:surveyId', async (req, res) => {
    try {
      const survey = await getSimpleSurveyDefinitionBySurveyId(
        asNumber(req.params.surveyId)
      )
      res.json({ survey })
    } catch (err) {
      resError(res, err)
    }
  })
}
