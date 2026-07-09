import { Uuid } from './shared'

export type UserTrainingCourseProgress = {
  userId: Uuid
  complete: boolean
  trainingCourse: string
  progress: number
  completedMaterials: string[]
  createdAt: Date
}

export type UserTrainingCourses = Record<string, UserTrainingCourseProgress>
