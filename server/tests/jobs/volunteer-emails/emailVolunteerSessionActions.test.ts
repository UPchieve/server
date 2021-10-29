import { mocked } from 'ts-jest/utils'
import { Jobs } from '../../../worker/jobs'
import * as MailService from '../../../services/MailService'
import * as VolunteerRepo from '../../../models/Volunteer/queries'
import * as StudentRepo from '../../../models/Student/queries'
import { buildSession, buildStudent, buildVolunteer } from '../../generate'
import emailVolunteerSessionActions from '../../../worker/jobs/volunteer-emails/emailVolunteerSessionActions'

jest.mock('../../../services/MailService')
jest.mock('../../../models/Student/queries')
jest.mock('../../../models/Volunteer/queries')

const mockedVolunteerRepo = mocked(VolunteerRepo, true)
const mockedStudentRepo = mocked(StudentRepo, true)

describe('Volunteer session action emails', () => {
  const volunteerSessionActionJobs: { jobName: string; jobFn: any }[] = [
    {
      jobName: Jobs.EmailVolunteerAbsentWarning,
      jobFn: MailService.sendVolunteerAbsentWarning,
    },
    {
      jobName: Jobs.EmailVolunteerAbsentStudentApology,
      jobFn: MailService.sendVolunteerAbsentStudentApology,
    },
  ]

  beforeEach(async () => {
    jest.resetAllMocks()
  })

  for (const currentJob of volunteerSessionActionJobs) {
    const student = buildStudent()
    const volunteer = buildVolunteer()
    const session = buildSession()

    // @todo: figure out how to properly type

    const job: any = {
      name: currentJob.jobName,
      data: {
        studentId: student._id,
        volunteerId: volunteer._id,
        sessionSubject: session.subTopic,
        sessionDate: session.createdAt,
      },
    }

    test(`Should execute ${job.name} successfully`, async () => {
      mockedStudentRepo.getStudentContactInfoById.mockResolvedValueOnce(student)
      mockedVolunteerRepo.getVolunteerContactInfoById.mockResolvedValueOnce(
        volunteer
      )
      await emailVolunteerSessionActions(job)
      expect(currentJob.jobFn).toHaveBeenCalledTimes(1)
    })

    test(`Should not execute ${job.name} if there is no volunteer`, async () => {
      mockedStudentRepo.getStudentContactInfoById.mockResolvedValueOnce(student)
      mockedVolunteerRepo.getVolunteerContactInfoById.mockResolvedValueOnce(
        undefined
      )
      await emailVolunteerSessionActions(job)
      expect(currentJob.jobFn).toHaveBeenCalledTimes(0)
    })

    test(`Should throw error for ${job.name} when email fails`, async () => {
      const errorMessage = 'Error sending email'
      currentJob.jobFn.mockRejectedValueOnce(errorMessage)
      mockedStudentRepo.getStudentContactInfoById.mockResolvedValueOnce(student)
      mockedVolunteerRepo.getVolunteerContactInfoById.mockResolvedValueOnce(
        volunteer
      )

      await expect(emailVolunteerSessionActions(job)).rejects.toEqual(
        Error(
          `Failed to email ${job.name} to volunteer ${volunteer._id}: ${errorMessage}`
        )
      )
    })
  }
})
