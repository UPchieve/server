import request, { Response } from 'supertest'
import { mocked } from 'jest-mock'
import { mockApp, mockPassportMiddleware, mockRouter } from '../../mock-app'
import { routeSurvey } from '../../../router/api/survey'
import * as SurveyRepo from '../../../models/Survey'
import * as SurveyService from '../../../services/SurveyService'
import {
  buildSimpleSurveyResponse,
  buildSurveyQueryResponse,
  buildUserSurveySavePayload,
  buildVolunteerContextSurveyResponse,
  buildUser,
  buildSurveyResponse,
} from '../../mocks/generate'
import { getUuid } from '../../../models/pgUtils'

jest.mock('../../../models/Survey')
jest.mock('../../../services/SurveyService')

const mockedSurveyRepo = mocked(SurveyRepo)
const mockedSurveyService = mocked(SurveyService)

let mockUser = buildUser()

function mockGetUser() {
  return mockUser
}

const app = mockApp()
const router = mockRouter()

routeSurvey(router)
app.use(mockPassportMiddleware(mockGetUser))
app.use('/api', router)

const agent = request.agent(app)

function sendGet(path: string): Promise<Response> {
  return agent.get(path).set('Accept', 'application/json')
}

function sendPost(
  path: string,
  payload?: Record<string, unknown>
): Promise<Response> {
  return agent.post(path).set('Accept', 'application/json').send(payload)
}

