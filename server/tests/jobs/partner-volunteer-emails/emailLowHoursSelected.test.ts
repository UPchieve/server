test.todo('postgres migration')
/*import { mocked } from 'jest-mock';
import mongoose from 'mongoose'
import {
  resetDb,
  insertVolunteer,
  insertNotificationMany,
} from '../../db-utils'
import emailLowHoursSelected from '../../../worker/jobs/partner-volunteer-emails/emailLowHoursSelected'
import { log } from '../../../worker/logger'
import { Jobs } from '../../../worker/jobs'
import * as MailService from '../../../services/MailService'
import {
  buildAvailability,
  buildNotification,
  buildSession,
} from '../../generate'
jest.mock('../../../services/MailService')

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

describe('Partner volunteer low hours selected email', () => {
  beforeEach(async () => {
    jest.resetAllMocks()
  })

  test('Should send email to partner volunteer', async () => {
    const pastSessions = [buildSession()._id]
    const availability = buildAvailability({
      Saturday: { '1p': true, '2p': true },
    })
    const volunteer = await insertVolunteer({
      isOnboarded: true,
      pastSessions,
      availability,
      volunteerPartnerOrg: 'example',
    })
    // TODO: figure out how to properly type
    const job: any = {
      name: Jobs.EmailPartnerVolunteerLowHoursSelected,
      data: {
        volunteerId: volunteer._id,
      },
    }

    await emailLowHoursSelected(job)
    expect(
      MailService.sendPartnerVolunteerLowHoursSelected
    ).toHaveBeenCalledTimes(1)
    expect(log).toHaveBeenCalledWith(
      `Sent ${job.name} to volunteer ${volunteer._id}`
    )
  })

  test('Should not send email if volunteer is not onboarded', async () => {
    const volunteer = await insertVolunteer({ isOnboarded: false })
    // @todo: figure out how to properly type

    const job: any = {
      name: Jobs.EmailPartnerVolunteerLowHoursSelected,
      data: {
        volunteerId: volunteer._id,
      },
    }

    await emailLowHoursSelected(job)
    expect(
      MailService.sendPartnerVolunteerLowHoursSelected
    ).not.toHaveBeenCalled()
    expect(log).not.toHaveBeenCalledWith()
  })

  test('Should not send email if volunteer is onboarded and received more than 2 text notifications', async () => {
    const volunteer = await insertVolunteer({
      isOnboarded: true,
      volunteerPartnerOrg: 'example',
    })
    const notifications = [
      buildNotification({ volunteer: volunteer._id }),
      buildNotification({ volunteer: volunteer._id }),
      buildNotification({ volunteer: volunteer._id }),
    ]
    await insertNotificationMany(notifications)
    // @todo: figure out how to properly type

    const job: any = {
      name: Jobs.EmailPartnerVolunteerLowHoursSelected,
      data: {
        volunteerId: volunteer._id,
      },
    }

    await emailLowHoursSelected(job)
    expect(
      MailService.sendPartnerVolunteerLowHoursSelected
    ).not.toHaveBeenCalled()
    expect(log).not.toHaveBeenCalledWith()
  })

  test('Should not send email if onboarded partner volunteer, has 5+ hours of availability, and received more than 2 text notifications', async () => {
    const availability = buildAvailability({
      Saturday: {
        '1p': true,
        '2p': true,
        '3p': true,
        '4p': true,
        '5p': true,
        '6p': true,
      },
    })
    const volunteer = await insertVolunteer({
      isOnboarded: true,
      volunteerPartnerOrg: 'example',
      availability,
    })
    const notifications = [
      buildNotification({ volunteer: volunteer._id }),
      buildNotification({ volunteer: volunteer._id }),
      buildNotification({ volunteer: volunteer._id }),
    ]
    await insertNotificationMany(notifications)
    const job: any = {
      name: Jobs.EmailPartnerVolunteerLowHoursSelected,
      data: {
        volunteerId: volunteer._id,
      },
    }

    await emailLowHoursSelected(job)
    expect(
      MailService.sendPartnerVolunteerLowHoursSelected
    ).not.toHaveBeenCalled()
    expect(log).not.toHaveBeenCalledWith()
  })

  test('Should throw error when sending email fails', async () => {
    const pastSessions = [buildSession()._id]
    const availability = buildAvailability({
      Saturday: { '1p': true, '2p': true },
    })
    const volunteer = await insertVolunteer({
      isOnboarded: true,
      pastSessions,
      availability,
      volunteerPartnerOrg: 'example',
    })
    const errorMessage = 'Unable to send'
    mockedMailService.sendPartnerVolunteerLowHoursSelected.mockRejectedValueOnce(
      errorMessage
    )
    // @todo: figure out how to properly type

    const job: any = {
      name: Jobs.EmailPartnerVolunteerLowHoursSelected,
      data: {
        volunteerId: volunteer._id,
      },
    }

    await expect(emailLowHoursSelected(job)).rejects.toEqual(
      Error(
        `Failed to send ${job.name} to volunteer ${volunteer._id}: ${errorMessage}`
      )
    )
  })
})
*/
