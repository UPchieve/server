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
import { TrainingCourse } from '../../models/Volunteer'
import { hasCompletedVolunteerTraining } from '../../services/VolunteerService'
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
const COMPLETED_TRAINING_COURSE: Omit<TrainingCourse, 'trainingCourse'> = {
  userId: mockVolunteer.id,
  complete: true,
  progress: 100,
  completedMaterials: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  isComplete: true,
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

describe('hasCompletedVolunteerTraining', () => {
  const passedQuiz = {
    passed: true,
    tries: 1,
  }
  const failedQuiz = { ...passedQuiz, passed: false }

  test('Is true if the legacy training is complete', async () => {
    mockedVolunteerRepo.getVolunteerTrainingCourses.mockResolvedValue({
      [TRAINING.UPCHIEVE_101]: {
        ...COMPLETED_TRAINING_COURSE,
        trainingCourse: TRAINING.UPCHIEVE_101,
      },
    })
    const actual = await hasCompletedVolunteerTraining(mockVolunteer.id)
    expect(actual).toEqual(true)
  })

  test('Is true if the legacy training quiz is passed', async () => {
    mockedVolunteerRepo.getVolunteerTrainingCourses.mockResolvedValue({
      [TRAINING.UPCHIEVE_101]: {
        ...COMPLETED_TRAINING_COURSE,
        complete: false,
        isComplete: false,
        trainingCourse: TRAINING.UPCHIEVE_101,
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

    const actual = await hasCompletedVolunteerTraining(mockVolunteer.id)
    expect(actual).toEqual(true)
  })

  test('Is false if all the quizzes have been attempted but not all passed', async () => {
    const testAndAssert = async (expectedValue: boolean) => {
      const actual = await hasCompletedVolunteerTraining(mockVolunteer.id)
      expect(actual).toEqual(expectedValue)
    }

    // Incomplete legacy training
    mockedVolunteerRepo.getVolunteerTrainingCourses.mockResolvedValue({
      [TRAINING.UPCHIEVE_101]: {
        ...COMPLETED_TRAINING_COURSE,
        complete: false,
        isComplete: false,
        progress: 50,
        trainingCourse: TRAINING.UPCHIEVE_101,
      },
    })

    // Only 1 of the quizzes passed, the rest failed
    mockedVolunteerRepo.getQuizzesForVolunteers.mockResolvedValue({
      [mockVolunteer.id]: {
        [TRAINING_QUIZZES.ACADEMIC_INTEGRITY]: { ...passedQuiz },
        [TRAINING_QUIZZES.COACHING_STRATEGIES]: { ...failedQuiz },
        [TRAINING_QUIZZES.COMMUNITY_SAFETY]: { ...failedQuiz },
        [TRAINING_QUIZZES.DEI]: { ...failedQuiz },
      },
    })
    await testAndAssert(false)
    jest.resetAllMocks()
  })

  test('Is true if all the quizzes are passed', async () => {
    // Incomplete legacy training
    mockedVolunteerRepo.getVolunteerTrainingCourses.mockResolvedValue({
      [TRAINING.UPCHIEVE_101]: {
        ...COMPLETED_TRAINING_COURSE,
        complete: false,
        isComplete: false,
        progress: 50,
        trainingCourse: TRAINING.UPCHIEVE_101,
      },
    })
    mockedVolunteerRepo.getQuizzesForVolunteers.mockResolvedValue({
      [mockVolunteer.id]: {
        [TRAINING_QUIZZES.ACADEMIC_INTEGRITY]: { ...passedQuiz },
        [TRAINING_QUIZZES.COACHING_STRATEGIES]: { ...passedQuiz },
        [TRAINING_QUIZZES.COMMUNITY_SAFETY]: { ...passedQuiz },
        [TRAINING_QUIZZES.DEI]: { ...passedQuiz },
      },
    })
    const actual = await hasCompletedVolunteerTraining(mockVolunteer.id)
    expect(actual).toEqual(true)
  })
  test('Is true if all the quizzes are passed', async () => {
    // Incomplete legacy training
    mockedVolunteerRepo.getVolunteerTrainingCourses.mockResolvedValue({
      [TRAINING.UPCHIEVE_101]: {
        ...COMPLETED_TRAINING_COURSE,
        complete: false,
        isComplete: false,
        progress: 50,
        trainingCourse: TRAINING.UPCHIEVE_101,
      },
    })
    mockedVolunteerRepo.getQuizzesForVolunteers.mockResolvedValue({
      [mockVolunteer.id]: {
        [TRAINING_QUIZZES.ACADEMIC_INTEGRITY]: { ...passedQuiz },
        [TRAINING_QUIZZES.COACHING_STRATEGIES]: { ...passedQuiz },
        [TRAINING_QUIZZES.COMMUNITY_SAFETY]: { ...passedQuiz },
        [TRAINING_QUIZZES.DEI]: { ...passedQuiz },
      },
    })
    const actual = await hasCompletedVolunteerTraining(mockVolunteer.id)
    expect(actual).toEqual(true)
  })
})

describe('onboardVolunteer', () => {
  beforeEach(() => {
    mockedVolunteerRepo.getVolunteerTrainingCourses.mockResolvedValue({
      [TRAINING.UPCHIEVE_101]: {
        ...COMPLETED_TRAINING_COURSE,
        trainingCourse: TRAINING.UPCHIEVE_101,
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
