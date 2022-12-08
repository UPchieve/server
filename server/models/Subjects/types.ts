export type SubjectAndTopic = {
  subjectName: string
  subjectDisplayName: string
  topicName: string
  topicDisplayName: string
}

export type SubjectWithTopic = {
  name: string
  id: number
  displayOrder: number
  displayName: string
  active: boolean
  topicId: number
  topicName: string
  topicDisplayName: string
  topicDashboardOrder: number
  topicIconLink?: string
  topicColor?: string
}

export type AllSubjectsWithTopics = { [subject: string]: SubjectWithTopic }

export type TrainingItem = {
  key: string
  displayName: string
}

export type TrainingItemWithOrder = TrainingItem & {
  order: number
}

export type TrainingRow = TrainingItemWithOrder & {
  subjectsIncluded: TrainingItemWithOrder[]
}

export type TrainingRowPerTopic = {
  [topicName: string]: TrainingRow[]
}

export type TrainingPerTopic = {
  training: TrainingItem[]
  certifications: TrainingRow[]
  additionalSubjects: TrainingRow[]
}

export type TrainingView = {
  subjectTypes: TrainingItemWithOrder[]
} & { [topicName: string]: TrainingPerTopic }

export type FormattedTrainingRowMapping = {
  rowName: string
  rowDisplayName: string
  rowDisplayOrder: number
  rowListItemName: string
  rowListItemDisplayName: string
  rowListItemDisplayOrder: number
}

export type FormattedTrainingRowMappingToKeyOf<T> = {
  rowName: keyof T
  rowDisplayName: keyof T
  rowDisplayOrder: keyof T
  rowListItemName: keyof T
  rowListItemDisplayName: keyof T
  rowListItemDisplayOrder: keyof T
}

export type FormattedTrainingPerTopic = {
  [topicName: string]: FormattedTrainingRowMapping[]
}

export type FormattedTrainingRowMappingPerTopic<T> = {
  [topicName: string]: T[]
}

export type TrainingCourses = {
  id: number
  name: string
  displayName: string
}
