import * as VolunteerRepo from '../../models/Volunteer'
import * as TrainingCourseRepo from '../../models/TrainingCourses'
import {
  recordProgress,
  getTrainingCourse,
} from '../../services/TrainingCourseService'
import { getDbUlid } from '../../models/pgUtils'
import { faker } from '@faker-js/faker'
import { UserContactInfo } from '../../models/User'
import { TRAINING } from '../../constants'
import logger from '../../logger'
import { buildUserContactInfo } from '../mocks/generate'
import {
  TrainingCourseModule,
  TrainingCourseModuleMaterial,
  TrainingCourse,
} from '../../models/TrainingCourses'

jest.mock('../../logger')
jest.mock('../../models/Volunteer')
jest.mock('../../models/TrainingCourses')
jest.mock('../../services/FeatureFlagService', () => {
  return {
    getUsingOurPlatformFlag: jest.fn().mockResolvedValue(true),
  }
})
describe('TrainingCourseService', () => {
  const mockedVolunteerRepo = jest.mocked(VolunteerRepo)
  const mockedTrainingCourseRepo = jest.mocked(TrainingCourseRepo)
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
    const requiredMaterials = ['7b6a76', 'jsn832', 'ps87f9', 'jgu55k', 'fj8tzq']

    beforeEach(() => {
      mockedTrainingCourseRepo.getRequiredMaterialKeysByTrainingCourseName.mockResolvedValue(
        requiredMaterials
      )
    })

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
      mockedVolunteerRepo.updateVolunteerTrainingById.mockResolvedValue({
        userId: volunteer.id,
        complete: false,
        trainingCourseId: 1,
        progress: 20,
        completedMaterials: [materialKey],
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      const result = await recordProgress(volunteer, courseKey, materialKey)
      expect(
        mockedVolunteerRepo.updateVolunteerTrainingById
      ).toHaveBeenCalledWith(
        volunteer.id,
        courseKey,
        requiredMaterials,
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

      mockedVolunteerRepo.updateVolunteerTrainingById.mockResolvedValue({
        userId: volunteer.id,
        complete: false,
        trainingCourseId: 1,
        progress: endingProgress,
        completedMaterials: [materialKey],
        createdAt: new Date(),
        updatedAt: new Date(),
      })

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
        requiredMaterials,
        newMaterialKey,
        expect.toBeTransactionClient()
      )
      expect(result).toEqual({
        isComplete,
        progress: endingProgress,
      })
    })
  })

  describe('getFullTrainingCourseByName', () => {
    it('Correctly sorts materials with their modules', async () => {
      const trainingCourseFromDb: TrainingCourse = {
        id: 1,
        displayName: 'Training course',
        name: 'training-course',
        description: 'description',
        quizId: 1,
        quizName: 'some-quiz',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      const module1FromDb: TrainingCourseModule = {
        id: 1,
        name: 'module 1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      const module2FromDb: TrainingCourseModule = {
        id: 2,
        name: 'module 2',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      const module1Material1FromDb: TrainingCourseModuleMaterial = {
        id: 1,
        moduleId: module1FromDb.id,
        name: 'Material A',
        key: 'materialA',
        type: 'video',
        required: true,
        resourceUrl: 'url1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      const module1Material2FromDb: TrainingCourseModuleMaterial = {
        ...module1Material1FromDb,
        id: 2,
        name: 'Material B',
        key: 'materialB',
        resourceId: 'blah blah',
        links: [
          {
            displayName: 'Link 1',
            url: 'url1.1',
          },
        ],
      }
      const module2Material1FromDb: TrainingCourseModuleMaterial = {
        ...module1Material1FromDb,
        id: 3,
        moduleId: module2FromDb.id,
        name: 'Material C',
        key: 'materialC',
      }
      mockedTrainingCourseRepo.getFullTrainingCourseByName.mockResolvedValue({
        trainingCourse: trainingCourseFromDb,
        modules: [module1FromDb, module2FromDb],
        materials: [
          module1Material1FromDb,
          module1Material2FromDb,
          module2Material1FromDb,
        ],
      })
      const actual = await getTrainingCourse('upchieve101')
      expect(actual).toEqual(
        expect.objectContaining({
          ...trainingCourseFromDb,
          modules: [
            {
              ...module1FromDb,
              materials: [module1Material1FromDb, module1Material2FromDb],
            },
            {
              ...module2FromDb,
              materials: [module2Material1FromDb],
            },
          ],
        })
      )
    })
  })
})
