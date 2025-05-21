import * as TrainingCourseRepo from '../../models/TrainingCourses'

const UPCHIEVE_101_COURSE_NAME = 'upchieve101'
const UPCHIEVE_101_REQUIRED_MATERIALS = [
  '7b6a76',
  'jsn832',
  'ps87f9',
  'jgu55k',
  'fj8tzq',
]
describe('getRequiredMaterialKeysByTrainingCourseName', () => {
  it('Returns an empty array for a training course that does not exist', async () => {
    const actual =
      await TrainingCourseRepo.getRequiredMaterialKeysByTrainingCourseName(
        'this-course-does-not-exist'
      )
    expect(actual).toEqual([])
  })

  it('Returns the required material keys', async () => {
    const actual =
      await TrainingCourseRepo.getRequiredMaterialKeysByTrainingCourseName(
        UPCHIEVE_101_COURSE_NAME
      )
    expect(new Set(actual)).toEqual(new Set(UPCHIEVE_101_REQUIRED_MATERIALS))
  })
})
