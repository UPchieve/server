import { mocked } from 'ts-jest/utils'
import * as SurveyService from '../../services/SurveyService'
import * as SurveyRepo from '../../models/Survey/queries'
import * as UserRepo from '../../models/User/queries'
import * as SessionRepo from '../../models/Session/queries'
import { buildPresessionSurveyResponse, buildSession } from '../pg-generate'
import { getDbUlid } from '../../models/pgUtils'

jest.mock('../../models/Survey/queries')
jest.mock('../../models/User/queries')
jest.mock('../../models/Session/queries')

const mockedSurveyRepo = mocked(SurveyRepo, true)
const mockedUserRepo = mocked(UserRepo, true)
const mockedSessionRepo = mocked(SessionRepo, true)

beforeEach(async () => {
  jest.resetAllMocks()
})

describe('getContextSharingForVolunteer', () => {
  test('Should get session context sharing for volunteer', async () => {
    const mockedSurveyReponse = [buildPresessionSurveyResponse()]
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
