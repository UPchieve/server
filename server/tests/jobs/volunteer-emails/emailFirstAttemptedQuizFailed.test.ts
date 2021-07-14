import mongoose from 'mongoose'
import { Jobs } from '../../../worker/jobs'
import MailService from '../../../services/MailService'
import emailFailedFirstAttemptedQuiz from '../../../worker/jobs/volunteer-emails/emailFailedFirstAttemptedQuiz'
import logger from '../../../logger'
jest.mock('../../../logger')
jest.mock('../../../services/MailService')

describe('first attempted quiz failed email job', () => {
  beforeEach(async () => {
    jest.resetAllMocks()
  })

  const volunteerId = mongoose.Types.ObjectId().toString()

  const job: any = {
    name: Jobs.EmailFailedFirstAttemptedQuiz,
    data: {
      email: 'testy@mctesterson.com',
      category: 'Pre-algebra',
      firstName: 'Testy',
      volunteerId
    }
  }

  test('should send email', async () => {
    await emailFailedFirstAttemptedQuiz(job)
    expect(logger.info).toHaveBeenCalledWith(
      `Sent ${job.name} to volunteer ${volunteerId}`
    )
    expect(MailService.sendFailedFirstAttemptedQuiz).toHaveBeenCalledTimes(1)
  })

  test('should throw error if email fails to send', async () => {
    const errorMessage = 'Unable to send'
    MailService.sendFailedFirstAttemptedQuiz = jest.fn(() =>
      Promise.reject(errorMessage)
    )
    await expect(emailFailedFirstAttemptedQuiz(job)).rejects.toEqual(
      Error(
        `Failed to send ${job.name} to volunteer ${volunteerId}: Unable to send`
      )
    )
  })
})
