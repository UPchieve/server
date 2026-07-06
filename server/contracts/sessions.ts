import type { ISODateString } from '../types/dates'
import type { Uuid } from '../types/shared'

export type SessionUserInfoPublic = {
  // TODO: migrate all uses of `_id` to `id`
  _id: Uuid
  id: Uuid
  // TODO: remove `firstname` in favor of `firstName`. The frontend must be refactored first
  firstname: string
  firstName: string
}

export type SessionMessagePublic = {
  user: Uuid
  contents: string
  createdAt: ISODateString
}

export type CurrentSessionPublic = {
  _id: Uuid
  id: Uuid
  studentId: Uuid
  volunteerId?: Uuid
  student: SessionUserInfoPublic
  volunteer?: SessionUserInfoPublic
  volunteerJoinedAt?: ISODateString
  messages: SessionMessagePublic[]
  toolType: string
  docEditorVersion?: number
  studentBannedFromLiveMedia?: boolean
  volunteerBannedFromLiveMedia?: boolean
  volunteerLanguages?: string[]
  // TODO: Rename this property, this refers to a topic's name
  type: string
  subTopic: string
  createdAt: ISODateString
  endedAt?: ISODateString
  endedBy?: Uuid
}
