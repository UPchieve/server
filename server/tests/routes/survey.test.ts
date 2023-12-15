import request, { Test } from 'supertest'
import { mocked } from 'jest-mock'
import { SUBJECTS } from '../../constants'
import { getDbUlid } from '../../models/pgUtils'
import * as SurveyRepo from '../../models/Survey'
import { routeSurvey } from '../../router/api/survey'
import * as SurveyService from '../../services/SurveyService'
import { authPassport } from '../../utils/auth-utils'
import { mockApp, mockPassportMiddleware, mockRouter } from '../mock-app'
import {
  buildPresessionSurveyResponse,
  buildPresessionSurvey,
  buildPresessionSurveyLegacy,
  buildUserContactInfo,
  buildUserSurvey,
  buildUserSurveySubmission,
} from '../mocks/generate'

jest.mock('../../services/SurveyService')
jest.mock('../../models/Survey')
const mockedSurveyService = mocked(SurveyService)
const mockedSurveyRepo = mocked(SurveyRepo)

const US_IP_ADDRESS = '161.185.160.93'
const API_ROUTE = '/api'

const app = mockApp()
const mockGetUser = () => buildUserContactInfo()
app.use(mockPassportMiddleware(mockGetUser))

const router = mockRouter()
routeSurvey(router)

app.use('/api', authPassport.isAuthenticated, router)

const agent = request.agent(app)

async function sendGet(route: string, payload: any): Promise<Test> {
  return agent
    .get(API_ROUTE + route)
    .set('X-Forwarded-For', US_IP_ADDRESS)
    .set('Accept', 'application/json')
    .send(payload)
}

async function sendPost(route: string, payload: any): Promise<Test> {
  return agent
    .post(API_ROUTE + route)
    .set('X-Forwarded-For', US_IP_ADDRESS)
    .set('Accept', 'application/json')
    .send(payload)
}

beforeEach(async () => {
  jest.clearAllMocks()
  jest.resetAllMocks()
})

const sessionId = getDbUlid()

const SAVE_PRESESSION_SURVEY = `/survey/presession/${sessionId}`
describe('/survey/presession/:sessionId', () => {
  test('Should save the presession survey', async () => {
    const payload = buildPresessionSurveyResponse()
    const mockedSurvey = buildPresessionSurveyLegacy()
    mockedSurveyRepo.savePresessionSurvey.mockImplementationOnce(
      async () => mockedSurvey
    )
    const response = await sendPost(SAVE_PRESESSION_SURVEY, payload)
    expect(mockedSurveyRepo.savePresessionSurvey).toHaveBeenCalledTimes(1)
    expect(response.status).toBe(200)
  })
})

const GET_PRESESSION_SURVEY_FOR_FEEDBACK = `/survey/presession/${sessionId}`
describe('/survey/presession/:sessionId', () => {
  test('Should get presession survey questions', async () => {
    const payload = {}
    const mockedSurvey = buildPresessionSurveyLegacy()
    mockedSurveyRepo.getPresessionSurveyForFeedback.mockImplementationOnce(
      async () => mockedSurvey
    )
    const response = await sendGet(GET_PRESESSION_SURVEY_FOR_FEEDBACK, payload)
    expect(
      mockedSurveyRepo.getPresessionSurveyForFeedback
    ).toHaveBeenCalledTimes(1)
    const expected = {
      ...mockedSurvey,
      createdAt: mockedSurvey.createdAt.toISOString(),
      updatedAt: mockedSurvey.updatedAt.toISOString(),
    }
    expect(expected).toEqual(response.body.survey)
    expect(response.status).toBe(200)
  })
})

const GET_STUDENTS_PRESESSION_GOAL = `/survey/presession/${sessionId}/goal`
describe('/survey/presession/:sessionId/goal', () => {
  test('Should get the students presession goal', async () => {
    const payload = {}
    const mockedGoal = 'To get help with homework'
    mockedSurveyRepo.getStudentsPresessionGoal.mockImplementationOnce(
      async () => mockedGoal
    )
    const response = await sendGet(GET_STUDENTS_PRESESSION_GOAL, payload)
    expect(mockedSurveyRepo.getStudentsPresessionGoal).toHaveBeenCalledTimes(1)
    expect(mockedGoal).toEqual(response.body.goal)
    expect(response.status).toBe(200)
  })
})

const GET_PRESESSION_SURVEY = (subject: string) =>
  `/survey/presession?subject=${subject}`
describe('/survey/presession?subject=', () => {
  test('Should get presession survey questions', async () => {
    const payload = {}
    const mockedSurvey = {
      surveyId: 1,
      surveyTypeId: 1,
      survey: [buildPresessionSurvey()],
    }
    mockedSurveyRepo.getPresessionSurveyDefinition.mockImplementationOnce(
      async () => mockedSurvey
    )
    const response = await sendGet(
      GET_PRESESSION_SURVEY(SUBJECTS.ALGEBRA_ONE),
      payload
    )
    expect(
      mockedSurveyRepo.getPresessionSurveyDefinition
    ).toHaveBeenCalledTimes(1)
    expect(response.body).toEqual(mockedSurvey)
    expect(response.status).toBe(200)
  })
})

const GET_PRESESSION_SURVEY_RESPONSE = `/survey/presession/response/${sessionId}`
describe('/survey/presession/response/:sessionId', () => {
  test('Should get presession survey questions', async () => {
    const payload = {}
    const mockedSurveyResponse = {
      responses: [buildPresessionSurveyResponse()],
      totalStudentSessions: 1,
    }
    mockedSurveyService.getContextSharingForVolunteer.mockImplementationOnce(
      async () => mockedSurveyResponse
    )
    const response = await sendGet(GET_PRESESSION_SURVEY_RESPONSE, payload)
    expect(
      mockedSurveyService.getContextSharingForVolunteer
    ).toHaveBeenCalledTimes(1)
    expect(response.body).toEqual(mockedSurveyResponse)
    expect(response.status).toBe(200)
  })
})

const SAVE_USER_SURVEY = `/survey/save`
describe(SAVE_USER_SURVEY, () => {
  test('Should save user survey and submissions', async () => {
    const userSurvey = buildUserSurvey()
    const submissions = [buildUserSurveySubmission()]
    const payload = { ...userSurvey, submissions }
    mockedSurveyService.validateSaveUserSurveyAndSubmissions.mockResolvedValueOnce()
    const response = await sendPost(SAVE_USER_SURVEY, payload)
    expect(
      mockedSurveyService.validateSaveUserSurveyAndSubmissions
    ).toHaveBeenCalledTimes(1)
    expect(response.status).toBe(200)
  })

  test('Should catch and send error when user survey and submissions validation errors', async () => {
    const userSurvey = buildUserSurvey()
    const submissions = [buildUserSurveySubmission()]
    const payload = { ...userSurvey, submissions }
    const testError = new Error('Test error')
    mockedSurveyService.validateSaveUserSurveyAndSubmissions.mockRejectedValueOnce(
      testError
    )
    const response = await sendPost(SAVE_USER_SURVEY, payload)
    expect(
      mockedSurveyService.validateSaveUserSurveyAndSubmissions
    ).toHaveBeenCalledTimes(1)
    expect(response.status).toBe(500)
  })
})
