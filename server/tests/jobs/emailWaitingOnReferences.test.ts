import mongoose from 'mongoose'
import emailWaitingOnReferences from '../../worker/jobs/emailWaitingOnReferences'
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
const fiveDays = oneDay * 5
const sixDays = oneDay * 6

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

describe('Email waiting on references to volunteer', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should only send emails to volunteers with references submitted 5 days ago', async () => {
    const volunteerOne = buildVolunteer({
      references: [
        buildReference({
          status: REFERENCE_STATUS.SENT,
          sentAt: new Date(Date.now() - fiveDays - oneHour * 3)
        }),
        buildReference({
          status: REFERENCE_STATUS.SUBMITTED
        })
      ]
    })

    const volunteerTwo = buildVolunteer({
      references: [
        buildReference({
          status: REFERENCE_STATUS.SENT,
          sentAt: new Date(Date.now() - sixDays - oneDay)
        }),
        buildReference({
          status: REFERENCE_STATUS.SENT,
          sentAt: new Date(Date.now() - sixDays - fiveDays)
        })
      ]
    })

    const volunteerThree = buildVolunteer({
      references: [
        buildReference({
          status: REFERENCE_STATUS.SUBMITTED,
          sentAt: new Date(Date.now() - fiveDays - oneHour * 3)
        }),
        buildReference({
          status: REFERENCE_STATUS.SUBMITTED,
          sentAt: new Date(Date.now() - sixDays - fiveDays)
        })
      ]
    })

    await Promise.all([
      insertVolunteer(volunteerOne),
      insertVolunteer(volunteerTwo),
      insertVolunteer(volunteerThree)
    ])
    await emailWaitingOnReferences()

    const expectedEmailsSent = 1
    expect(logEmailJobSent).toHaveBeenCalledWith({
      job: Jobs.EmailWaitingOnReferences,
      userId: volunteerOne._id
    })
    expect(logger.info).toHaveBeenCalledWith(
      `Sent ${Jobs.EmailWaitingOnReferences} to ${expectedEmailsSent} volunteers`
    )
    expect(
      (MailService.sendWaitingOnReferences as jest.Mock).mock.calls.length
    ).toBe(expectedEmailsSent)
  })

  test('Should catch error when a problem with sending the email occurs', async () => {
    const volunteer = buildVolunteer({
      references: [
        buildReference({
          status: REFERENCE_STATUS.SENT,
          sentAt: new Date(Date.now() - fiveDays - oneHour * 3)
        }),
        buildReference({
          status: REFERENCE_STATUS.SUBMITTED
        })
      ]
    })

    await insertVolunteer(volunteer)
    const customErrorMessage = 'Unable to send'

    MailService.sendWaitingOnReferences = jest.fn(() => {
      throw new Error(customErrorMessage)
    })
    await emailWaitingOnReferences()

    const expectedEmailsSent = 0
    expect(logEmailJobError).toHaveBeenCalledWith({
      job: Jobs.EmailWaitingOnReferences,
      userId: volunteer._id,
      error: new Error(customErrorMessage)
    })
    expect(logger.info).toHaveBeenCalledWith(
      `Sent ${Jobs.EmailWaitingOnReferences} to ${expectedEmailsSent} volunteers`
    )
  })
})
