import { Ulid, Uuid } from '../pgUtils'

export type TeacherProfile = {
  userId: Ulid
  schoolId?: Uuid
  createdAt: Date
  updatedAt: Date
}

export type CreateTeacherPayload = Pick<TeacherProfile, 'userId' | 'schoolId'>

export type TeacherClass = {
  id: Ulid
  cleverId?: string
  userId: Ulid
  name: string
  code: string
  total_students?: Number
  topicId?: number
  createdAt: Date
  updatedAt: Date
}

export type CreateTeacherClassPayload = Pick<
  TeacherClass,
  'userId' | 'name' | 'code' | 'topicId' | 'cleverId'
>
