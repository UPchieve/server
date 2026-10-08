import type { ISODateString } from '../types/dates'
import type { Uuid } from '../types/shared'
import type { AssignmentPublic } from './assignments'
import type { StudentUserProfilePublic } from './students'

export type TeacherClassForStudentPublic = {
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
  totalStudents?: number
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
  removedId: { studentId: Uuid; studentid: Uuid }[]
}

export type TeacherUpsertAssignmentResponse = {
  assignment?: TeacherAssignmentPublic & { isCreated: boolean }
  moderationInfractions?: string[]
  imageModerationInfractions?: Record<string, string[]>
}

export type TeacherCreateAssignmentsResponse = {
  assignments?: TeacherAssignmentPublic[]
  moderationInfractions?: string[]
  imageModerationInfractions?: Record<string, string[]>
}

export type TeacherAssignmentsResponse = {
  assignments: TeacherAssignmentPublic[]
}

export type TeacherAssignmentPublic = AssignmentPublic & {
  studentIds?: Uuid[]
}
