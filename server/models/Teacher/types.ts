import { Ulid, Uuid } from '../pgUtils'

export type TeacherProfile = {
  userId: Ulid
  schoolId?: Uuid
  createdAt: Date
  updatedAt: Date
}

export type CreateTeacherPayload = Pick<TeacherProfile, 'userId' | 'schoolId'>
