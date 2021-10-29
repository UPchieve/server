import { mocked } from 'ts-jest/utils'
import { Jobs } from '../../worker/jobs'
import * as MailService from '../../services/MailService'
import * as VolunteerRepo from '../../models/Volunteer/queries'
import * as StudentRepo from '../../models/Student/queries'
import { buildStudent, buildVolunteer } from '../generate'
import emailTechIssueApology from '../../worker/jobs/emailTechIssueApology'
import { Student } from '../../models/Student'
import { Volunteer } from '../../models/Volunteer'

jest.mock('../../services/MailService')
jest.mock('../../models/Volunteer/queries')
jest.mock('../../models/Student/queries')

const mockedVolunteerRepo = mocked(VolunteerRepo, true)
const mockedStudentRepo = mocked(StudentRepo, true)
const mockedMailService = mocked(MailService, true)

describe('Tech issue apology email', () => {
  let student: Student
  let volunteer: Volunteer
  let job: any
  beforeAll(async () => {
    student = buildStudent()
    volunteer = buildVolunteer()
    // TODO: figure out how to properly type
    job = {
      name: Jobs.EmailTechIssueApology,
      data: {
        studentId: student._id,
        volunteerId: volunteer._id,
      },
    }
  })

  beforeEach(async () => {
    jest.resetAllMocks()
  })

  test('Should send tech issue apology successfully to both users', async () => {
    mockedStudentRepo.getStudentContactInfoById.mockResolvedValueOnce(student)
    mockedVolunteerRepo.getVolunteerContactInfoById.mockResolvedValueOnce(
      undefined
    )

    await emailTechIssueApology(job)

    expect(MailService.sendTechIssueApology).toHaveBeenCalledWith(
      student.email,
      student.firstname
    )
  })

  test('Should send tech issue apology successfully to volunteer', async () => {
    mockedStudentRepo.getStudentContactInfoById.mockResolvedValueOnce(undefined)
    mockedVolunteerRepo.getVolunteerContactInfoById.mockResolvedValueOnce(
      volunteer
    )

    await emailTechIssueApology(job)

    expect(MailService.sendTechIssueApology).toHaveBeenCalledWith(
      volunteer.email,
      volunteer.firstname
    )
  })

  test('Should throw error when email fails', async () => {
    const errorMessage = 'Error sending email'
    mockedMailService.sendTechIssueApology.mockRejectedValue(errorMessage)
    mockedStudentRepo.getStudentContactInfoById.mockResolvedValueOnce(student)
    mockedVolunteerRepo.getVolunteerContactInfoById.mockResolvedValueOnce(
      volunteer
    )
    await expect(emailTechIssueApology(job)).rejects.toEqual(
      Error(
        `Failed to send ${Jobs.EmailTechIssueApology} to: student ${student._id}: ${errorMessage},volunteer ${volunteer._id}: ${errorMessage}`
      )
    )
  })
})
