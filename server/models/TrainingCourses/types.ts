export type TrainingCourse = {
  id: number
  displayName: string
  name: string
  description?: string
  quizId: number
  quizName: string
  createdAt: Date
  updatedAt: Date
}

export type FullTrainingCourse = TrainingCourse & {
  modules: TrainingCourseModuleWithMaterials[]
}

export type TrainingCourseModule = {
  id: number
  name: string
  createdAt: Date
  updatedAt: Date
}

export type TrainingCourseMaterialLink = {
  displayName: string
  url: string
}

export type TrainingCourseMaterialType =
  | 'video'
  | 'document'
  | 'link'
  | 'resources'

export type TrainingCourseModuleMaterial = {
  id: number
  moduleId: number
  name: string
  key: string
  type: TrainingCourseMaterialType
  required: boolean
  resourceUrl: string
  resourceId?: string // the ID Vimeo gives a video when uploaded
  links?: TrainingCourseMaterialLink[]
  createdAt: Date
  updatedAt: Date
}

export type TrainingCourseModuleWithMaterials = TrainingCourseModule & {
  id: number
  name: string
  materials: TrainingCourseModuleMaterial[]
}
