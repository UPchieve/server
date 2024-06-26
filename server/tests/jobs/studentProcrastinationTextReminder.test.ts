import { mocked } from 'jest-mock'
import * as UserRepo from '../../models/User/queries'
import * as TwilioService from '../../services/TwilioService'
import * as AnalyticsService from '../../services/AnalyticsService'
import studentProcrastinationTextReminder from '../../worker/jobs/studentProcrastinationTextReminder'
import { buildUserContactInfo } from '../mocks/generate'
import { EVENTS } from '../../constants'
jest.mock('../../services/TwilioService')
jest.mock('../../services/AnalyticsService')
jest.mock('../../models/User/queries')
jest.mock('../../worker/logger')

const mockedTwilioService = mocked(TwilioService)
const mockedAnalyticsService = mocked(AnalyticsService)
const mockedUserRepo = mocked(UserRepo)

describe('studentProcrastinationTextReminder', () => {
  beforeEach(async () => {
    jest.resetAllMocks()
  })

  const user = buildUserContactInfo()

  test('Should successfully send a procrastination text reminder', async () => {
    mockedUserRepo.getUserContactInfoById.mockResolvedValueOnce(user)
    mockedTwilioService.sendProcrastinationTextReminder.mockResolvedValueOnce(
      '123456'
    )

    // @todo: figure out how to properly type
    const job: any = {
      data: {
        userId: user.id,
      },
    }

    await studentProcrastinationTextReminder(job)

    expect(mockedUserRepo.getUserContactInfoById).toHaveBeenCalledTimes(1)
    expect(
      mockedTwilioService.sendProcrastinationTextReminder
    ).toHaveBeenCalledWith(user.id, user.firstName, user.phone)
    expect(mockedAnalyticsService.captureEvent).toHaveBeenCalledWith(
      user.id,
      EVENTS.STUDENT_PROCRASTINATION_PREVENTION_REMINDER_SENT,
      {
        event: EVENTS.STUDENT_PROCRASTINATION_PREVENTION_REMINDER_SENT,
      }
    )
  })

  test('Should not trigger analytics if no message id is returned', async () => {
    mockedUserRepo.getUserContactInfoById.mockResolvedValueOnce(user)
    mockedTwilioService.sendProcrastinationTextReminder.mockResolvedValueOnce(
      ''
    )

    // @todo: figure out how to properly type
    const job: any = {
      data: {
        userId: user.id,
      },
    }

    await studentProcrastinationTextReminder(job)

    expect(mockedUserRepo.getUserContactInfoById).toHaveBeenCalledTimes(1)
    expect(
      mockedTwilioService.sendProcrastinationTextReminder
    ).toHaveBeenCalledWith(user.id, user.firstName, user.phone)
    expect(mockedAnalyticsService.captureEvent).not.toHaveBeenCalled()
  })

  test('Should do nothing if no user or phone is found', async () => {
    mockedUserRepo.getUserContactInfoById.mockResolvedValueOnce(undefined)
    mockedTwilioService.sendProcrastinationTextReminder.mockResolvedValueOnce(
      '12345'
    )

    // @todo: figure out how to properly type
    const job: any = {
      data: {
        userId: user.id,
      },
    }

    await studentProcrastinationTextReminder(job)

    expect(mockedUserRepo.getUserContactInfoById).toHaveBeenCalled()
    expect(
      mockedTwilioService.sendProcrastinationTextReminder
    ).not.toHaveBeenCalled()
    expect(mockedAnalyticsService.captureEvent).not.toHaveBeenCalled()

    mockedUserRepo.getUserContactInfoById.mockResolvedValueOnce({
      ...user,
      phone: undefined,
    })

    await studentProcrastinationTextReminder(job)

    expect(
      mockedTwilioService.sendProcrastinationTextReminder
    ).not.toHaveBeenCalled()
    expect(mockedAnalyticsService.captureEvent).not.toHaveBeenCalled()
  })

  test('Should capture twilio service error', async () => {
    const error = 'An error occurred'
    mockedUserRepo.getUserContactInfoById.mockResolvedValueOnce(user)
    mockedTwilioService.sendProcrastinationTextReminder.mockRejectedValueOnce(
      error
    )

    // @todo: figure out how to properly type
    const job: any = {
      data: {
        userId: user.id,
      },
    }

    await expect(studentProcrastinationTextReminder(job)).rejects.toEqual(
      new Error(
        `Failed to send procrastination reminder text to student: ${user.id}. Error: ${error}`
      )
    )

    expect(mockedUserRepo.getUserContactInfoById).toHaveBeenCalled()
    expect(
      mockedTwilioService.sendProcrastinationTextReminder
    ).toHaveBeenCalled()
    expect(mockedAnalyticsService.captureEvent).not.toHaveBeenCalled()
  })
})
