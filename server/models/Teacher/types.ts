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
  userId: Ulid
  name: string
  code: string
  active: boolean
  total_students?: Number
  createdAt: Date
  updatedAt: Date
}

export type CreateTeacherClassPayload = Pick<
  TeacherClass,
  'userId' | 'name' | 'code'
>
