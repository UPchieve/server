import type { ModerationInfractionCategories } from '../services/ModerationService/types'
import type { ISODateString } from '../types/dates'
import type { Uuid } from '../types/shared'
import type { AssignmentPublic } from './assignments'
import type { StudentUserProfilePublic } from './students'

export type TeacherProfilePublic = {
  userId: Uuid
  schoolId?: Uuid
  createdAt: ISODateString
}

export type TeacherClassForStudent = {
  id: Uuid
  name: string
  active: boolean
  topicId?: number
  createdAt: ISODateString
}

export type TeacherClassPublic = {
  id: Uuid
  userId: Uuid
  name: string
  code: string
  active: boolean
  topicId?: number
  deactivatedOn?: ISODateString
  cleverId?: string
  totalStudents?: Number
  createdAt: ISODateString
}

export type TeacherClassForStudentPublic = {
  id: Uuid
  name: string
  active: boolean
  topicId?: number
  createdAt: ISODateString
}

export type TeacherClassWithStudentsPublic = TeacherClassPublic & {
  students: StudentUserProfilePublic[]
}

export type TeacherClassResponse = {
  teacherClass: TeacherClassPublic | undefined
}

// Normalize to use TeacherClassResponse instead
export type UpdateTeacherClassResponse = {
  updatedClass: TeacherClassPublic | undefined
}

export type TeacherClassWithStudentsResponse = {
  teacherClasses: TeacherClassWithStudentsPublic[]
}

export type StudentsInTeacherClassResponse = {
  students: StudentUserProfilePublic[]
}

export type RemovedStudentFromClassResponse = {
  removedId: {
    studentId: Uuid
    studentid: Uuid
  }[]
}

export type TeacherCreateAssignmentResponse = {
  moderationFailures?: ModerationInfractionCategories
  assignment?: AssignmentPublic
}

export type TeacherAssignmentsResponse = {
  assignments: AssignmentPublic[]
}
