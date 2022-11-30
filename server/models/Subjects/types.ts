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
