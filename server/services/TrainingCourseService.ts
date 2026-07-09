import { UserContactInfo } from '../models/User'
import {
  getVolunteerTrainingCourses,
  updateVolunteerTrainingById,
} from '../models/Volunteer'
import * as TrainingUtils from '../utils/training-courses'
import logger from '../logger'
import { runInTransaction, TransactionClient } from '../db'
import type {
  TrainingCourses,
  TrainingCourseWithUserProgress,
  UserTrainingCourseProgressUpdate,
} from '../types/training'

export async function getCourse(
  volunteer: UserContactInfo,
  courseKey: keyof TrainingCourses
): Promise<TrainingCourseWithUserProgress> {
  const userTrainingCourses = await getVolunteerTrainingCourses(volunteer.id)
  const foundCourse = userTrainingCourses[courseKey]
  // if the volunteer has no progress so far make a blank
  const userCourse = foundCourse || {
    complete: false,
    completedMaterials: [],
    progress: 0,
  }

  const course = Object.assign(
    {},
    await TrainingUtils.getCourse(courseKey, volunteer.id)
  )

  return {
    ...course,
    progress: userCourse.progress,
    isComplete: userCourse.complete,
    completedMaterials: userCourse.completedMaterials,
  }
}

export async function recordProgress(
  volunteer: UserContactInfo,
  courseKey: keyof TrainingCourses,
  materialKey: string
): Promise<UserTrainingCourseProgressUpdate> {
  return runInTransaction(async (tc: TransactionClient) => {
    const volunteerTrainingCourses = await getVolunteerTrainingCourses(
      volunteer.id,
      tc
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
    const completedMaterialKeys = [...volunteerCourse.completedMaterials]
    const requiredMaterialKeys = await TrainingUtils.getRequiredMaterials(
      courseKey,
      volunteer.id
    )
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
      completedMaterialKeys.push(materialKey)
    }

    // @TODO Drop the `complete` column altogether - it is redundant with `progress`
    // Let isComplete be a generated column OR just drop it and read progress === 100 instead
    if (!materialAlreadyCompleted) {
      const updated = await updateVolunteerTrainingById(
        volunteer.id,
        courseKey,
        requiredMaterialKeys,
        materialKey,
        tc
      )
      return {
        progress: updated.progress,
        isComplete: updated.complete,
        completedMaterialKeys,
      }
    }
    return {
      progress: volunteerCourse.progress,
      isComplete: volunteerCourse.progress === 100,
      completedMaterialKeys,
    }
  })
}
