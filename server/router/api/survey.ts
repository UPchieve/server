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
      /*
      TODO remove this
      data = {
        surveyId: 8, <- THIS IS THE LOCAL ID use `where surveys.name = 'Student Post-Session Survey'
        surveyTypeId: 2, <- use `where survey_types.name = 'postsession'
        sessionId: '0198385d-115f-320f-5800-ef6a0cf4d1c2',
        submissions: [
          { questionId: 6, <- ??? what is this, do we show it? "Your goal for this session was to %s. Did UPchieve help you achieve your goal?"
          responseChoiceId: 47,
          openResponse: '' },
          { questionId: 9, <- `where survey_questions.question_text = 'Overall, how supportive was your coach today?'
          responseChoiceId: 48, <- if survey_response_choices.score = 5 for this id, then we show it
          openResponse: '' },
          { questionId: 10, <- `where survey_questions.question_text = 'Overall, how much did your coach push you to do your best work today?'
          responseChoiceId: 51, <- survey_response_choices.score = 5
          openResponse: '' },
          { questionId: 11, `where survey_questions.question_text = 'This can be about the web app, the Academic Coach who helped you, the services UPchieve offers, etc.'
          responseChoiceId: 79,
          openResponse: 'really good!' },
        ],
      }
    */
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
