test.todo('postgres migration')
/*import { mocked } from 'jest-mock';
import { GRADES } from '../../constants'
import * as StudentRepo from '../../models/Student/queries'
import * as SchoolService from '../../services/SchoolService'
import * as gatesStudyUtils from '../../utils/gates-study-utils'
import { buildGatesQualifiedData, buildSchool, buildStudent } from '../generate'

jest.mock('../../models/Student/queries')
jest.mock('../../services/UserService')
jest.mock('../../services/SchoolService')

const mockedStudentRepo = mocked(StudentRepo, true)
const mockedSchoolService = mocked(SchoolService, true)

beforeEach(() => {
  jest.resetAllMocks()
})

describe('isGatesQualifiedStudent', () => {
  test('Should not qualify as a Gates-qualified student if the student is from a partner school', () => {
    const data = buildGatesQualifiedData({
      school: {
        isPartner: true,
      },
    })

    const isGatesQualified = gatesStudyUtils.isGatesQualifiedStudent(data)
    expect(isGatesQualified).toBeFalsy()
  })

  test('Should not qualify as a Gates-qualified student if the student is from a partner org', () => {
    const data = buildGatesQualifiedData({
      student: {
        studentPartnerOrg: 'example',
      },
    })

    const isGatesQualified = gatesStudyUtils.isGatesQualifiedStudent(data)
    expect(isGatesQualified).toBeFalsy()
  })

  test('Should not qualify as a Gates-qualified student if the student is not in 9th or 10th grade', () => {
    const data = buildGatesQualifiedData({
      student: {
        currentGrade: GRADES.ELEVENTH,
      },
    })

    const isGatesQualified = gatesStudyUtils.isGatesQualifiedStudent(data)
    expect(isGatesQualified).toBeFalsy()
  })
})

describe('prepareForGatesQualificationCheck', () => {
  test('Should retrieve the data for the gates qualification check', async () => {
    const mockStudent = buildStudent()
    const mockSchool = buildSchool()

    mockedStudentRepo.getStudentById.mockResolvedValueOnce(mockStudent)
    mockedSchoolService.getSchool.mockResolvedValueOnce(mockSchool)

    const result = await gatesStudyUtils.prepareForGatesQualificationCheck(
      mockStudent._id
    )

    const expected = {
      student: mockStudent,
      school: mockSchool,
    }

    expect(result).toEqual(expected)
  })
})
*/
