import { Volunteer, TrainingCourses } from '../models/Volunteer'
import { updateVolunteerTrainingById } from '../models/Volunteer/queries'
import * as TrainingUtils from '../utils/training-courses'

// @note: this type was derived from how the return type is used by the frontend
// TODO: come back and verify this is the return shape we want
export function getCourse(
  volunteer: Volunteer,
  courseKey: keyof TrainingCourses
): any {
  const course: any = TrainingUtils.getCourse(courseKey)
  if (!course) return
  const courseProgress = volunteer.trainingCourses[courseKey]
  course.isComplete = courseProgress.isComplete
  course.progress = courseProgress.progress
  course.modules.forEach((mod: any) => {
    mod.materials.forEach((mat: any) => {
      mat.isCompleted = courseProgress.completedMaterials.includes(
        mat.materialKey
      )
    })
  })
  return course
}

// TODO: clean up return type
export async function recordProgress(
  volunteer: Volunteer,
  courseKey: keyof TrainingCourses,
  materialKey: string
) {
  const courseProgress = volunteer.trainingCourses[courseKey]

  // Early exit if already saved progress
  if (courseProgress.completedMaterials.includes(materialKey)) return

  // Mutate user object's completedMaterials
  courseProgress.completedMaterials.push(materialKey)
  const progress = TrainingUtils.getProgress(
    courseKey,
    courseProgress.completedMaterials
  )
  const isComplete = progress === 100

  await updateVolunteerTrainingById(
    volunteer._id,
    courseKey,
    isComplete,
    progress,
    materialKey
  )

  return { progress, isComplete }
}
