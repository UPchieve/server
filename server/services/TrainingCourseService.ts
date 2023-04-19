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
  // if the volunteer has no progress so far make a blank
  const volunteerCourse = foundCourse || {
    complete: false,
    completedMaterials: [],
    progress: 0,
  }

  const course = Object.assign(
    {},
    await TrainingUtils.getCourse(courseKey, volunteer.id)
  )
  course.modules.forEach((mod: any) => {
    mod.materials.forEach((mat: any) => {
      mat.isCompleted = volunteerCourse.completedMaterials.includes(
        mat.materialKey
      )
    })
  })
  return {
    ...course,
    isComplete: volunteerCourse.complete,
    progress: volunteerCourse.progress,
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
  // if the volunteer has no progress so far make a blank
  const volunteerCourse = foundCourse || {
    complete: false,
    completedMaterials: [],
    progress: 0,
  }

  // Early exit if already saved progress
  if (volunteerCourse.completedMaterials.includes(materialKey)) return

  // Mutate user object's completedMaterials
  const completedMaterials = [...volunteerCourse.completedMaterials]
  completedMaterials.push(materialKey)

  const progress = await TrainingUtils.getProgress(
    courseKey,
    completedMaterials,
    volunteer.id
  )
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
