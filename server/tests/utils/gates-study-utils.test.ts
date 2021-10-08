import { mocked } from 'ts-jest/utils'
import * as gatesStudyUtils from '../../utils/gates-study-utils'
import * as SessionService from '../../services/SessionService'
import * as UserService from '../../services/UserService'
import * as SchoolService from '../../services/SchoolService'

import {
  buildSession,
  buildStudent,
  buildSchool,
  getObjectId,
  buildGatesQualifiedData
} from '../generate'
import { GRADES, SUBJECTS } from '../../constants'

jest.mock('../../services/SessionService')
jest.mock('../../services/UserService')
jest.mock('../../services/SchoolService')

const mockedSessionService = mocked(SessionService, true)
const mockedUserService = mocked(UserService, true)
const mockedSchoolService = mocked(SchoolService, true)

beforeEach(() => {
  jest.resetAllMocks()
})

describe('isGatesQualifiedSession', () => {
  test('Should not qualify as a Gates-qualified session if the student is from a partner school', () => {
    const data = buildGatesQualifiedData({
      school: {
        isPartner: true
      }
    })

    const isGatesQualified = gatesStudyUtils.isGatesQualifiedSession(data)
    expect(isGatesQualified).toBeFalsy()
  })

  test('Should not qualify as a Gates-qualified session if the student is from a partner org', () => {
    const data = buildGatesQualifiedData({
      student: {
        studentPartnerOrg: 'example'
      }
    })

    const isGatesQualified = gatesStudyUtils.isGatesQualifiedSession(data)
    expect(isGatesQualified).toBeFalsy()
  })

  test('Should not qualify as a Gates-qualified session if the student has completed more than one session', () => {
    const data = buildGatesQualifiedData({
      student: {
        pastSessions: [getObjectId(), getObjectId()]
      }
    })

    const isGatesQualified = gatesStudyUtils.isGatesQualifiedSession(data)
    expect(isGatesQualified).toBeFalsy()
  })

  test('Should not qualify as a Gates-qualified session if the student is not in 9th or 10th grade', () => {
    const data = buildGatesQualifiedData({
      student: {
        currentGrade: GRADES.ELEVENTH
      }
    })

    const isGatesQualified = gatesStudyUtils.isGatesQualifiedSession(data)
    expect(isGatesQualified).toBeFalsy()
  })

  test('Should not qualify as a Gates-qualified session if the session was reported', () => {
    const data = buildGatesQualifiedData({
      session: {
        isReported: true
      }
    })

    const isGatesQualified = gatesStudyUtils.isGatesQualifiedSession(data)
    expect(isGatesQualified).toBeFalsy()
  })

  test('Should not qualify as a Gates-qualified session if the session was not in a math subject', () => {
    const data = buildGatesQualifiedData({
      session: {
        subTopic: SUBJECTS.CHEMISTRY
      }
    })

    const isGatesQualified = gatesStudyUtils.isGatesQualifiedSession(data)
    expect(isGatesQualified).toBeFalsy()
  })

  test('Should qualify as a Gates-qualified session', () => {
    const data = buildGatesQualifiedData()

    const isGatesQualified = gatesStudyUtils.isGatesQualifiedSession(data)
    expect(isGatesQualified).toBeTruthy()
  })
})

describe('prepareForGatesQualificationCheck', () => {
  test('Should retrieve the data for the gates qualification check', async () => {
    const mockSession = buildSession()
    const mockStudent = buildStudent()
    const mockSchool = buildSchool()

    mockedSessionService.getSessionById.mockResolvedValueOnce(mockSession)
    mockedUserService.getUser.mockResolvedValueOnce(mockStudent)
    mockedSchoolService.getSchool.mockResolvedValueOnce(mockSchool)

    const result = await gatesStudyUtils.prepareForGatesQualificationCheck(
      mockSession._id.toString()
    )

    const expected = {
      session: mockSession,
      student: mockStudent,
      school: mockSchool
    }

    expect(result).toEqual(expected)
  })
})

describe('isDateWithinGatesStudyPeriod', () => {
  test('Should not be within the Gates study period if the date is before the study period', async () => {
    const date = new Date('2021-10-17T01:00:00.000Z')
    const result = await gatesStudyUtils.isDateWithinGatesStudyPeriod(date)

    expect(result).toBeFalsy()
  })

  test('Should not be within the Gates study period if the date is after the study period', async () => {
    const date = new Date('2021-12-18T01:00:00.000Z')
    const result = await gatesStudyUtils.isDateWithinGatesStudyPeriod(date)

    expect(result).toBeFalsy()
  })

  test('Should be within the gates study period if the date is within the study period', async () => {
    const date = new Date('2021-11-01T01:00:00.000Z')
    const result = await gatesStudyUtils.isDateWithinGatesStudyPeriod(date)

    expect(result).toBeTruthy()
  })
})
