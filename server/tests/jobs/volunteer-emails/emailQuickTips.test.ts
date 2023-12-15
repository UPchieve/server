test.todo('postgres migration')
/*import { mocked } from 'jest-mock';
import mongoose from 'mongoose'
import { resetDb, insertVolunteer, insertNotification } from '../../db-utils'
import emailQuickTips from '../../../worker/jobs/volunteer-emails/emailQuickTips'
import { log as logger } from '../../../worker/logger'
import { Jobs } from '../../../worker/jobs'
import * as MailService from '../../../services/MailService'
import { buildAvailability } from '../../generate'

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

describe('Volunteer quick tips email', () => {
  beforeEach(async () => {
    jest.resetAllMocks()
  })

  test('Should send quick tips email', async () => {
    const availability = buildAvailability({
      Saturday: { '1p': true, '2p': true },
    })
    const volunteer = await insertVolunteer({ isOnboarded: true, availability })
    // @todo: figure out how to properly type

    const job: any = {
      name: Jobs.EmailVolunteerQuickTips,
      data: {
        volunteerId: volunteer._id,
      },
    }

    await emailQuickTips(job)
    expect(MailService.sendVolunteerQuickTips).toHaveBeenCalledTimes(1)
    expect(logger).toHaveBeenCalledWith(
      `Sent ${job.name} to volunteer ${volunteer._id}`
    )
  })

  test('Should not send quick tips email if volunteer is not onboarded', async () => {
    const volunteer = await insertVolunteer({ isOnboarded: false })
    // @todo: figure out how to properly type

    const job: any = {
      name: Jobs.EmailVolunteerQuickTips,
      data: {
        volunteerId: volunteer._id,
      },
    }

    await emailQuickTips(job)
    expect(MailService.sendVolunteerQuickTips).not.toHaveBeenCalled()
    expect(logger).not.toHaveBeenCalledWith()
  })

  test('Should not send quick tips email if volunteer is onboarded and received text notifications', async () => {
    const volunteer = await insertVolunteer({ isOnboarded: true })
    await insertNotification(volunteer)
    // @todo: figure out how to properly type

    const job: any = {
      name: Jobs.EmailVolunteerQuickTips,
      data: {
        volunteerId: volunteer._id,
      },
    }

    await emailQuickTips(job)
    expect(MailService.sendVolunteerQuickTips).not.toHaveBeenCalled()
    expect(logger).not.toHaveBeenCalledWith()
  })

  test('Should throw error when sending email fails', async () => {
    const availability = buildAvailability({
      Saturday: { '1p': true, '2p': true },
    })
    const volunteer = await insertVolunteer({ isOnboarded: true, availability })
    const errorMessage = 'Unable to send'
    mockedMailService.sendVolunteerQuickTips.mockRejectedValueOnce(errorMessage)
    // @todo: figure out how to properly type

    const job: any = {
      name: Jobs.EmailVolunteerQuickTips,
      data: {
        volunteerId: volunteer._id,
      },
    }

    await expect(emailQuickTips(job)).rejects.toEqual(
      Error(
        `Failed to send ${job.name} to volunteer ${volunteer._id}: ${errorMessage}`
      )
    )
  })
})
*/
