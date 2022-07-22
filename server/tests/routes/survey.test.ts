import request, { Test } from 'supertest'
import { mocked } from 'ts-jest/utils'
import { SUBJECTS } from '../../constants'
import { getDbUlid } from '../../models/pgUtils'
import * as SurveyRepo from '../../models/Survey'
import { routeSurvey } from '../../router/api/survey'
import * as SurveyService from '../../services/SurveyService'
import { authPassport } from '../../utils/auth-utils'
import { mockApp, mockPassportMiddleware, mockRouter } from '../mock-app'
import {
  buildPresessionSurveyResponse,
  buildPressionSurvey,
  buildPressionSurveyLegacy,
  buildUserContactInfo,
} from '../pg-generate'

jest.mock('../../services/SurveyService')
jest.mock('../../models/Survey')
const mockedSurveyService = mocked(SurveyService, true)
const mockedSurveyRepo = mocked(SurveyRepo, true)

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

const SAVE_PRESSION_SURVEY = `/survey/presession/${sessionId}`
describe(SAVE_PRESSION_SURVEY, () => {
  test('Should save the presession survey', async () => {
    const payload = buildPresessionSurveyResponse()
    const mockedSurvey = buildPressionSurveyLegacy()
    mockedSurveyRepo.savePresessionSurvey.mockImplementationOnce(
      async () => mockedSurvey
    )
    const response = await sendPost(SAVE_PRESSION_SURVEY, payload)
    expect(mockedSurveyRepo.savePresessionSurvey).toHaveBeenCalledTimes(1)
    expect(response.status).toBe(200)
  })
})

const GET_PRESSION_SURVEY = `/survey/presession/${sessionId}`
describe(GET_PRESSION_SURVEY, () => {
  test('Should get presession survey questions', async () => {
    const payload = {}
    const mockedSurvey = buildPressionSurveyLegacy()
    mockedSurveyRepo.getPresessionSurvey.mockImplementationOnce(
      async () => mockedSurvey
    )
    const response = await sendGet(GET_PRESSION_SURVEY, payload)
    expect(mockedSurveyRepo.getPresessionSurvey).toHaveBeenCalledTimes(1)
    const expected = {
      ...mockedSurvey,
      createdAt: mockedSurvey.createdAt.toISOString(),
      updatedAt: mockedSurvey.updatedAt.toISOString(),
    }
    expect(expected).toEqual(response.body.survey)
    expect(response.status).toBe(200)
  })
})

const GET_PRESSION_SURVEY_NEW = `/survey/presession`
describe(GET_PRESSION_SURVEY_NEW, () => {
  test('Should get presession survey questions', async () => {
    const payload = { subjectName: SUBJECTS.ALGEBRA_ONE }
    const mockedSurvey = [buildPressionSurvey()]
    mockedSurveyRepo.getPresessionSurveyNew.mockImplementationOnce(
      async () => mockedSurvey
    )
    const response = await sendGet(GET_PRESSION_SURVEY_NEW, payload)
    expect(mockedSurveyRepo.getPresessionSurveyNew).toHaveBeenCalledTimes(1)
    expect(response.body.survey).toEqual(mockedSurvey)
    expect(response.status).toBe(200)
  })
})

const GET_PRESSION_SURVEY_RESPONSE = `/survey/presession/response/${sessionId}`
describe(GET_PRESSION_SURVEY_RESPONSE, () => {
  test('Should get presession survey questions', async () => {
    const payload = {}
    const mockedSurveyResponse = {
      responses: [buildPresessionSurveyResponse()],
      totalStudentSessions: 1,
    }
    mockedSurveyService.getContextSharingForVolunteer.mockImplementationOnce(
      async () => mockedSurveyResponse
    )
    const response = await sendGet(GET_PRESSION_SURVEY_RESPONSE, payload)
    expect(
      mockedSurveyService.getContextSharingForVolunteer
    ).toHaveBeenCalledTimes(1)
    expect(response.body).toEqual(mockedSurveyResponse)
    expect(response.status).toBe(200)
  })
})
