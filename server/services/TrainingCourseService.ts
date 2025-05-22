import { UserContactInfo } from '../models/User'
import { TrainingCourses } from '../models/Volunteer'
import {
  getVolunteerTrainingCourses,
  updateVolunteerTrainingById,
} from '../models/Volunteer'
import * as TrainingUtils from '../utils/training-courses'
import logger from '../logger'
import { runInTransaction, TransactionClient } from '../db'
import * as TrainingCourseRepo from '../models/TrainingCourses'
import {
  FullTrainingCourse,
  TrainingCourseModuleWithMaterials,
} from '../models/TrainingCourses'

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
  completdMaterialKey: string
): Promise<CourseProgress> {
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
    const requiredMaterialKeys =
      await getRequiredMaterialsForTrainingCourse(courseKey)
    if (volunteerCourse.completedMaterials.includes(completdMaterialKey)) {
      // This _shouldn't_ happen if the client is making the right calls,
      // but it appears to happen on occasion.
      // TODO Remove once we figure out why.
      materialAlreadyCompleted = true
      logger.warn(
        {
          courseKey,
          materialKey: completdMaterialKey,
        },
        'User has already completed this training material'
      )
    } else {
      completedMaterialKeys.push(completdMaterialKey)
    }

    // @TODO Drop the `complete` column altogether - it is redundant with `progress`
    // Let isComplete be a generated column OR just drop it and read progress === 100 instead
    if (!materialAlreadyCompleted) {
      const updated = await updateVolunteerTrainingById(
        volunteer.id,
        courseKey,
        requiredMaterialKeys,
        completdMaterialKey,
        tc
      )
      return {
        progress: updated.progress,
        isComplete: updated.complete,
      }
    }
    return {
      progress: volunteerCourse.progress,
      isComplete: volunteerCourse.progress === 100,
    }
  })
}

export async function getRequiredMaterialsForTrainingCourse(
  trainingCourseName: string
): Promise<string[]> {
  return await TrainingCourseRepo.getRequiredMaterialKeysByTrainingCourseName(
    trainingCourseName
  )
}

export async function getTrainingCourse(
  trainingCourseName: string
): Promise<FullTrainingCourse> {
  const result =
    await TrainingCourseRepo.getFullTrainingCourseByName(trainingCourseName)
  const modules: TrainingCourseModuleWithMaterials[] = []
  result.modules.forEach((module) => {
    const moduleMaterials = result.materials.filter(
      (material) => material.moduleId === module.id
    )
    modules.push({
      ...module,
      materials: moduleMaterials,
    })
  })
  return {
    ...result.trainingCourse,
    modules,
  }
}
