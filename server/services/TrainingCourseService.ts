import { UserContactInfo } from '../models/User'
import { TrainingCourses } from '../models/Volunteer'
import {
  getVolunteerTrainingCourses,
  updateVolunteerTrainingById,
} from '../models/Volunteer'
import * as TrainingUtils from '../utils/training-courses'

// @note: this type was derived from how the return type is used by the frontend
// TODO: come back and verify this is the return shape we want
export async function getCourse(
  volunteer: UserContactInfo,
  courseKey: keyof TrainingCourses
): Promise<any> {
  const volunteerTrainingCourses = await getVolunteerTrainingCourses(
    volunteer.id
  )
  const foundCourse = volunteerTrainingCourses[courseKey]
  if (!foundCourse) return

  const course = Object.assign({}, TrainingUtils.getCourse(courseKey))
  course.modules.forEach((mod: any) => {
    mod.materials.forEach((mat: any) => {
      mat.isCompleted = foundCourse.completedMaterials.includes(mat.materialKey)
    })
  })
  return {
    ...course,
    isComplete: foundCourse.complete,
    progress: foundCourse.progress,
    quizKey: courseKey,
  }
}

// TODO: clean up return type
export async function recordProgress(
  volunteer: UserContactInfo,
  courseKey: keyof TrainingCourses,
  materialKey: string
) {
  const volunteerTrainingCourses = await getVolunteerTrainingCourses(
    volunteer.id
  )
  const foundCourse = volunteerTrainingCourses[courseKey]
  if (!foundCourse) return

  // Early exit if already saved progress
  if (foundCourse.completedMaterials.includes(materialKey)) return

  // Mutate user object's completedMaterials
  const completedMaterials = [...foundCourse.completedMaterials]
  completedMaterials.push(materialKey)

  const progress = TrainingUtils.getProgress(courseKey, completedMaterials)
  const isComplete = progress === 100

  await updateVolunteerTrainingById(
    volunteer.id,
    courseKey,
    isComplete,
    progress,
    materialKey
  )

  return { progress, isComplete }
}
