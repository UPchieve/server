export type SubjectWithTopicPublic = {
  name: string
  id: number
  displayOrder: number
  displayName: string
  active: boolean
  topicId: number
  topicName: string
  topicDisplayName: string
  topicDashboardOrder: number
  isComputedUnlock: boolean
  topicIconLink?: string
  topicColor?: string
}

export type AllSubjectsWithTopicsPublic = {
  [subject: string]: SubjectWithTopicPublic
}

export type TrainingItemPublic = {
  key: string
  displayName: string
  active?: boolean
}

export type TopicPublic = {
  id: number
  name: string
  displayName: string
  iconLink?: string
  dashboardOrder: number
  trainingOrder: number
}

export type TrainingItemWithOrderPublic = TrainingItemPublic & {
  order: number
}

export type TrainingRowPublic = TrainingItemWithOrderPublic & {
  subjectsIncluded: TrainingItemWithOrderPublic[]
}

export type TrainingRowPerTopicPublic = {
  [topicName: string]: TrainingRowPublic[]
}

export type TrainingPerTopicPublic = {
  training: TrainingItemPublic[]
  certifications: TrainingRowPublic[]
  additionalSubjects: TrainingRowPublic[]
  computedSubjects?: TrainingRowPublic[]
}

export type TrainingViewPublic = {
  subjectTypes: TrainingItemWithOrderPublic[]
} & {
  [topicName: string]: TrainingPerTopicPublic
}

export type SubjectsResponse = {
  subjects: AllSubjectsWithTopicsPublic
}

export type TrainingResponse = {
  training: TrainingViewPublic
}

export type IsValidSubjectResponse = {
  isValid: boolean
}

export type TopicsResponse = {
  topics: TopicPublic[]
}
