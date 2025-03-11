import { mocked } from 'jest-mock'
import emailFallIncentiveEnrollmentWelcome, {
  EmailFallIncentiveEnrollmentWelcomeJobData,
} from '../../../worker/jobs/student-emails/emailFallIncentiveEnrollmentWelcome'
import * as MailService from '../../../services/MailService'
import * as UserService from '../../../services/UserService'
import { Job } from 'bull'
import { getDbUlid } from '../../../models/pgUtils'
import { buildUser } from '../../mocks/generate'
import { Jobs } from '../../../worker/jobs'
import { log } from '../../../worker/logger'

jest.mock('../../../services/MailService')
jest.mock('../../../logger')
jest.mock('../../../services/UserService')

const mockedUserService = mocked(UserService)
const mockedMailService = mocked(MailService)

describe('EmailFallIncentiveEnrollmentWelcome', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  test('Should do nothing if there is no user', async () => {
    mockedUserService.getUserContactInfo.mockResolvedValueOnce(undefined)
    const jobData: Job<EmailFallIncentiveEnrollmentWelcomeJobData> = {
      data: {
        userId: getDbUlid(),
      },
    } as Job<EmailFallIncentiveEnrollmentWelcomeJobData>

    await emailFallIncentiveEnrollmentWelcome(jobData)
    expect(
      MailService.sendFallIncentiveEnrollmentWelcomeEmail
    ).not.toHaveBeenCalled()
  })

  test('Should send email', async () => {
    const user = buildUser()
    mockedUserService.getUserContactInfo.mockResolvedValueOnce(user)
    mockedMailService.sendFallIncentiveEnrollmentWelcomeEmail.mockResolvedValueOnce(
      undefined
    )
    const jobData: Job<EmailFallIncentiveEnrollmentWelcomeJobData> = {
      data: {
        userId: user.id,
      },
    } as Job<EmailFallIncentiveEnrollmentWelcomeJobData>

    await emailFallIncentiveEnrollmentWelcome(jobData)
    expect(
      MailService.sendFallIncentiveEnrollmentWelcomeEmail
    ).toHaveBeenCalledWith(user.email, user.firstName)
    expect(log).toHaveBeenCalledWith(
      `Sent ${Jobs.EmailFallIncentiveEnrollmentWelcome} to student ${user.id}`
    )
  })

  test('Should catch error when sending email', async () => {
    const user = buildUser()
    mockedUserService.getUserContactInfo.mockResolvedValueOnce(user)
    const error = 'Failed to send email'
    mockedMailService.sendFallIncentiveEnrollmentWelcomeEmail.mockRejectedValueOnce(
      error
    )
    const jobData: Job<EmailFallIncentiveEnrollmentWelcomeJobData> = {
      data: {
        userId: user.id,
      },
    } as Job<EmailFallIncentiveEnrollmentWelcomeJobData>

    await expect(async () => {
      await emailFallIncentiveEnrollmentWelcome(jobData)
    }).rejects.toThrow(
      `Failed to send ${Jobs.EmailFallIncentiveEnrollmentWelcome} to student ${user.id}: ${error}`
    )

    expect(
      MailService.sendFallIncentiveEnrollmentWelcomeEmail
    ).toHaveBeenCalled()
  })
})
