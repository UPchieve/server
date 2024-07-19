import { mocked } from 'jest-mock'
import * as SurveyService from '../../services/SurveyService'
import * as SurveyRepo from '../../models/Survey/queries'
import * as UserRepo from '../../models/User/queries'
import * as SessionRepo from '../../models/Session/queries'
import {
  buildSession,
  buildSimpleSurveyResponse,
  buildUserSurvey,
  buildUserSurveySubmission,
} from '../mocks/generate'
import { getDbUlid } from '../../models/pgUtils'
import { InputError } from '../../models/Errors'
import { FEEDBACK_EVENTS } from '../../constants'
import { emitter } from '../../services/EventsService'

jest.mock('../../models/Survey/queries')
jest.mock('../../models/User/queries')
jest.mock('../../models/Session/queries')

const mockedSurveyRepo = mocked(SurveyRepo)
const mockedUserRepo = mocked(UserRepo)
const mockedSessionRepo = mocked(SessionRepo)

beforeEach(async () => {
  jest.resetAllMocks()
})

describe('getContextSharingForVolunteer', () => {
  test('Should get session context sharing for volunteer', async () => {
    const mockedSurveyReponse = [buildSimpleSurveyResponse()]
    const mockTotalSessions = 2
    const mockSession = await buildSession({ studentId: getDbUlid() })
    mockedSurveyRepo.getPresessionSurveyResponse.mockResolvedValueOnce(
      mockedSurveyReponse
    )
    mockedUserRepo.getTotalSessionsByUserId.mockResolvedValueOnce(
      mockTotalSessions
    )
    mockedSessionRepo.getSessionById.mockResolvedValueOnce(mockSession)

    const result = await SurveyService.getContextSharingForVolunteer(
      getDbUlid()
    )

    const expected = {
      responses: mockedSurveyReponse,
      totalStudentSessions: mockTotalSessions,
    }
    expect(result).toEqual(expected)
  })
})

describe('saveUserSurvey', () => {
  test('Should throw InputError if user survey submissions are not an array', async () => {
    const sessionId = getDbUlid()
    const userSurvey = buildUserSurvey({
      sessionId,
    })
    const submissions = buildUserSurveySubmission({
      responseChoiceId: 1,
      questionId: 1,
    })

    const data = { ...userSurvey, submissions }
    const userId = getDbUlid()

    try {
      await SurveyService.saveUserSurvey(userId, data)
    } catch (err) {
      expect(err).toBeInstanceOf(InputError)
    }

    expect(mockedSurveyRepo.saveUserSurveyAndSubmissions).toHaveBeenCalledTimes(
      0
    )
  })

  test('Should validate and save a user survey and its submissions', async () => {
    const userSurvey = buildUserSurvey()
    const submissions = [
      buildUserSurveySubmission({ responseChoiceId: 1, questionId: 1 }),
      buildUserSurveySubmission({ responseChoiceId: 5, questionId: 5 }),
      buildUserSurveySubmission({ responseChoiceId: 10, questionId: 10 }),
    ]
    const data = { ...userSurvey, submissions }
    const userId = getDbUlid()

    mockedSurveyRepo.saveUserSurveyAndSubmissions.mockResolvedValueOnce()

    await SurveyService.saveUserSurvey(userId, data)
    const expectedUserSurvey = {
      surveyId: data.surveyId,
      sessionId: data.sessionId,
      surveyTypeId: data.surveyTypeId,
    }
    const expectedSubmissions = data.submissions
    expect(mockedSurveyRepo.saveUserSurveyAndSubmissions).toHaveBeenCalledTimes(
      1
    )
    expect(mockedSurveyRepo.saveUserSurveyAndSubmissions).toHaveBeenCalledWith(
      userId,
      expectedUserSurvey,
      expectedSubmissions
    )
  })

  test(`Should trigger ${FEEDBACK_EVENTS.FEEDBACK_SAVED} after saving user survey`, async () => {
    const sessionId = getDbUlid()
    const userSurvey = buildUserSurvey({ sessionId })
    const submissions = [
      buildUserSurveySubmission({ responseChoiceId: 1, questionId: 1 }),
      buildUserSurveySubmission({ responseChoiceId: 5, questionId: 5 }),
      buildUserSurveySubmission({ responseChoiceId: 10, questionId: 10 }),
    ]
    const data = { ...userSurvey, submissions }
    const userId = getDbUlid()

    mockedSurveyRepo.saveUserSurveyAndSubmissions.mockResolvedValueOnce()

    await SurveyService.saveUserSurvey(userId, data)
    const expectedUserSurvey = {
      surveyId: data.surveyId,
      sessionId: data.sessionId,
      surveyTypeId: data.surveyTypeId,
    }
    const expectedSubmissions = data.submissions
    expect(mockedSurveyRepo.saveUserSurveyAndSubmissions).toHaveBeenCalledTimes(
      1
    )
    expect(mockedSurveyRepo.saveUserSurveyAndSubmissions).toHaveBeenCalledWith(
      userId,
      expectedUserSurvey,
      expectedSubmissions
    )
    expect(emitter.emit).toHaveBeenCalledTimes(1)
    expect(emitter.emit).toHaveBeenCalledWith(
      FEEDBACK_EVENTS.FEEDBACK_SAVED,
      userSurvey.sessionId
    )
  })
})
