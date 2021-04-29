import mongoose from 'mongoose'
import { resetDb, insertSessionWithVolunteer } from '../../db-utils'
import emailStudentFirstSessionCongrats from '../../../worker/jobs/student-emails/emailStudentFirstSessionCongrats'
import logger from '../../../logger'
import { Jobs } from '../../../worker/jobs'
import MailService from '../../../services/MailService'
import { SESSION_FLAGS } from '../../../constants'
jest.mock('../../../logger')
jest.mock('../../../services/MailService')

// db connection
beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})

beforeEach(async () => {
  await resetDb()
})

describe('Student first session congrats email', () => {
  beforeEach(async () => {
    jest.resetAllMocks()
  })

  test('Should send email', async () => {
    const { session, student } = await insertSessionWithVolunteer()
    // @todo: figure out how to properly type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const job: any = {
      name: Jobs.EmailStudentFirstSessionCongrats,
      data: {
        sessionId: session._id
      }
    }

    await emailStudentFirstSessionCongrats(job)
    expect(MailService.sendStudentFirstSessionCongrats).toHaveBeenCalledTimes(1)
    expect(logger.info).toHaveBeenCalledWith(
      `Sent ${job.name} to student ${student._id}`
    )
  })

  test(`Should not send email if session flags: ${SESSION_FLAGS.ABSENT_USER}, ${SESSION_FLAGS.LOW_MESSAGES}, or ${SESSION_FLAGS.STUDENT_RATING} is present on the session`, async () => {
    const { session } = await insertSessionWithVolunteer({
      flags: [SESSION_FLAGS.LOW_MESSAGES]
    })
    // @todo: figure out how to properly type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const job: any = {
      name: Jobs.EmailStudentFirstSessionCongrats,
      data: {
        sessionId: session._id
      }
    }

    await emailStudentFirstSessionCongrats(job)
    expect(MailService.sendStudentFirstSessionCongrats).toHaveBeenCalledTimes(0)
  })

  test('Should throw error when sending email fails', async () => {
    const { session, student } = await insertSessionWithVolunteer()
    const errorMessage = 'Unable to send'
    const rejectionFn = jest.fn(() => Promise.reject(errorMessage))
    MailService.sendStudentFirstSessionCongrats = rejectionFn
    // @todo: figure out how to properly type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const job: any = {
      name: Jobs.EmailStudentFirstSessionCongrats,
      data: {
        sessionId: session._id
      }
    }

    await expect(emailStudentFirstSessionCongrats(job)).rejects.toEqual(
      Error(
        `Failed to send ${job.name} to student ${student._id}: ${errorMessage}`
      )
    )
  })
})
