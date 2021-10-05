import mongoose from 'mongoose'
import { resetDb, insertStudent } from '../../db-utils'
import emailStudentWelcomeSeries from '../../../worker/jobs/student-emails/emailStudentWelcomeSeries'
import logger from '../../../logger'
import { Jobs } from '../../../worker/jobs'
import MailService from '../../../services/MailService'

jest.mock('../../../services/MailService')

// db connection
beforeAll(async () => {
  await mongoose.connect(global.__MONGO_URI__, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})

beforeEach(async () => {
  await resetDb()
})

describe('Student welcome email series', () => {
  const studentWelcomeSeriesJobs = [
    Jobs.EmailStudentUseCases,
    Jobs.EmailMeetOurVolunteers,
    Jobs.EmailIndependentLearning,
    Jobs.EmailStudentGoalSetting
  ]

  beforeEach(async () => {
    jest.resetAllMocks()
  })

  test('Should send all student welcome series jobs', async () => {
    const student = await insertStudent()
    for (const currentJob of studentWelcomeSeriesJobs) {
      // @todo: figure out how to properly type
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const job: any = {
        name: currentJob,
        data: {
          studentId: student._id
        }
      }

      await emailStudentWelcomeSeries(job)
      expect(logger.info).toHaveBeenCalledWith(
        `Emailed ${currentJob} to student ${student._id}`
      )
    }
  })

  test('Should throw error when sending student welcome series email fails', async () => {
    const student = await insertStudent()
    const errorMessage = 'Error sending email'
    const rejectionFn = jest.fn(() => Promise.reject(errorMessage))
    MailService.sendStudentUseCases = rejectionFn
    MailService.sendMeetOurVolunteers = rejectionFn
    MailService.sendIndependentLearning = rejectionFn
    MailService.sendStudentGoalSetting = rejectionFn

    for (const currentJob of studentWelcomeSeriesJobs) {
      // @todo: figure out how to properly type
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const job: any = {
        name: currentJob,
        data: {
          studentId: student._id
        }
      }

      await expect(emailStudentWelcomeSeries(job)).rejects.toEqual(
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const job: any = {
        name: currentJob,
        data: {
          studentId: student._id
        }
      }

      await emailStudentWelcomeSeries(job)
      expect(logger.info).not.toHaveBeenCalled()
      expect(logger.error).not.toHaveBeenCalled()
    }
  })
})
