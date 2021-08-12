import { mocked } from 'ts-jest/utils'
import { Jobs } from '../../../worker/jobs'
import * as VolunteerService from '../../../services/VolunteerService'
import MailService from '../../../services/MailService'
import emailFailedFirstAttemptedQuiz from '../../../worker/jobs/volunteer-emails/emailFailedFirstAttemptedQuiz'
import logger from '../../../logger'
import { buildVolunteer } from '../../generate'
jest.mock('../../../logger')
jest.mock('../../../services/MailService')
jest.mock('../../../services/VolunteerService')

const mockedMailService = mocked(MailService)
const mockedVolunteerService = mocked(VolunteerService)

describe('first attempted quiz failed email job', () => {
  beforeEach(async () => {
    jest.resetAllMocks()
  })

  const volunteer = buildVolunteer()

  const job: any = {
    name: Jobs.EmailFailedFirstAttemptedQuiz,
    data: {
      email: 'testy@mctesterson.com',
      category: 'Pre-algebra',
      firstName: 'Testy',
      volunteerId: volunteer._id
    }
  }

  test('should send email', async () => {
    mockedVolunteerService.getVolunteers.mockImplementation(async () => [
      volunteer
    ])

    await emailFailedFirstAttemptedQuiz(job)

    expect(logger.info).toHaveBeenCalledWith(
      `Sent ${job.name} to volunteer ${volunteer._id}`
    )
    expect(MailService.sendFailedFirstAttemptedQuiz).toHaveBeenCalledTimes(1)
  })

  test('should throw error if email fails to send', async () => {
    const errorMessage = 'Unable to send'
    mockedVolunteerService.getVolunteers.mockImplementation(async () => [
      volunteer
    ])
    mockedMailService.sendFailedFirstAttemptedQuiz.mockImplementationOnce(() =>
      Promise.reject(errorMessage)
    )
    await expect(emailFailedFirstAttemptedQuiz(job)).rejects.toEqual(
      Error(
        `Failed to send ${job.name} to volunteer ${volunteer._id}: Unable to send`
      )
    )
  })
})
