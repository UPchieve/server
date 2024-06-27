test.todo('postgres migration')
/*import { mocked } from 'jest-mock';
import mongoose from 'mongoose'
import { resetDb, insertStudent } from '../../db-utils'
import emailStudentOnboardingSeries from '../../../worker/jobs/student-emails/emailStudentOnboardingSeries'
import { log as logger } from '../../../worker/logger'
import { Jobs } from '../../../worker/jobs'
import * as MailService from '../../../services/MailService'

jest.mock('../../../services/MailService')

const mockedMailService = mocked(MailService, true)

// db connection
beforeAll(async () => {
  await mongoose.connect(global.__MONGO_URI__)
})

afterAll(async () => {
  await mongoose.connection.close()
})

beforeEach(async () => {
  await resetDb()
})

describe('Student onboarding email series', () => {
  const studentWelcomeSeriesJobs = [
    Jobs.EmailStudentOnboardingHowItWorks,
    Jobs.EmailMeetOurVolunteers,
    Jobs.EmailStudentOnboardingMission,
    Jobs.EmailStudentOnboardingSurvey,
  ]

  const oldStudentWelcomeSeriesJobs = [
    Jobs.EmailStudentUseCases,
    Jobs.EmailMeetOurVolunteers,
    Jobs.EmailIndependentLearning,
    Jobs.EmailStudentGoalSetting,
  ]

  beforeEach(async () => {
    jest.resetAllMocks()
  })

  test('Should send all student onboarding series jobs', async () => {
    const student = await insertStudent()
    for (const currentJob of studentWelcomeSeriesJobs) {
      // @todo: figure out how to properly type

      const job: any = {
        name: currentJob,
        data: {
          studentId: student._id,
        },
      }

      await emailStudentOnboardingSeries(job)
      expect(logger).toHaveBeenCalledWith(
        `Emailed ${currentJob} to student ${student._id}`
      )
    }
  })

  test('Should send deprecated student onboarding series jobs', async () => {
    const student = await insertStudent()
    for (const currentJob of oldStudentWelcomeSeriesJobs) {
      // @todo: figure out how to properly type

      const job: any = {
        name: currentJob,
        data: {
          studentId: student._id,
        },
      }

      await emailStudentOnboardingSeries(job)
      expect(logger).toHaveBeenCalledWith(
        `Emailed ${currentJob} to student ${student._id}`
      )
    }
  })

  test('Should throw error when sending student onboarding series email fails', async () => {
    const student = await insertStudent()
    const errorMessage = 'Error sending email'
    const rejectionFn = jest.fn(() => Promise.reject(errorMessage))
    mockedMailService.sendStudentOnboardingHowItWorks.mockImplementationOnce(
      rejectionFn
    )
    mockedMailService.sendMeetOurVolunteers.mockImplementationOnce(rejectionFn)
    mockedMailService.sendStudentOnboardingMission.mockImplementationOnce(
      rejectionFn
    )
    mockedMailService.sendStudentOnboardingSurvey.mockImplementationOnce(
      rejectionFn
    )

    for (const currentJob of studentWelcomeSeriesJobs) {
      // @todo: figure out how to properly type

      const job: any = {
        name: currentJob,
        data: {
          studentId: student._id,
        },
      }

      await expect(emailStudentOnboardingSeries(job)).rejects.toEqual(
        Error(
          `Failed to email ${currentJob} to student ${student._id}: ${errorMessage}`
        )
      )
    }
  })

  test('Should not email a student who is banned', async () => {
    const student = await insertStudent({ isBanned: true })
    for (const currentJob of studentWelcomeSeriesJobs) {
      // @todo: figure out how to properly type

      const job: any = {
        name: currentJob,
        data: {
          studentId: student._id,
        },
      }

      await emailStudentOnboardingSeries(job)
      expect(logger).not.toHaveBeenCalled()
      expect(logger).not.toHaveBeenCalled()
    }
  })
})
*/
