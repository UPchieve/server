import { mocked } from 'ts-jest/utils'
import { Jobs } from '../../../worker/jobs'
import MailService from '../../../services/MailService'
import UserService from '../../../services/UserService'
import * as StudentService from '../../../services/StudentService'
import { buildSession, buildStudent, buildVolunteer } from '../../generate'
import emailVolunteerSessionActions from '../../../worker/jobs/volunteer-emails/emailVolunteerSessionActions'
jest.mock('../../../logger')
jest.mock('../../../services/MailService')
jest.mock('../../../services/UserService')
jest.mock('../../../services/StudentService')

const mockedUserService = mocked(UserService, true)
const mockedStudentService = mocked(StudentService, true)

describe('Volunteer session action emails', () => {
  const volunteerSessionActionJobs: { jobName: string; jobFn }[] = [
    {
      jobName: Jobs.EmailVolunteerAbsentWarning,
      jobFn: MailService.sendVolunteerAbsentWarning
    },
    {
      jobName: Jobs.EmailVolunteerAbsentStudentApology,
      jobFn: MailService.sendVolunteerAbsentStudentApology
    }
  ]

  beforeEach(async () => {
    jest.resetAllMocks()
  })

  for (const currentJob of volunteerSessionActionJobs) {
    const student = buildStudent()
    const volunteer = buildVolunteer()
    const session = buildSession()

    // @todo: figure out how to properly type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const job: any = {
      name: currentJob.jobName,
      data: {
        studentId: student._id,
        volunteerId: volunteer._id,
        sessionSubject: session.subTopic,
        sessionDate: session.createdAt
      }
    }

    test(`Should execute ${job.name} successfully`, async () => {
      mockedStudentService.getStudent.mockImplementation(async () => student)
      mockedUserService.getUser.mockImplementation(async () => volunteer)
      await emailVolunteerSessionActions(job)
      expect(currentJob.jobFn).toHaveBeenCalledTimes(1)
    })

    test(`Should not execute ${job.name} if there is no volunteer`, async () => {
      mockedStudentService.getStudent.mockImplementation(async () => student)
      mockedUserService.getUser.mockImplementation(async () => null)
      await emailVolunteerSessionActions(job)
      expect(currentJob.jobFn).toHaveBeenCalledTimes(0)
    })

    test(`Should throw error for ${job.name} when email fails`, async () => {
      const errorMessage = 'Error sending email'
      const rejectionFn = jest.fn(() => Promise.reject(errorMessage))
      currentJob.jobFn.mockImplementationOnce(rejectionFn)
      mockedStudentService.getStudent.mockImplementation(async () => student)
      mockedUserService.getUser.mockImplementation(async () => volunteer)

      await expect(emailVolunteerSessionActions(job)).rejects.toEqual(
        Error(
          `Failed to email ${job.name} to volunteer ${volunteer._id}: ${errorMessage}`
        )
      )
    })
  }
})
