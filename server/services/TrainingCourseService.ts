import cloneDeep from 'lodash'
import { Volunteer, TrainingCourses } from '../models/Volunteer'
import { updateVolunteerTrainingById } from '../models/Volunteer/queries'
import * as TrainingUtils from '../utils/training-courses'

export interface EditableTrainingCourseData {
  modules: EditableModule[]
  courseKey: string
  quizKey: string
  progress: number
  isComplete: boolean
}

interface EditableModule {
  moduleKey: string
  materials: EditableMaterial[]
}

interface EditableMaterial {
  materialKey: string
  isCompleted: boolean
}

function insertEditableFields(
  data: TrainingUtils.TrainingCourse
): EditableTrainingCourseData {
  const course = cloneDeep(data) as any
  course.isComplete = false
  course.progress = 0
  course.modules.forEach((mod: any) => {
    mod.materials.forEach((mat: any) => {
      mat.isCompleted = false
    })
  })
  return course as EditableTrainingCourseData
}

export function getCourse(
  volunteer: Volunteer,
  courseKey: keyof TrainingCourses
) {
  const courseData = TrainingUtils.getCourse(courseKey)
  if (!courseData) return
  const courseProgress = volunteer.trainingCourses[courseKey]
  const course = insertEditableFields(courseData)
  course.isComplete = courseProgress.isComplete
  course.progress = courseProgress.progress
  course.modules.forEach(mod => {
    mod.materials.forEach(mat => {
      mat.isCompleted = courseProgress.completedMaterials.includes(
        mat.materialKey
      )
    })
  })
  return course
}

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
