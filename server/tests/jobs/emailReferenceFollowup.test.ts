test.todo('postgres migration')
/*import { mocked } from 'jest-mock';
import mongoose from 'mongoose'
import emailReferenceFollowup from '../../worker/jobs/emailReferenceFollowup'
import { insertVolunteer, resetDb } from '../db-utils'
import { buildVolunteer, buildReference } from '../generate'
import * as MailService from '../../services/MailService'
import { REFERENCE_STATUS } from '../../constants'
import { log } from '../../worker/logger'
import { Jobs } from '../../worker/jobs'
jest.mock('../../services/MailService')
jest.mock('../../worker/logger')
jest.setTimeout(1000 * 15)

// TODO: refactor test to mock out DB calls

const mockedMailService = mocked(MailService, true)

const oneHour = 1000 * 60 * 60 * 1
const oneDay = oneHour * 24 * 1
const threeDays = oneDay * 3

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

describe('Follow-up email to references', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should only send emails to reference with status SENT and sentAt 3 days ago', async () => {
    const references = [
      buildReference({
        status: REFERENCE_STATUS.SENT,
        sentAt: new Date(Date.now() - threeDays - oneHour * 3),
      }),
      buildReference({
        status: REFERENCE_STATUS.UNSENT,
      }),
    ]
    await Promise.all([insertVolunteer(buildVolunteer({ references }))])
    await emailReferenceFollowup()

    const expectedEmailsSent = 1
    expect(log).toHaveBeenCalledWith(
      `Sent ${Jobs.EmailReferenceFollowup} to ${expectedEmailsSent} references.`
    )

    expect(
      (MailService.sendReferenceFollowup as jest.Mock).mock.calls.length
    ).toBe(expectedEmailsSent)
  })

  test('Should not send emails to references with status SENT and sentAt not 3 days ago', async () => {
    const references = [
      buildReference({
        status: REFERENCE_STATUS.SENT,
        sentAt: new Date(Date.now() - oneDay),
      }),
      buildReference({
        status: REFERENCE_STATUS.SENT,
        sentAt: new Date(Date.now() - threeDays - oneDay - oneHour),
      }),
    ]
    await Promise.all([insertVolunteer(buildVolunteer({ references }))])
    await emailReferenceFollowup()

    const expectedEmailsSent = 0
    expect(log).toHaveBeenCalledWith('No references to email for a follow-up')
    expect(
      (MailService.sendReferenceFollowup as jest.Mock).mock.calls.length
    ).toBe(expectedEmailsSent)
  })

  test('Should throw error when sending email fails', async () => {
    const referenceOne = buildReference({
      status: REFERENCE_STATUS.SENT,
      sentAt: new Date(Date.now() - threeDays - oneHour * 3),
    })
    const references = [
      referenceOne,
      buildReference({
        status: REFERENCE_STATUS.SENT,
        sentAt: new Date(Date.now() - oneDay),
      }),
    ]

    const errorMessage = 'Unable to send'
    const referenceOneError = `reference ${referenceOne._id}: ${errorMessage}`
    mockedMailService.sendReferenceFollowup.mockRejectedValueOnce(errorMessage)

    await Promise.all([insertVolunteer(buildVolunteer({ references }))])
    await expect(emailReferenceFollowup()).rejects.toEqual(
      Error(
        `Failed to send ${Jobs.EmailReferenceFollowup} to: ${referenceOneError}`
      )
    )

    const expectedEmailsSent = 0
    expect(log).toHaveBeenCalledWith(
      `Sent ${Jobs.EmailReferenceFollowup} to ${expectedEmailsSent} references.`
    )
  })
})
*/
