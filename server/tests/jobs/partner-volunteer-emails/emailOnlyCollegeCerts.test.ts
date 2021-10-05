import mongoose from 'mongoose'
import {
  resetDb,
  insertVolunteer,
  insertNotificationMany
} from '../../db-utils'
import emailOnlyCollegeCerts from '../../../worker/jobs/partner-volunteer-emails/emailOnlyCollegeCerts'
import logger from '../../../logger'
import { Jobs } from '../../../worker/jobs'
import MailService from '../../../services/MailService'
import { buildNotification } from '../../generate'
import { SUBJECTS } from '../../../constants'
jest.mock('../../../services/MailService')

// db connection
beforeAll(async () => {
  await mongoose.connect(global.__MONGO_URI__, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})

beforeEach(async () => {
  await resetDb()
})

describe('Parnter volunteer only college certs email', () => {
  beforeEach(async () => {
    jest.resetAllMocks()
  })

  test('Should send email to onboarded partner volunteer with only college subjects', async () => {
    const subjects = [SUBJECTS.PLANNING]
    const volunteer = await insertVolunteer({
      isOnboarded: true,
      volunteerPartnerOrg: 'example',
      subjects
    })
    // @todo: figure out how to properly type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const job: any = {
      name: Jobs.EmailPartnerVolunteerOnlyCollegeCerts,
      data: {
        volunteerId: volunteer._id
      }
    }

    await emailOnlyCollegeCerts(job)
    expect(
      MailService.sendPartnerVolunteerOnlyCollegeCerts
    ).toHaveBeenCalledTimes(1)
    expect(logger.info).toHaveBeenCalledWith(
      `Sent ${job.name} to volunteer ${volunteer._id}`
    )
  })

  test('Should not send if partner volunteer is not onboarded', async () => {
    const volunteer = await insertVolunteer({ isOnboarded: false })
    // @todo: figure out how to properly type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const job: any = {
      name: Jobs.EmailPartnerVolunteerOnlyCollegeCerts,
      data: {
        volunteerId: volunteer._id
      }
    }

    await emailOnlyCollegeCerts(job)
    expect(
      MailService.sendPartnerVolunteerOnlyCollegeCerts
    ).not.toHaveBeenCalled()
    expect(logger.info).not.toHaveBeenCalledWith()
  })

  test('Should not send email if partner volunteer is onboarded and received more than 2 text notifications', async () => {
    const volunteer = await insertVolunteer({ isOnboarded: true })
    const notifications = [
      buildNotification({ volunteer: volunteer._id }),
      buildNotification({ volunteer: volunteer._id }),
      buildNotification({ volunteer: volunteer._id })
    ]
    await insertNotificationMany(notifications)
    // @todo: figure out how to properly type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const job: any = {
      name: Jobs.EmailPartnerVolunteerOnlyCollegeCerts,
      data: {
        volunteerId: volunteer._id
      }
    }

    await emailOnlyCollegeCerts(job)
    expect(
      MailService.sendPartnerVolunteerOnlyCollegeCerts
    ).not.toHaveBeenCalled()
    expect(logger.info).not.toHaveBeenCalledWith()
  })

  test('Should not email if volunteer is certified in subjects other than college related subjects', async () => {
    const subjects = [SUBJECTS.ALGEBRA_ONE, SUBJECTS.ALGEBRA_TWO]
    const volunteer = await insertVolunteer({
      isOnboarded: true,
      volunteerPartnerOrg: 'example',
      subjects
    })
    const notifications = [
      buildNotification({ volunteer: volunteer._id }),
      buildNotification({ volunteer: volunteer._id }),
      buildNotification({ volunteer: volunteer._id })
    ]
    await insertNotificationMany(notifications)
    // @todo: figure out how to properly type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const job: any = {
      name: Jobs.EmailPartnerVolunteerOnlyCollegeCerts,
      data: {
        volunteerId: volunteer._id
      }
    }

    await emailOnlyCollegeCerts(job)
    expect(
      MailService.sendPartnerVolunteerOnlyCollegeCerts
    ).not.toHaveBeenCalled()
    expect(logger.info).not.toHaveBeenCalledWith()
  })

  test('Should throw error when sending email fails', async () => {
    const subjects = [SUBJECTS.PLANNING]
    const volunteer = await insertVolunteer({
      isOnboarded: true,
      volunteerPartnerOrg: 'example',
      subjects
    })
    const errorMessage = 'Unable to send'
    const rejectionFn = jest.fn(() => Promise.reject(errorMessage))
    MailService.sendPartnerVolunteerOnlyCollegeCerts = rejectionFn
    // @todo: figure out how to properly type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const job: any = {
      name: Jobs.EmailPartnerVolunteerOnlyCollegeCerts,
      data: {
        volunteerId: volunteer._id
      }
    }

    await expect(emailOnlyCollegeCerts(job)).rejects.toEqual(
      Error(
        `Failed to send ${job.name} to volunteer ${volunteer._id}: ${errorMessage}`
      )
    )
  })
})
