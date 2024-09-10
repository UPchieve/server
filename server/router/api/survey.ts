import expressWs from 'express-ws'
import {
  savePresessionSurvey,
  getPresessionSurveyForFeedback,
  getStudentsPresessionGoal,
  getSimpleSurveyDefinition,
  getPostsessionSurveyDefinition,
  getPostsessionSurveyResponse,
  getProgressReportSurveyResponse,
} from '../../models/Survey'
import {
  getContextSharingForVolunteer,
  getStudentPostsessionGoalRatings,
  parseUserRole,
  saveUserSurvey,
} from '../../services/SurveyService'
import { asString, asUlid } from '../../utils/type-utils'
import { extractUser } from '../extract-user'
import { resError } from '../res-error'
import { NotAuthenticatedError } from '../../models/Errors'

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
    const {
      surveyId,
      surveyTypeId,
      sessionId,
      progressReportId,
      submissions,
    } = req.body
    const data = {
      surveyId,
      surveyTypeId,
      sessionId,
      progressReportId,
      submissions,
    }
    try {
      await saveUserSurvey(user.id, data as unknown)
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

  router.get('/survey/progress-report', async function(req, res) {
    try {
      const survey = await getSimpleSurveyDefinition('progress-report')
      res.json({ survey })
    } catch (err) {
      resError(res, err)
    }
  })

  router.get(
    '/survey/progress-report/:progressReportId/response',
    async function(req, res) {
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

  router.get('/survey/postsession/ratings', async (req, res) => {
    const userId = req.user?.id
    if (!userId) throw new NotAuthenticatedError()

    try {
      const ratings = await getStudentPostsessionGoalRatings(userId)
      return res.json({ ratings })
    } catch (err) {
      resError(res, err)
    }
  })
}
