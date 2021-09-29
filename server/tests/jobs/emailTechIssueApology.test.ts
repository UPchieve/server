import { mocked } from 'ts-jest/utils'
import { Jobs } from '../../worker/jobs'
import MailService from '../../services/MailService'
import UserService from '../../services/UserService'
import * as StudentService from '../../services/StudentService'
import { buildStudent, buildVolunteer } from '../generate'
import emailTechIssueApology from '../../worker/jobs/emailTechIssueApology'
jest.mock('../../logger')
jest.mock('../../services/MailService')
jest.mock('../../services/UserService')
jest.mock('../../services/StudentService')

const mockedUserService = mocked(UserService, true)
const mockedStudentService = mocked(StudentService, true)
const mockedMailService = mocked(MailService, true)

describe('Tech issue apology email', () => {
  let student
  let volunteer
  let job
  beforeAll(async () => {
    student = buildStudent()
    volunteer = buildVolunteer()
    // @todo: figure out how to properly type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    job = {
      name: Jobs.EmailTechIssueApology,
      data: {
        studentId: student._id,
        volunteerId: volunteer._id
      }
    }
  })

  beforeEach(async () => {
    jest.resetAllMocks()
  })

  test('Should send tech issue apology successfully to both users', async () => {
    mockedStudentService.getStudent.mockImplementation(async () => student)
    mockedUserService.getUser.mockImplementation(async () => null)

    await emailTechIssueApology(job)
    const expected = {
      firstName: student.firstname,
      email: student.email
    }
    expect(MailService.sendTechIssueApology).toHaveBeenCalledWith(expected)
  })

  test('Should send tech issue apology successfully to volunteer', async () => {
    mockedStudentService.getStudent.mockImplementation(async () => null)
    mockedUserService.getUser.mockImplementation(async () => volunteer)

    await emailTechIssueApology(job)
    const expected = {
      firstName: volunteer.firstname,
      email: volunteer.email
    }
    expect(MailService.sendTechIssueApology).toHaveBeenCalledWith(expected)
  })

  test('Should throw error when email fails', async () => {
    const errorMessage = 'Error sending email'
    const rejectionFn = jest.fn(() => Promise.reject(errorMessage))
    mockedMailService.sendTechIssueApology.mockImplementation(rejectionFn)
    mockedStudentService.getStudent.mockImplementation(async () => student)
    mockedUserService.getUser.mockImplementation(async () => volunteer)
    await expect(emailTechIssueApology(job)).rejects.toEqual(
      Error(
        `Failed to send ${Jobs.EmailTechIssueApology} to: student ${student._id}: ${errorMessage},volunteer ${volunteer._id}: ${errorMessage}`
      )
    )
  })
})
