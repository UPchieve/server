test.todo('postgres migration')
/*import { mocked } from 'jest-mock';
import mongoose from 'mongoose'
import { resetDb, insertSessionWithVolunteer } from '../../db-utils'
import emailVolunteerFirstSessionCongrats from '../../../worker/jobs/volunteer-emails/emailVolunteerFirstSessionCongrats'
import { log as logger } from '../../../worker/logger'
import { Jobs } from '../../../worker/jobs'
import * as MailService from '../../../services/MailService'
import { USER_SESSION_METRICS } from '../../../constants'

jest.mock('../../../services/MailService')
jest.setTimeout(1000 * 15)

const mockedMailService = mocked(MailService, true)

// TODO: refactor test to mock out DB calls

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

describe('Volunteer first session congrats email', () => {
  beforeEach(async () => {
    jest.resetAllMocks()
  })

  test('Should send email', async () => {
    const { session, volunteer } = await insertSessionWithVolunteer()
    // @todo: figure out how to properly type

    const job: any = {
      name: Jobs.EmailVolunteerFirstSessionCongrats,
      data: {
        sessionId: session._id,
      },
    }

    await emailVolunteerFirstSessionCongrats(job)
    expect(MailService.sendVolunteerFirstSessionCongrats).toHaveBeenCalledTimes(
      1
    )
    expect(logger).toHaveBeenCalledWith(
      `Sent ${job.name} to volunteer ${volunteer._id}`
    )
  })

  test(`Should not send email if session flags: ${USER_SESSION_METRICS.absentStudent}, ${USER_SESSION_METRICS.absentVolunteer}, or ${USER_SESSION_METRICS.lowSessionRatingFromCoach} is present on the session`, async () => {
    const { session } = await insertSessionWithVolunteer({
      flags: [USER_SESSION_METRICS.absentStudent],
    })
    // @todo: figure out how to properly type

    const job: any = {
      name: Jobs.EmailVolunteerFirstSessionCongrats,
      data: {
        sessionId: session._id,
      },
    }

    await emailVolunteerFirstSessionCongrats(job)
    expect(MailService.sendVolunteerFirstSessionCongrats).toHaveBeenCalledTimes(
      0
    )
  })

  test('Should throw error when sending email saild', async () => {
    const { session, volunteer } = await insertSessionWithVolunteer()
    const errorMessage = 'Unable to send'
    mockedMailService.sendVolunteerFirstSessionCongrats.mockRejectedValueOnce(
      errorMessage
    )
    // @todo: figure out how to properly type

    const job: any = {
      name: Jobs.EmailVolunteerFirstSessionCongrats,
      data: {
        sessionId: session._id,
      },
    }

    await expect(emailVolunteerFirstSessionCongrats(job)).rejects.toEqual(
      Error(
        `Failed to send ${job.name} to volunteer ${volunteer._id}: ${errorMessage}`
      )
    )
  })
})
*/
