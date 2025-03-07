import { mocked } from 'jest-mock'
import emailFallIncentiveInvitedToEnrollReminder, {
  EmailFallIncentiveInvitedToEnrollReminderJobData,
} from '../../../worker/jobs/student-emails/emailFallIncentiveInvitedToEnrollReminder'
import * as MailService from '../../../services/MailService'
import * as UserService from '../../../services/UserService'
import { Job } from 'bull'
import { buildUser } from '../../mocks/generate'
import { log } from '../../../worker/logger'
import { Jobs } from '../../../worker/jobs'

jest.mock('../../../services/MailService')
jest.mock('../../../logger')
jest.mock('../../../services/UserService')

const mockedUserService = mocked(UserService)
const mockedMailService = mocked(MailService)

describe('emailFallIncentiveInvitedToEnrollReminder', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  test('Should return without sending email if no user is found', async () => {
    mockedUserService.getUserContactInfo.mockResolvedValueOnce(undefined)
    const jobData: Job<EmailFallIncentiveInvitedToEnrollReminderJobData> = {
      data: {
        userId: '123',
      },
    } as Job<EmailFallIncentiveInvitedToEnrollReminderJobData>

    await emailFallIncentiveInvitedToEnrollReminder(jobData)
    expect(
      mockedMailService.sendFallIncentiveInvitedToEnrollReminderEmail
    ).not.toHaveBeenCalled()
    expect(log).not.toHaveBeenCalled()
  })

  test('Should send an invited reminder email if user is found', async () => {
    const user = buildUser()
    mockedUserService.getUserContactInfo.mockResolvedValueOnce(user)
    const jobData: Job<EmailFallIncentiveInvitedToEnrollReminderJobData> = {
      data: {
        userId: user.id,
      },
    } as Job<EmailFallIncentiveInvitedToEnrollReminderJobData>

    await emailFallIncentiveInvitedToEnrollReminder(jobData)
    expect(
      mockedMailService.sendFallIncentiveInvitedToEnrollReminderEmail
    ).toHaveBeenCalledWith(user.email, user.firstName)
    expect(log).toHaveBeenCalledWith(
      `Sent ${Jobs.EmailFallIncentiveInvitedToEnrollReminder} to student ${user.id}`
    )
  })

  test('Should catch error when sending invited reminder email', async () => {
    const user = buildUser()
    const error = 'Failed to send reminder email'
    mockedUserService.getUserContactInfo.mockResolvedValueOnce(user)
    mockedMailService.sendFallIncentiveInvitedToEnrollReminderEmail.mockRejectedValueOnce(
      error
    )
    const jobData: Job<EmailFallIncentiveInvitedToEnrollReminderJobData> = {
      data: {
        userId: user.id,
      },
    } as Job<EmailFallIncentiveInvitedToEnrollReminderJobData>

    await expect(
      emailFallIncentiveInvitedToEnrollReminder(jobData)
    ).rejects.toThrow(
      `Failed to send ${Jobs.EmailFallIncentiveInvitedToEnrollReminder} to student ${user.id}: ${error}`
    )
    expect(
      mockedMailService.sendFallIncentiveInvitedToEnrollReminderEmail
    ).toHaveBeenCalledWith(user.email, user.firstName)
  })
})
