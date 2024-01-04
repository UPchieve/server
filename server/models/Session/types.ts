import { Ulid } from '../pgUtils'

export type Session = {
  id: Ulid
  studentId: Ulid
  volunteerId?: Ulid
  topic: string
  subject: string
  hasWhiteboardDoc: boolean
  quillDoc?: string
  photos?: string[]
  volunteerJoinedAt?: Date
  endedAt?: Date
  endedByRole?: string
  reviewed: boolean
  toReview: boolean
  studentBanned?: boolean
  timeTutored: number
  createdAt: Date
  updatedAt: Date
  reported: boolean
  flags: string[]
  subjectDisplayName: string
  toolType: string
}

export type UserSessionStat = {
  totalRequested: number
  totalHelped: number
  topicName: string
}

export type UserSessionStats = {
  [subjectName: string]: UserSessionStat
}

export type UserSessionsFilter = {
  start?: Date
  end?: Date
  subject: string
  topic?: string
  sessionId?: Ulid
}
