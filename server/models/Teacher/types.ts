import { Ulid, Uuid } from '../pgUtils'

export type TeacherProfile = {
  userId: Ulid
  schoolId?: Uuid
  createdAt: Date
  updatedAt: Date
}

export type CreateTeacherPayload = Pick<TeacherProfile, 'userId' | 'schoolId'>

export type TeacherClass = {
  userId: Ulid
  name: string
  code: string
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export type CreateTeacherClassPayload = Omit<
  TeacherClass,
  'active' | 'createdAt' | 'updatedAt'
>
