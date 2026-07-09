import type { StudentUserProfile } from '../models/Student'
import type { Uuid } from './shared'

export type TeacherProfile = {
  userId: Uuid
  schoolId?: Uuid
  createdAt: Date
}

export type TeacherClass = {
  id: Uuid
  userId: Uuid
  name: string
  code: string
  active: boolean
  topicId?: number
  deactivatedOn?: Date
  cleverId?: string
  totalStudents?: Number
  createdAt: Date
}

export type TeacherClassForStudent = {
  id: Uuid
  name: string
  active: boolean
  topicId?: number
  createdAt: Date
}

export type TeacherClassWithStudents = TeacherClass & {
  students: StudentUserProfile[]
}

export type CreateTeacherPayload = Pick<TeacherProfile, 'userId' | 'schoolId'>

export type CreateTeacherClassPayload = Pick<
  TeacherClass,
  'userId' | 'name' | 'code' | 'topicId' | 'cleverId'
>
