import * as VolunteerService from '../../services/VolunteerService'
import * as VolunteerRepo from '../../models/Volunteer'
import QueueService from '../../services/QueueService'
import * as AnalyticsService from '../../services/AnalyticsService'
import { createAccountAction } from '../../models/UserAction'
import { TransactionClient } from '../../db'
import {
  ACCOUNT_USER_ACTIONS,
  EVENTS,
  TRAINING,
  TRAINING_QUIZZES,
} from '../../constants'
import { mocked } from 'jest-mock'
import { QuizInfo } from '../../models/Volunteer'

jest.mock('../../models/Volunteer')
jest.mock('../../services/QueueService', () => ({
  add: jest.fn(),
}))
jest.mock('../../services/AnalyticsService', () => ({
  captureEvent: jest.fn(),
}))
jest.mock('../../models/UserAction', () => ({
  createAccountAction: jest.fn(),
}))

const mockedVolunteerRepo = mocked(VolunteerRepo)
const mockVolunteer = {
  id: 'volunteer123',
  firstName: 'Volunteer',
  email: 'volunteer@email.com',
  onboarded: false,
  approved: false,
  subjects: ['algebraOne'],
  availabilityLastModifiedAt: new Date(),
}
const mockIp = 'mock-ip'
const tc = {} as TransactionClient

beforeEach(() => {
  jest.clearAllMocks()

  mockedVolunteerRepo.getVolunteerTrainingCourses.mockResolvedValue({
    [TRAINING.UPCHIEVE_101]: {
      userId: mockVolunteer.id,
      complete: true,
      trainingCourse: TRAINING.UPCHIEVE_101,
      progress: 100,
      completedMaterials: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isComplete: true,
    },
  })
  mockedVolunteerRepo.getQuizzesForVolunteers.mockResolvedValue({
    [mockVolunteer.id]: {
      [TRAINING_QUIZZES.LEGACY_UPCHIEVE_101]: {
        passed: true,
        tries: 1,
      },
    },
  })
})

describe('getVolunteerForOnboardingById', () => {
  test.todo(
    'Has completed volunteer training if they completed the legacy training'
  )
  test.todo(
    'Has completed volunteer training if they completed the legacy quiz'
  )
  test.todo(
    'Has completed volunteer training if they completed all the new training quizzes'
  )
  test.todo('Has NOT completed volunteer training')
})

describe('onboardVolunteer', () => {
  test('should call all functions in the if block when conditions are met', async () => {
    mockedVolunteerRepo.getVolunteerForOnboardingById.mockResolvedValue(
      mockVolunteer
    )
    await VolunteerService.onboardVolunteer(mockVolunteer.id, mockIp, tc)

    expect(VolunteerRepo.updateVolunteerOnboarded).toHaveBeenCalledWith(
      mockVolunteer.id,
      tc
    )
    expect(QueueService.add).toHaveBeenCalledTimes(1)
    expect(createAccountAction).toHaveBeenCalledWith(
      {
        action: expect.any(String),
        userId: mockVolunteer.id,
        ipAddress: mockIp,
      },
      tc
    )
    expect(AnalyticsService.captureEvent).toHaveBeenCalledWith(
      mockVolunteer.id,
      EVENTS.ACCOUNT_ONBOARDED,
      {
        event: EVENTS.ACCOUNT_ONBOARDED,
      }
    )
  })

  test('should not call functions in the if block if volunteer is missing subjects', async () => {
    const modifiedVolunteer = { ...mockVolunteer, subjects: [] }
    mockedVolunteerRepo.getVolunteerForOnboardingById.mockResolvedValue(
      modifiedVolunteer
    )
    await VolunteerService.onboardVolunteer(modifiedVolunteer.id, mockIp, tc)

    expect(VolunteerRepo.updateVolunteerOnboarded).not.toHaveBeenCalled()
    expect(QueueService.add).not.toHaveBeenCalled()
    expect(createAccountAction).not.toHaveBeenCalled()
    expect(AnalyticsService.captureEvent).not.toHaveBeenCalled()
  })

  test('should not call functions in the if block if volunteer has not completed training', async () => {
    mockedVolunteerRepo.getVolunteerTrainingCourses.mockResolvedValue({
      [TRAINING.UPCHIEVE_101]: {
        userId: mockVolunteer.id,
        complete: false,
        trainingCourse: TRAINING.UPCHIEVE_101,
        progress: 50,
        completedMaterials: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isComplete: false,
      },
    })
    await VolunteerService.onboardVolunteer(mockVolunteer.id, mockIp, tc)

    expect(VolunteerRepo.updateVolunteerOnboarded).not.toHaveBeenCalled()
    expect(QueueService.add).not.toHaveBeenCalled()
    expect(createAccountAction).not.toHaveBeenCalled()
    expect(AnalyticsService.captureEvent).not.toHaveBeenCalled()
  })

  test('should not call partner-specific functions if volunteerPartnerOrg is undefined', async () => {
    await VolunteerService.onboardVolunteer(mockVolunteer.id, mockIp, tc)

    expect(QueueService.add).toHaveBeenCalledTimes(0)
  })

  test('It does NOT require the volunteer to have set availability', async () => {
    const testVolunteerWithNoAvailability = {
      ...mockVolunteer,
      availabilityLastModifiedAt: undefined,
    }
    mockedVolunteerRepo.getVolunteerForOnboardingById.mockResolvedValue(
      testVolunteerWithNoAvailability
    )
    await VolunteerService.onboardVolunteer(
      testVolunteerWithNoAvailability.id,
      mockIp,
      tc
    )
    expect(VolunteerRepo.updateVolunteerOnboarded).toHaveBeenCalled()
    expect(createAccountAction).toHaveBeenCalledWith(
      expect.objectContaining({
        action: ACCOUNT_USER_ACTIONS.ONBOARDED,
        ipAddress: mockIp,
        userId: testVolunteerWithNoAvailability.id,
      }),
      expect.anything()
    )
    expect(AnalyticsService.captureEvent).toHaveBeenCalledWith(
      expect.anything(),
      EVENTS.ACCOUNT_ONBOARDED,
      expect.anything()
    )
  })
})
