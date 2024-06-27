test.todo('postgres migration')
/*
import { mocked } from 'jest-mock';
import { Jobs } from '../../../worker/jobs'
import * as VolunteerRepo from '../../../models/Volunteer'
import * as MailService from '../../../services/MailService'
import emailFailedFirstAttemptedQuiz from '../../../worker/jobs/volunteer-emails/emailFailedFirstAttemptedQuiz'
import { log as logger } from '../../../worker/logger'
import { buildVolunteer } from '../../generate'

jest.mock('../../../services/MailService')
jest.mock('../../../models/Volunteer')

const mockedMailService = mocked(MailService)
const mockedVolunteerRepo = mocked(VolunteerRepo)

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
      volunteerId: volunteer._id,
    },
  }

  test('should send email', async () => {
    mockedVolunteerRepo.getVolunteerContactInfoById.mockResolvedValueOnce(
      volunteer as VolunteerRepo.VolunteerContactInfo
    )

    await emailFailedFirstAttemptedQuiz(job)

    expect(logger).toHaveBeenCalledWith(
      `Sent ${job.name} to volunteer ${volunteer._id}`
    )
    expect(MailService.sendFailedFirstAttemptedQuiz).toHaveBeenCalledTimes(1)
  })

  test('should throw error if email fails to send', async () => {
    const errorMessage = 'Unable to send'
    mockedVolunteerRepo.getVolunteerContactInfoById.mockResolvedValueOnce(
      volunteer as VolunteerRepo.VolunteerContactInfo
    )
    mockedMailService.sendFailedFirstAttemptedQuiz.mockRejectedValueOnce(
      errorMessage
    )
    await expect(emailFailedFirstAttemptedQuiz(job)).rejects.toEqual(
      Error(
        `Failed to send ${job.name} to volunteer ${volunteer._id}: Unable to send`
      )
    )
  })
})
*/
