import * as VolunteerRepo from '../../models/Volunteer'
import { recordProgress } from '../../services/TrainingCourseService'
import { getDbUlid } from '../../models/pgUtils'
import { faker } from '@faker-js/faker'
import { UserContactInfo } from '../../models/User'
import { TRAINING } from '../../constants'
import logger from '../../logger'
import { buildUserContactInfo } from '../mocks/generate'

jest.mock('../../logger')
jest.mock('../../models/Volunteer')
jest.mock('../../services/FeatureFlagService', () => {
  return {
    getUsingOurPlatformFlag: jest.fn().mockResolvedValue(true),
  }
})
describe('TrainingCourseService', () => {
  const mockedVolunteerRepo = jest.mocked(VolunteerRepo)
  const mockedLogger = jest.mocked(logger)
  const volunteer: UserContactInfo = {
    ...buildUserContactInfo(),
    id: getDbUlid(),
    banType: undefined,
    deactivated: false,
    email: faker.internet.email(),
    phone: faker.phone.number(),
    phoneVerified: true,
    firstName: faker.person.firstName(),
    lastActivityAt: new Date(),
    smsConsent: true,
    isAdmin: false,
    isVolunteer: true,
    roles: ['volunteer'],
  }

  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('recordProgress', () => {
    const courseKey = TRAINING.UPCHIEVE_101
    const materialKey = '7b6a76' // A required material (counts toward progress)

    it('Returns the progress info for a material that was already completed', async () => {
      const isComplete = false
      const progress = 20

      // Mock this course is in progress and the given material has already been completed
      mockedVolunteerRepo.getVolunteerTrainingCourses.mockResolvedValue({
        [TRAINING.UPCHIEVE_101]: {
          userId: volunteer.id,
          complete: isComplete,
          trainingCourse: courseKey,
          progress,
          completedMaterials: [materialKey],
          createdAt: new Date(),
          updatedAt: new Date(),
          isComplete,
        },
      })

      const result = await recordProgress(volunteer, courseKey, materialKey)
      expect(
        mockedVolunteerRepo.updateVolunteerTrainingById
      ).not.toHaveBeenCalled()
      expect(mockedLogger.warn).toHaveBeenCalledWith(
        {
          courseKey,
          materialKey,
        },
        'User has already completed this training material'
      )
      expect(result).toEqual({
        isComplete,
        progress,
      })
    })

    it("Returns the progress info for a material that wasn't already completed on a new course", async () => {
      const isComplete = false
      const progress = 20 // There are 5 required materials, so completing 1 brings you to 20% complete

      mockedVolunteerRepo.getVolunteerTrainingCourses.mockResolvedValue({})
      const result = await recordProgress(volunteer, courseKey, materialKey)
      expect(
        mockedVolunteerRepo.updateVolunteerTrainingById
      ).toHaveBeenCalledWith(
        volunteer.id,
        courseKey,
        isComplete,
        progress,
        materialKey,
        expect.toBeTransactionClient()
      )
      expect(mockedLogger.warn).not.toHaveBeenCalled()
      expect(result).toEqual({
        isComplete,
        progress,
      })
    })

    it('Returns the progress info for a newly completed material on a course that already has some progress', async () => {
      const isComplete = false
      const originalProgress = 20
      const endingProgress = 40
      const newMaterialKey = 'jsn832' // Another required material, which counts toward total progress.

      mockedVolunteerRepo.getVolunteerTrainingCourses.mockResolvedValue({
        [TRAINING.UPCHIEVE_101]: {
          userId: volunteer.id,
          complete: isComplete,
          trainingCourse: courseKey,
          progress: originalProgress,
          completedMaterials: [materialKey],
          createdAt: new Date(),
          updatedAt: new Date(),
          isComplete,
        },
      })

      const result = await recordProgress(volunteer, courseKey, newMaterialKey)
      expect(
        mockedVolunteerRepo.updateVolunteerTrainingById
      ).toHaveBeenCalledWith(
        volunteer.id,
        courseKey,
        isComplete,
        endingProgress,
        newMaterialKey,
        expect.toBeTransactionClient()
      )
      expect(result).toEqual({
        isComplete,
        progress: endingProgress,
      })
    })
  })
})
