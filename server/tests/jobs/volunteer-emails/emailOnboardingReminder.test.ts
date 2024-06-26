test.todo('postgres migration')
/*import { mocked } from 'jest-mock';
import mongoose from 'mongoose'
import { resetDb, insertVolunteer } from '../../db-utils'
import emailOnboardingReminder from '../../../worker/jobs/volunteer-emails/emailOnboardingReminder'
import { log as logger } from '../../../worker/logger'
import { Jobs } from '../../../worker/jobs'
import * as MailService from '../../../services/MailService'

jest.mock('../../../services/MailService')

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

describe('Volunteer onboarding email reminders', () => {
  const onboardingReminderJobs = [
    { name: Jobs.EmailOnboardingReminderOne, delay: 1000 * 60 * 60 * 24 * 7 },
    { name: Jobs.EmailOnboardingReminderTwo, delay: 1000 * 60 * 60 * 24 * 10 },
    { name: Jobs.EmailOnboardingReminderThree },
  ]

  beforeEach(async () => {
    jest.resetAllMocks()
  })

  test('Should send onboarding email reminder and add the next job to the queue', async () => {
    const volunteer = await insertVolunteer()
    for (let i = 0; i < onboardingReminderJobs.length; i++) {
      const currentJob = onboardingReminderJobs[i]
      const nextJob =
        onboardingReminderJobs[i + 1] && onboardingReminderJobs[i + 1].name
      // @todo: figure out how to properly type

      const job: any = {
        name: currentJob.name,
        data: {
          volunteerId: volunteer._id,
        },
        queue: {
          add: jest.fn(),
        },
      }

      await emailOnboardingReminder(job)
      expect(logger).toHaveBeenCalledWith(
        `Emailed ${currentJob.name} to volunteer ${volunteer._id}`
      )
      if (currentJob.name === Jobs.EmailOnboardingReminderThree)
        expect(job.queue.add).not.toHaveBeenCalled()
      else
        expect(job.queue.add).toHaveBeenCalledWith(
          nextJob,
          {
            volunteerId: volunteer._id.toString(),
          },
          { delay: currentJob.delay }
        )
    }
  })

  test('Should throw error when sending onboarding email reminder fails', async () => {
    const volunteer = await insertVolunteer()
    const errorMessage = 'Error sending onboarding reminder email'
    mockedMailService.sendOnboardingReminderOne.mockRejectedValueOnce(
      errorMessage
    )
    mockedMailService.sendOnboardingReminderTwo.mockRejectedValueOnce(
      errorMessage
    )
    mockedMailService.sendOnboardingReminderThree.mockRejectedValueOnce(
      errorMessage
    )

    for (const currentJob of onboardingReminderJobs) {
      // @todo: figure out how to properly type

      const job: any = {
        name: currentJob.name,
        data: {
          volunteerId: volunteer._id,
        },
      }

      await expect(emailOnboardingReminder(job)).rejects.toEqual(
        Error(
          `Failed to email ${currentJob.name} to volunteer ${volunteer._id}: ${errorMessage}`
        )
      )
    }
  })

  test('Should not email a student who is banned', async () => {
    const volunteer = await insertVolunteer({ isOnboarded: true })
    for (const currentJob of onboardingReminderJobs) {
      // @todo: figure out how to properly type

      const job: any = {
        name: currentJob,
        data: {
          volunteerId: volunteer._id,
        },
      }

      await emailOnboardingReminder(job)
      expect(logger).not.toHaveBeenCalled()
    }
  })
})
*/
