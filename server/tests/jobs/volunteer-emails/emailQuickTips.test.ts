import mongoose from 'mongoose'
import { resetDb, insertVolunteer, insertNotification } from '../../db-utils'
import emailQuickTips from '../../../worker/jobs/volunteer-emails/emailQuickTips'
import logger from '../../../logger'
import { Jobs } from '../../../worker/jobs'
import MailService from '../../../services/MailService'
import { buildAvailability } from '../../generate'
jest.mock('../../../logger')
jest.mock('../../../services/MailService')

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

describe('Volunteer quick tips email', () => {
  beforeEach(async () => {
    jest.resetAllMocks()
  })

  test('Should send quick tips email', async () => {
    const availability = buildAvailability({
      Saturday: { '1p': true, '2p': true }
    })
    const volunteer = await insertVolunteer({ isOnboarded: true, availability })
    // @todo: figure out how to properly type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const job: any = {
      name: Jobs.EmailVolunteerQuickTips,
      data: {
        volunteerId: volunteer._id
      }
    }

    await emailQuickTips(job)
    expect(MailService.sendVolunteerQuickTips).toHaveBeenCalledTimes(1)
    expect(logger.info).toHaveBeenCalledWith(
      `Sent ${job.name} to volunteer ${volunteer._id}`
    )
  })

  test('Should not send quick tips email if volunteer is not onboarded', async () => {
    const volunteer = await insertVolunteer({ isOnboarded: false })
    // @todo: figure out how to properly type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const job: any = {
      name: Jobs.EmailVolunteerQuickTips,
      data: {
        volunteerId: volunteer._id
      }
    }

    await emailQuickTips(job)
    expect(MailService.sendVolunteerQuickTips).not.toHaveBeenCalled()
    expect(logger.info).not.toHaveBeenCalledWith()
  })

  test('Should not send quick tips email if volunteer is onboarded and received text notifications', async () => {
    const volunteer = await insertVolunteer({ isOnboarded: true })
    await insertNotification(volunteer)
    // @todo: figure out how to properly type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const job: any = {
      name: Jobs.EmailVolunteerQuickTips,
      data: {
        volunteerId: volunteer._id
      }
    }

    await emailQuickTips(job)
    expect(MailService.sendVolunteerQuickTips).not.toHaveBeenCalled()
    expect(logger.info).not.toHaveBeenCalledWith()
  })

  test('Should throw error when sending email fails', async () => {
    const availability = buildAvailability({
      Saturday: { '1p': true, '2p': true }
    })
    const volunteer = await insertVolunteer({ isOnboarded: true, availability })
    const errorMessage = 'Unable to send'
    const rejectionFn = jest.fn(() => Promise.reject(errorMessage))
    MailService.sendVolunteerQuickTips = rejectionFn
    // @todo: figure out how to properly type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const job: any = {
      name: Jobs.EmailVolunteerQuickTips,
      data: {
        volunteerId: volunteer._id
      }
    }

    await expect(emailQuickTips(job)).rejects.toEqual(
      Error(
        `Failed to send ${job.name} to volunteer ${volunteer._id}: ${errorMessage}`
      )
    )
  })
})
