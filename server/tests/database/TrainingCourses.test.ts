/**
 * @group database/parallel
 */

import * as TrainingCourseRepo from '../../models/TrainingCourses'

const UPCHIEVE_101_COURSE_NAME = 'upchieve101'
const UPCHIEVE_101_REQUIRED_MATERIALS = [
  '7b6a76',
  'jsn832',
  'ps87f9',
  'jgu55k',
  'fj8tzq',
]
const UPCHIEVE_101_TRAINING_COURSE = {
  id: 1,
  displayName: 'UPchieve 101',
  name: 'upchieve101',
  description:
    "UPchieve101 will teach you everything you need to know to start helping students achieve their academic goals! You'll need to pass a short quiz at the end in order to be ready to coach.",
  quizId: 22,
  quizName: 'upchieve101',
}
const COACHING_ON_UPCHIEVE_MODULE = {
  id: 1,
  name: 'Coaching on UPchieve',
}
const COMMUNITY_SAFETY_SUCCESS_MODULE = {
  id: 2,
  name: 'Community Safety & Success',
}
const COACHING_ON_UPCHIEVE_MATERIALS = [
  {
    id: 1,
    moduleId: 1,
    name: 'Implementing Effective Coaching Strategies',
    key: '7b6a76',
    type: 'video',
    required: true,
    resourceId: '760386859',
    resourceUrl:
      'https://cdn.upchieve.org/training-courses/upchieve101/video-decks/implementing-effective-coaching-strategies-deck.pdf',
    links: [
      {
        displayName: 'Summary',
        url: 'https://cdn.upchieve.org/training-courses/upchieve101/upchieve-coaching-strategies-v2.pdf',
      },
    ],
  },
]
const COMMUNITY_SAFETY_SUCCESS_MATERIALS = [
  {
    id: 2,
    moduleId: 2,
    name: 'Community Safety & Success',
    key: 'jsn832',
    type: 'video',
    required: true,
    resourceId: '773599358',
    resourceUrl:
      'https://cdn.upchieve.org/training-courses/upchieve101/video-decks/community-safety-&-success-deck.pdf',
    // links: undefined
  },
  {
    id: 3,
    moduleId: 2,
    name: 'Review Safety Policy',
    key: 'ps87f9',
    type: 'document',
    required: true,
    resourceId: undefined,
    resourceUrl:
      'https://cdn.upchieve.org/training-courses/upchieve101/upchieve-student-safety-policy.pdf',
    // links: undefined
  },
  {
    id: 4,
    moduleId: 2,
    name: 'Review Academic Integrity Policy',
    key: 'jgu55k',
    type: 'document',
    required: true,
    // resourceId: undefined,
    resourceUrl:
      'https://cdn.upchieve.org/training-courses/upchieve101/upchieve-academic-integrity-policy.pdf',
    // links: undefined
  },
  {
    id: 5,
    moduleId: 2,
    name: 'Review Diversity, Equity, and Inclusion Policy',
    key: 'fj8tzq',
    type: 'document',
    required: true,
    // resourceId: undefined,
    resourceUrl:
      'https://cdn.upchieve.org/training-courses/upchieve101/volunteer-dei-policy-v2.pdf',
    // links: undefined
  },
]

describe('getRequiredMaterialKeysByTrainingCourseName', () => {
  it('Returns an empty array for a training course that does not exist', async () => {
    await expect(() =>
      TrainingCourseRepo.getRequiredMaterialKeysByTrainingCourseName(
        'this-course-does-not-exist'
      )
    ).rejects.toThrow('No required material keys returned')
  })

  it('Returns the required material keys', async () => {
    const actual =
      await TrainingCourseRepo.getRequiredMaterialKeysByTrainingCourseName(
        UPCHIEVE_101_COURSE_NAME
      )
    expect(new Set(actual)).toEqual(new Set(UPCHIEVE_101_REQUIRED_MATERIALS))
  })
})

describe('getFullTrainingCourseByName', () => {
  it('Throws an error if the training course cannot be found', async () => {
    const trainingCourseName = 'this-does-not-exist'
    await expect(() =>
      TrainingCourseRepo.getFullTrainingCourseByName(trainingCourseName)
    ).rejects.toThrow(
      `Did not find training course with name ${trainingCourseName}`
    )
  })

  it('Returns the full training course with all modules and materials', async () => {
    const actual = await TrainingCourseRepo.getFullTrainingCourseByName(
      UPCHIEVE_101_COURSE_NAME
    )
    expect(actual.trainingCourse).toMatchObject({
      ...UPCHIEVE_101_TRAINING_COURSE,
    })
    expect(actual.modules).toMatchObject([
      {
        ...COACHING_ON_UPCHIEVE_MODULE,
      },
      {
        ...COMMUNITY_SAFETY_SUCCESS_MODULE,
      },
    ])
    expect(actual.materials.length).toEqual(5)
    expect(actual.materials).toMatchObject([
      ...COACHING_ON_UPCHIEVE_MATERIALS,
      ...COMMUNITY_SAFETY_SUCCESS_MATERIALS,
    ])
  })
})
