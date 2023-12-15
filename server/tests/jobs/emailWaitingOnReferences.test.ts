test.todo('postgres migration')
/*import { mocked } from 'jest-mock';
import mongoose from 'mongoose'
import emailWaitingOnReferences from '../../worker/jobs/emailWaitingOnReferences'
import { insertVolunteer, resetDb } from '../db-utils'
import { buildVolunteer, buildReference } from '../generate'
import * as MailService from '../../services/MailService'
import { REFERENCE_STATUS } from '../../constants'
import { log } from '../../worker/logger'
import { Jobs } from '../../worker/jobs'
jest.mock('../../services/MailService')
jest.mock('../../worker/logger')
jest.setTimeout(1000 * 25)

// TODO: refactor test to mock out DB calls

const mockedMailService = mocked(MailService, true)

const oneHour = 1000 * 60 * 60 * 1
const oneDay = oneHour * 24 * 1
const fiveDays = oneDay * 5
const sixDays = oneDay * 6

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

describe('Email waiting on references to volunteer', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should only send emails to volunteers with references submitted 5 days ago', async () => {
    const volunteerOne = buildVolunteer({
      references: [
        buildReference({
          status: REFERENCE_STATUS.SENT,
          sentAt: new Date(Date.now() - fiveDays - oneHour * 3),
        }),
        buildReference({
          status: REFERENCE_STATUS.SUBMITTED,
        }),
      ],
    })

    const volunteerTwo = buildVolunteer({
      references: [
        buildReference({
          status: REFERENCE_STATUS.SENT,
          sentAt: new Date(Date.now() - sixDays - oneDay),
        }),
        buildReference({
          status: REFERENCE_STATUS.SENT,
          sentAt: new Date(Date.now() - sixDays - fiveDays),
        }),
      ],
    })

    const volunteerThree = buildVolunteer({
      references: [
        buildReference({
          status: REFERENCE_STATUS.SUBMITTED,
          sentAt: new Date(Date.now() - fiveDays - oneHour * 3),
        }),
        buildReference({
          status: REFERENCE_STATUS.SUBMITTED,
          sentAt: new Date(Date.now() - sixDays - fiveDays),
        }),
      ],
    })

    await Promise.all([
      insertVolunteer(volunteerOne),
      insertVolunteer(volunteerTwo),
      insertVolunteer(volunteerThree),
    ])
    await emailWaitingOnReferences()

    const expectedEmailsSent = 1
    expect(log).toHaveBeenCalledWith(
      `Sent ${Jobs.EmailWaitingOnReferences} to ${expectedEmailsSent}`
    )

    expect(
      (MailService.sendWaitingOnReferences as jest.Mock).mock.calls.length
    ).toBe(expectedEmailsSent)
  })

  test('Should throw error when sending email fails', async () => {
    const volunteer = buildVolunteer({
      references: [
        buildReference({
          status: REFERENCE_STATUS.SENT,
          sentAt: new Date(Date.now() - fiveDays - oneHour * 3),
        }),
        buildReference({
          status: REFERENCE_STATUS.SUBMITTED,
        }),
      ],
    })

    await insertVolunteer(volunteer)
    const errorMessage = 'Unable to send'
    const volunteerError = `volunteer ${volunteer._id}: ${errorMessage}`
    mockedMailService.sendWaitingOnReferences.mockRejectedValueOnce(
      errorMessage
    )

    await expect(emailWaitingOnReferences()).rejects.toEqual(
      Error(
        `Failed to send ${Jobs.EmailWaitingOnReferences} to: ${volunteerError}`
      )
    )

    const expectedEmailsSent = 0
    expect(log).toHaveBeenCalledWith(
      `Sent ${Jobs.EmailWaitingOnReferences} to ${expectedEmailsSent}`
    )
  })
})
*/