describe('routeSurvey', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    mockUser = buildUser()
  })

  describe('POST /api/survey/save', () => {
    test('saves user survey', async () => {
      const payload = buildUserSurveySavePayload()
      mockedSurveyService.asSaveUserSurveyAndSubmissions.mockReturnValueOnce(
        payload
      )
      mockedSurveyService.saveUserSurvey.mockResolvedValueOnce()

      const response = await sendPost('/api/survey/save', payload)
      expect(response.status).toBe(200)
      expect(
        mockedSurveyService.asSaveUserSurveyAndSubmissions
      ).toHaveBeenCalledWith(payload)
      expect(mockedSurveyService.saveUserSurvey).toHaveBeenCalledWith(
        mockUser.id,
        payload
      )
    })
  })

  describe('GET /api/survey/presession/:sessionId/goal', () => {
    test('returns student presession goal', async () => {
      const sessionId = getUuid()
      const goal = 'To get help with homework'
      mockedSurveyRepo.getStudentsPresessionGoal.mockResolvedValueOnce(goal)

      const response = await sendGet(`/api/survey/presession/${sessionId}/goal`)
      expect(response.status).toBe(200)
      expect(mockedSurveyRepo.getStudentsPresessionGoal).toHaveBeenCalledWith(
        sessionId
      )
      expect(response.body).toEqual({ goal })
    })
  })

  describe('GET /api/survey/presession', () => {
    test('returns presession survey definition', async () => {
      const survey = buildSurveyQueryResponse()
      const subject = 'algebraOne'
      mockedSurveyRepo.getSimpleSurveyDefinition.mockResolvedValueOnce(survey)

      const response = await sendGet(
        `/api/survey/presession?subject=${subject}`
      )
      expect(response.status).toBe(200)
      expect(mockedSurveyRepo.getSimpleSurveyDefinition).toHaveBeenCalledWith(
        'presession',
        subject
      )
      expect(response.body).toEqual({
        ...survey,
      })
    })
  })

  describe('GET /api/survey/presession/response/:sessionId', () => {
    test('returns volunteer context sharing response', async () => {
      const sessionId = getUuid()
      const surveyResponse = buildVolunteerContextSurveyResponse()
      mockedSurveyService.getContextSharingForVolunteer.mockResolvedValueOnce(
        surveyResponse
      )

      const response = await sendGet(
        `/api/survey/presession/response/${sessionId}`
      )
      expect(response.status).toBe(200)
      expect(
        mockedSurveyService.getContextSharingForVolunteer
      ).toHaveBeenCalledWith(sessionId)
      expect(response.body).toEqual({
        ...surveyResponse,
      })
    })
  })

  describe('GET /api/survey/postsession', () => {
    test('returns postsession survey definition', async () => {
      const sessionId = getUuid()
      const survey = buildSurveyQueryResponse()
      const role = 'student'
      mockedSurveyService.parseUserRole.mockReturnValueOnce(role)
      mockedSurveyService.getPostsessionSurveyDefinition.mockResolvedValueOnce(
        survey
      )

      const response = await sendGet(
        `/api/survey/postsession?sessionId=${sessionId}&role=${role}`
      )
      expect(response.status).toBe(200)
      expect(mockedSurveyService.parseUserRole).toHaveBeenCalledWith(role)
      expect(
        mockedSurveyService.getPostsessionSurveyDefinition
      ).toHaveBeenCalledWith(sessionId, role)
      expect(response.body).toEqual({ survey })
    })
  })

  describe('GET /api/survey/postsession/response', () => {
    test('returns postsession survey response', async () => {
      const sessionId = getUuid()
      const role = 'volunteer'
      const surveyResponse = [buildSurveyResponse()]
      mockedSurveyService.parseUserRole.mockReturnValueOnce(role)
      mockedSurveyRepo.getPostsessionSurveyResponse.mockResolvedValueOnce(
        surveyResponse
      )

      const response = await sendGet(
        `/api/survey/postsession/response?sessionId=${sessionId}&role=${role}`
      )
      expect(response.status).toBe(200)
      expect(mockedSurveyService.parseUserRole).toHaveBeenCalledWith(role)
      expect(
        mockedSurveyRepo.getPostsessionSurveyResponse
      ).toHaveBeenCalledWith(sessionId, role)
      expect(response.body).toEqual(surveyResponse)
    })
  })

  describe('GET /api/survey/progress-report', () => {
    test('returns progress report survey definition', async () => {
      const survey = buildSurveyQueryResponse()
      mockedSurveyRepo.getSimpleSurveyDefinition.mockResolvedValueOnce(survey)

      const response = await sendGet('/api/survey/progress-report')
      expect(response.status).toBe(200)
      expect(mockedSurveyRepo.getSimpleSurveyDefinition).toHaveBeenCalledWith(
        'progress-report'
      )
      expect(response.body).toEqual({ survey })
    })
  })

  describe('GET /api/survey/progress-report/:progressReportId/response', () => {
    test('returns progress report survey response', async () => {
      const progressReportId = getUuid()
      const survey = buildSimpleSurveyResponse()
      mockedSurveyRepo.getProgressReportSurveyResponse.mockResolvedValueOnce([
        survey,
      ])

      const response = await sendGet(
        `/api/survey/progress-report/${progressReportId}/response`
      )
      expect(response.status).toBe(200)
      expect(
        mockedSurveyRepo.getProgressReportSurveyResponse
      ).toHaveBeenCalledWith(mockUser.id, progressReportId)
      expect(response.body).toEqual({ survey: [survey] })
    })
  })

  describe('GET /api/survey/impact-study', () => {
    test('returns impact study survey definition', async () => {
      const survey = buildSurveyQueryResponse()
      mockedSurveyService.getImpactSurveyDefinition.mockResolvedValueOnce(
        survey
      )

      const response = await sendGet('/api/survey/impact-study')
      expect(response.status).toBe(200)
      expect(mockedSurveyService.getImpactSurveyDefinition).toHaveBeenCalled()
      expect(response.body).toEqual(survey)
    })
  })

  describe('GET /api/survey/impact-study/responses', () => {
    test('returns latest impact study survey responses', async () => {
      const survey = buildSurveyQueryResponse()
      mockedSurveyService.getLatestImpactStudySurveyResponses.mockResolvedValueOnce(
        survey
      )

      const response = await sendGet('/api/survey/impact-study/responses')
      expect(response.status).toBe(200)
      expect(
        mockedSurveyService.getLatestImpactStudySurveyResponses
      ).toHaveBeenCalledWith(mockUser.id)
      expect(response.body).toEqual(survey)
    })
  })

  describe('GET /api/surveys/:surveyId', () => {
    test('returns simple survey definition by survey id', async () => {
      const survey = buildSurveyQueryResponse()
      mockedSurveyRepo.getSimpleSurveyDefinitionBySurveyId.mockResolvedValueOnce(
        survey
      )

      const response = await sendGet(`/api/surveys/${survey.surveyId}`)
      expect(response.status).toBe(200)
      expect(
        mockedSurveyRepo.getSimpleSurveyDefinitionBySurveyId
      ).toHaveBeenCalledWith(survey.surveyId)
      expect(response.body).toEqual({ survey })
    })
  })
})
