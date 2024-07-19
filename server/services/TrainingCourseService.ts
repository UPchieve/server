import { UserContactInfo } from '../models/User'
import { TrainingCourses } from '../models/Volunteer'
import {
  getVolunteerTrainingCourses,
  updateVolunteerTrainingById,
} from '../models/Volunteer'
import * as TrainingUtils from '../utils/training-courses'
import logger from '../logger'

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

interface CourseProgress {
  progress: number
  isComplete: boolean
}
export async function recordProgress(
  volunteer: UserContactInfo,
  courseKey: keyof TrainingCourses,
  materialKey: string
): Promise<CourseProgress> {
  const volunteerTrainingCourses = await getVolunteerTrainingCourses(
    volunteer.id
  )

  const volunteerCourse = volunteerTrainingCourses.hasOwnProperty(courseKey)
    ? volunteerTrainingCourses[courseKey]
    : {
        complete: false,
        completedMaterials: [] as string[],
        progress: 0,
      }

  // A course may have several materials to complete.
  // The user may already have some progress toward the course if
  // they have completed any of the materials.
  let materialAlreadyCompleted = false
  const completedMaterials = [...volunteerCourse.completedMaterials]
  if (volunteerCourse.completedMaterials.includes(materialKey)) {
    // This _shouldn't_ happen if the client is making the right calls,
    // but it appears to happen on occasion.
    // TODO Remove once we figure out why.
    materialAlreadyCompleted = true
    logger.warn(
      {
        courseKey,
        materialKey,
      },
      'User has already completed this training material'
    )
  } else {
    completedMaterials.push(materialKey)
  }

  const progress = await TrainingUtils.getProgress(
    courseKey,
    completedMaterials,
    volunteer.id
  )
  const isComplete = progress === 100

  if (!materialAlreadyCompleted) {
    await updateVolunteerTrainingById(
      volunteer.id,
      courseKey,
      isComplete,
      progress,
      materialKey
    )
  }

  return { progress, isComplete }
}
