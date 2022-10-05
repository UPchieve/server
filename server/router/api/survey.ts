import expressWs from 'express-ws'
import {
  savePresessionSurvey,
  getPresessionSurveyForFeedback,
  getStudentsPresessionGoal,
  getPresessionSurveyDefinition,
  getPostsessionSurveyDefinition,
  getPostsessionSurveyResponse,
} from '../../models/Survey'
import {
  getContextSharingForVolunteer,
  validateSaveUserSurveyAndSubmissions,
  parseUserRole,
} from '../../services/SurveyService'
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

  router.post('/survey/save', async (req, res) => {
    const user = extractUser(req)
    const { surveyId, sessionId, surveyTypeId, submissions } = req.body
    const data = {
      surveyId,
      sessionId,
      surveyTypeId,
      submissions,
    }
    try {
      await validateSaveUserSurveyAndSubmissions(user.id, data as unknown)
      res.sendStatus(200)
    } catch (error) {
      resError(res, error)
    }
  })

  // This route only services the mobile app atm. Remove once
  // the mobile app uses new presession survey work
  router.get('/survey/presession/:sessionId', async (req, res) => {
    const user = extractUser(req)
    const { sessionId } = req.params

    try {
      const survey = await getPresessionSurveyForFeedback(
        user.id,
        asUlid(sessionId)
      )
      res.json({ survey })
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
      const survey = await getPresessionSurveyDefinition(
        asString(subject),
        'presession'
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
      const survey = await getPostsessionSurveyDefinition(
        'postsession',
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
}
