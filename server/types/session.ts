import { Uuid } from './shared'

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
export type CurrentSession = {
  _id: Uuid
  id: Uuid
  studentId: Uuid
  volunteerId?: Uuid
  subTopic: string
  type: string
  student: CurrentSessionUser
  volunteer?: CurrentSessionUser
  volunteerJoinedAt?: Date
  messages: MessageForFrontend[]
  endedAt?: Date
  endedBy?: Uuid
  toolType: string
  docEditorVersion?: number
  studentBannedFromLiveMedia?: boolean
  volunteerBannedFromLiveMedia?: boolean
  volunteerLanguages?: string[]
  createdAt: Date
}
