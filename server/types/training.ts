import type { TRAINING } from '../constants'
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

type TrainingCourseProgressData = {
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
