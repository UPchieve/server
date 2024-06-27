test.todo('postgres migration')
/*import { mocked } from 'jest-mock';
import mongoose from 'mongoose'
import { resetDb, insertSessionWithVolunteer } from '../../db-utils'
import emailStudentFirstSessionCongrats from '../../../worker/jobs/student-emails/emailStudentFirstSessionCongrats'
import { log as logger } from '../../../worker/logger'
import { Jobs } from '../../../worker/jobs'
import * as MailService from '../../../services/MailService'
import { USER_SESSION_METRICS } from '../../../constants'

jest.mock('../../../services/MailService')
jest.setTimeout(1000 * 15)

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

describe('Student first session congrats email', () => {
  beforeEach(async () => {
    jest.resetAllMocks()
  })

  test('Should send email', async () => {
    const { session, student } = await insertSessionWithVolunteer()
    // @todo: figure out how to properly type

    const job: any = {
      name: Jobs.EmailStudentFirstSessionCongrats,
      data: {
        sessionId: session._id,
      },
    }

    await emailStudentFirstSessionCongrats(job)
    expect(MailService.sendStudentFirstSessionCongrats).toHaveBeenCalledTimes(1)
    expect(logger).toHaveBeenCalledWith(
      `Sent ${job.name} to student ${student._id}`
    )
  })

  test(`Should not send email if session flags: ${USER_SESSION_METRICS.absentStudent}, ${USER_SESSION_METRICS.lowCoachRatingFromStudent}, or ${USER_SESSION_METRICS.lowSessionRatingFromStudent} is present on the session`, async () => {
    const { session } = await insertSessionWithVolunteer({
      flags: [USER_SESSION_METRICS.absentStudent],
    })
    // @todo: figure out how to properly type

    const job: any = {
      name: Jobs.EmailStudentFirstSessionCongrats,
      data: {
        sessionId: session._id,
      },
    }

    await emailStudentFirstSessionCongrats(job)
    expect(MailService.sendStudentFirstSessionCongrats).toHaveBeenCalledTimes(0)
  })

  test('Should throw error when sending email fails', async () => {
    const { session, student } = await insertSessionWithVolunteer()
    const errorMessage = 'Unable to send'
    const rejectionFn = jest.fn(() => Promise.reject(errorMessage))
    mockedMailService.sendStudentFirstSessionCongrats.mockRejectedValueOnce(
      errorMessage
    )
    // @todo: figure out how to properly type

    const job: any = {
      name: Jobs.EmailStudentFirstSessionCongrats,
      data: {
        sessionId: session._id,
      },
    }

    await expect(emailStudentFirstSessionCongrats(job)).rejects.toEqual(
      Error(
        `Failed to send ${job.name} to student ${student._id}: ${errorMessage}`
      )
    )
  })
})
*/
