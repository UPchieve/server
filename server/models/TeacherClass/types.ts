import { Uuid, Ulid } from '../pgUtils'

export type TeacherClass = {
  id: Uuid
  active: boolean
  code: string
  name: string
  topicId?: number
  userId: Ulid
  createdAt: Date
  updatedAt: Date
}

export type TeacherClassResult = Pick<
  TeacherClass,
  'id' | 'name' | 'active' | 'topicId' | 'createdAt' | 'updatedAt'
>
