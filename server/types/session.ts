import { Uuid } from './shared'

// TODO: Change name to SessionMessage, this should be a domain type, not a public type
export type MessageForFrontend = {
  user: Uuid
  contents: string
  createdAt: Date
}

export type CurrentSessionUser = {
  createdAt: Date
  _id: Uuid
  id: Uuid
  // TODO: remove `firstname` in favor of `firstName`. The frontend must be refactored first
  firstname: string
  firstName: string
  pastSessions: Uuid[]
}

// This type represents the user's in-progress tutoring session
export type CurrentSession = {
  _id: Uuid
  id: Uuid
  studentId: Uuid
  volunteerId?: Uuid
  subTopic: string
  subject: string
  subjectDisplayName: string
  type: string
  topic: string
  student: CurrentSessionUser
  volunteer?: CurrentSessionUser
  volunteerJoinedAt?: Date
  messages: MessageForFrontend[]
  endedAt?: Date
  endedBy?: Uuid
  // TODO: Use a typing instead of string
  toolType: string
  docEditorVersion?: number
  studentBannedFromLiveMedia?: boolean
  volunteerBannedFromLiveMedia?: boolean
  volunteerLanguages?: string[]
  shadowbanned?: boolean
  createdAt: Date
}
