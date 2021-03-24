import mongoose from 'mongoose'
import emailReferenceFollowup from '../../worker/jobs/emailReferenceFollowup'
import { insertVolunteer, resetDb } from '../db-utils'
import { buildVolunteer, buildReference } from '../generate'
import MailService from '../../services/MailService'
import { REFERENCE_STATUS } from '../../constants'
import logger, { logEmailJobSent, logEmailJobError } from '../../logger'
import { Jobs } from '../../worker/jobs'
jest.mock('../../services/MailService')
jest.mock('../../logger')

const oneHour = 1000 * 60 * 60 * 1
const oneDay = oneHour * 24 * 1
const threeDays = oneDay * 3

// db connection
beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true
  })
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
        sentAt: new Date(Date.now() - threeDays - oneHour * 3)
      }),
      buildReference({
        status: REFERENCE_STATUS.UNSENT
      })
    ]
    await Promise.all([insertVolunteer(buildVolunteer({ references }))])
    await emailReferenceFollowup()

    const expectedEmailsSent = 1
    expect(logger.info).toHaveBeenCalledWith(
      `Sent ${Jobs.EmailReferenceFollowup} to ${expectedEmailsSent} references`
    )
    expect(logEmailJobSent).toHaveBeenCalledWith({
      job: Jobs.EmailReferenceFollowup,
      userId: references[0]._id,
      userType: 'reference'
    })

    expect(
      (MailService.sendReferenceFollowup as jest.Mock).mock.calls.length
    ).toBe(expectedEmailsSent)
  })

  test('Should not send emails to references with status SENT and sentAt not 3 days ago', async () => {
    const references = [
      buildReference({
        status: REFERENCE_STATUS.SENT,
        sentAt: new Date(Date.now() - oneDay)
      }),
      buildReference({
        status: REFERENCE_STATUS.SENT,
        sentAt: new Date(Date.now() - threeDays - oneDay - oneHour)
      })
    ]
    await Promise.all([insertVolunteer(buildVolunteer({ references }))])
    await emailReferenceFollowup()

    const expectedEmailsSent = 0
    expect(logger.info).toHaveBeenCalledWith(
      `No references to send ${Jobs.EmailReferenceFollowup}`
    )
    expect(
      (MailService.sendReferenceFollowup as jest.Mock).mock.calls.length
    ).toBe(expectedEmailsSent)
  })

  test('Should catch error when a problem with sending the email occurs', async () => {
    const referenceOne = buildReference({
      status: REFERENCE_STATUS.SENT,
      sentAt: new Date(Date.now() - threeDays - oneHour * 3)
    })
    const references = [
      referenceOne,
      buildReference({
        status: REFERENCE_STATUS.SENT,
        sentAt: new Date(Date.now() - oneDay)
      })
    ]

    const customErrorMessage = 'Unable to send'

    MailService.sendReferenceFollowup = jest.fn(() => {
      throw new Error(customErrorMessage)
    })

    await Promise.all([insertVolunteer(buildVolunteer({ references }))])
    await emailReferenceFollowup()

    const expectedEmailsSent = 0
    expect(logEmailJobError).toHaveBeenCalledWith({
      job: Jobs.EmailReferenceFollowup,
      userId: referenceOne._id,
      userType: 'reference',
      error: new Error(customErrorMessage)
    })
    expect(logger.info).toHaveBeenCalledWith(
      `Sent ${Jobs.EmailReferenceFollowup} to ${expectedEmailsSent} references`
    )
  })
})
