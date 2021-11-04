import { mocked } from 'ts-jest/utils'
import * as gatesStudyUtils from '../../utils/gates-study-utils'
import * as SessionRepo from '../../models/Session/queries'
import * as StudentRepo from '../../models/Student/queries'
import * as SchoolService from '../../services/SchoolService'

import {
  buildSession,
  buildStudent,
  buildSchool,
  getObjectId,
  buildGatesQualifiedData,
} from '../generate'
import { GRADES, SUBJECTS } from '../../constants'

jest.mock('../../models/Session/queries')
jest.mock('../../models/Student/queries')
jest.mock('../../services/SessionService')
jest.mock('../../services/UserService')
jest.mock('../../services/SchoolService')

const mockedSessionRepo = mocked(SessionRepo, true)
const mockedStudentRepo = mocked(StudentRepo, true)
const mockedSchoolService = mocked(SchoolService, true)

beforeEach(() => {
  jest.resetAllMocks()
})

describe('isGatesQualifiedSession', () => {
  test('Should not qualify as a Gates-qualified session if the student is from a partner school', () => {
    const data = buildGatesQualifiedData({
      school: {
        isPartner: true,
      },
    })

    const isGatesQualified = gatesStudyUtils.isGatesQualifiedSession(data)
    expect(isGatesQualified).toBeFalsy()
  })

  test('Should not qualify as a Gates-qualified session if the student is from a partner org', () => {
    const data = buildGatesQualifiedData({
      student: {
        studentPartnerOrg: 'example',
      },
    })

    const isGatesQualified = gatesStudyUtils.isGatesQualifiedSession(data)
    expect(isGatesQualified).toBeFalsy()
  })

  test('Should not qualify as a Gates-qualified session if the student has completed more than one session', () => {
    const data = buildGatesQualifiedData({
      student: {
        pastSessions: [getObjectId(), getObjectId()],
      },
    })

    const isGatesQualified = gatesStudyUtils.isGatesQualifiedSession(data)
    expect(isGatesQualified).toBeFalsy()
  })

  test('Should not qualify as a Gates-qualified session if the student is not in 9th or 10th grade', () => {
    const data = buildGatesQualifiedData({
      student: {
        currentGrade: GRADES.ELEVENTH,
      },
    })

    const isGatesQualified = gatesStudyUtils.isGatesQualifiedSession(data)
    expect(isGatesQualified).toBeFalsy()
  })

  test('Should not qualify as a Gates-qualified session if the session was reported', () => {
    const data = buildGatesQualifiedData({
      session: {
        isReported: true,
      },
    })

    const isGatesQualified = gatesStudyUtils.isGatesQualifiedSession(data)
    expect(isGatesQualified).toBeFalsy()
  })

  test('Should not qualify as a Gates-qualified session if the session was not in a math subject', () => {
    const data = buildGatesQualifiedData({
      session: {
        subTopic: SUBJECTS.CHEMISTRY,
      },
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
    const mockStudent = buildStudent()
    const mockSession = buildSession({ student: mockStudent._id })
    const mockSchool = buildSchool()

    mockedSessionRepo.getSessionById.mockResolvedValueOnce(mockSession)
    mockedStudentRepo.getStudentById.mockResolvedValueOnce(mockStudent)
    mockedSchoolService.getSchool.mockResolvedValueOnce(mockSchool)

    const result = await gatesStudyUtils.prepareForGatesQualificationCheck(
      mockSession._id
    )

    const expected = {
      session: mockSession,
      student: mockStudent,
      school: mockSchool,
    }

    expect(result).toEqual(expected)
  })
})
