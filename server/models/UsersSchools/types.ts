import { Ulid } from '../pgUtils'

export type UserSchoolAssociationType =
  | 'student_at_school'
  | 'teacher_at_school'

export type UsersSchool = {
  userId: Ulid
  schoolId: Ulid
  associationType: UserSchoolAssociationType
  createdAt: Date
  updatedAt: Date
}
