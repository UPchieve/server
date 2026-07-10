import type { MaterialType, TRAINING, TRAINING_QUIZZES } from '../constants'
import type { Uuid } from './shared'

export type UserTrainingCourseProgress = {
  userId: Uuid
  complete: boolean
  trainingCourse: string
  progress: number
  completedMaterials: string[]
  createdAt: Date
}

export type UserTrainingCourses = Record<string, UserTrainingCourseProgress>

export type TrainingCourseProgressData = {
  complete: boolean
  progress: number
  completedMaterials: string[]
}

// TODO: Replace usage with `UserTrainingCourseProgress`
// after the repo has mappers to domain types
export type UserTrainingCourseProgressRow = {
  userId: Uuid
  trainingCourseId: number
  complete: boolean
  progress: number
  completedMaterials: string[]
  createdAt: Date
}

export type TrainingCourses = {
  [TRAINING.UPCHIEVE_101]: TrainingCourseProgressData
  [TRAINING.UPCHIEVE_TRAINING]: TrainingCourseProgressData
  [TRAINING.TUTORING_SKILLS]: TrainingCourseProgressData
  [TRAINING.COLLEGE_COUNSELING]: TrainingCourseProgressData
  [TRAINING.COLLEGE_SKILLS]: TrainingCourseProgressData
  [TRAINING.SAT_STRATEGIES]: TrainingCourseProgressData
}

export type TrainingMaterialLink = {
  displayName: string
  url: string
}

export type TrainingCourseMaterial = {
  name: string
  description?: string
  materialKey: string
  isRequired: boolean
  type: MaterialType
  // the ID Vimeo gives a video when uploaded
  resourceId?: string
  linkUrl?: string
  links?: TrainingMaterialLink[]
  videoPDF?: string
  linkLabel?: string
}

export type TrainingCourseModule = {
  name: string
  key?: string
  materials: TrainingCourseMaterial[]
  quizKey?: string
}

export interface TrainingCourse {
  name: string
  courseKey: string
  description: string
  modules: TrainingCourseModule[]
  requiredCertifications: TRAINING_QUIZZES[]
  // @TODO After deprecating the legacy training course (upchieve101), remove these props
  quizKey?: string
  quizName?: string
}

export type TrainingCourseWithUserProgress = TrainingCourse & {
  progress: number
  isComplete: boolean
  completedMaterials: string[]
}

export type UserTrainingCourseProgressUpdate = {
  progress: number
  isComplete: boolean
  completedMaterialKeys: string[]
}
