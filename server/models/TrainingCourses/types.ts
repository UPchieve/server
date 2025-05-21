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
  resourceId?: string
  links?: TrainingCourseMaterialLink[]
}
