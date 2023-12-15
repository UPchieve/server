test.todo('postgres migration')
/*import { mocked } from 'jest-mock';
import emailStudentSessionActions from '../../../worker/jobs/student-emails/emailStudentSessionActions'
import { Jobs } from '../../../worker/jobs'
import * as MailService from '../../../services/MailService'
import * as StudentRepo from '../../../models/Student/queries'
import * as VolunteerRepo from '../../../models/Volunteer/queries'
import { buildSession, buildStudent, buildVolunteer } from '../../generate'

jest.mock('../../../services/MailService')
jest.mock('../../../models/Student/queries')
jest.mock('../../../models/Volunteer/queries')

const mockedVolunteerRepo = mocked(VolunteerRepo, true)
const mockedStudentRepo = mocked(StudentRepo, true)

describe('Student session action emails', () => {
  const studentSessionActionJobs: { jobName: string; jobFn: any }[] = [
    {
      jobName: Jobs.EmailStudentAbsentWarning,
      jobFn: MailService.sendStudentAbsentWarning,
    },
    {
      jobName: Jobs.EmailStudentAbsentVolunteerApology,
      jobFn: MailService.sendStudentAbsentVolunteerApology,
    },
    {
      jobName: Jobs.EmailStudentUnmatchedApology,
      jobFn: MailService.sendStudentUnmatchedApology,
    },
  ]

  beforeEach(async () => {
    jest.resetAllMocks()
  })

  for (const currentJob of studentSessionActionJobs) {
    const student = buildStudent()
    const volunteer = buildVolunteer()
    const session = buildSession()

    // @todo: figure out how to properly type

    const job: any = {
      name: currentJob.jobName,
      data: {
        studentId: student._id.toString(),
        volunteerId: volunteer._id.toString(),
        sessionSubtopic: session.subTopic,
        sessionDate: session.createdAt.toISOString(),
      },
    }

    test(`Should execute ${job.name} successfully`, async () => {
      mockedStudentRepo.getStudentContactInfoById.mockImplementation(
        async () => student
      )
      mockedVolunteerRepo.getVolunteerContactInfoById.mockImplementation(
        async () => volunteer
      )
      await emailStudentSessionActions(job)
      expect(currentJob.jobFn).toHaveBeenCalledTimes(1)
    })

    test(`Should not execute ${job.name} if there is no student`, async () => {
      mockedStudentRepo.getStudentContactInfoById.mockImplementation(
        async () => undefined
      )
      mockedVolunteerRepo.getVolunteerContactInfoById.mockImplementation(
        async () => volunteer
      )
      await emailStudentSessionActions(job)
      expect(currentJob.jobFn).toHaveBeenCalledTimes(0)
    })

    test(`Should throw error for ${job.name} when email fails`, async () => {
      const errorMessage = 'Error sending email'
      const rejectionFn = jest.fn(() => Promise.reject(errorMessage))
      currentJob.jobFn.mockImplementationOnce(rejectionFn)
      mockedStudentRepo.getStudentContactInfoById.mockImplementation(
        async () => student
      )
      mockedVolunteerRepo.getVolunteerContactInfoById.mockImplementation(
        async () => volunteer
      )

      await expect(emailStudentSessionActions(job)).rejects.toEqual(
        Error(
          `Failed to email ${job.name} to student ${student._id}: ${errorMessage}`
        )
      )
    })
  }
})
*/
