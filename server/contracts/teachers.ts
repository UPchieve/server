import type { ISODateString } from '../types/dates'
import type { Uuid } from '../types/shared'

export type TeacherClassPublic = {
  id: Uuid
  active: boolean
  name: string
  topicId?: number
  createdAt: ISODateString
  updatedAt: ISODateString
}
