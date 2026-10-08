import type {
  TeacherClassForStudentPublic,
  TeacherClassPublic,
  TeacherClassWithStudentsPublic,
  TeacherAssignmentPublic,
} from './teachers'
import type { TeacherClass, TeacherClassWithStudents } from '../types/teachers'
import { toStudentProfilePublic } from './students.mappers'
import type { Assignment } from '../models/Assignments'
import { toAssignmentPublic } from './assignments.mappers'
import type { TeacherClassForStudent } from '../types/teachers'

export function toTeacherClassForStudentPublic(
  teacherClass: TeacherClassForStudent
): TeacherClassForStudentPublic {
  return {
    id: teacherClass.id,
    active: teacherClass.active,
    name: teacherClass.name,
    topicId: teacherClass.topicId,
    createdAt: teacherClass.createdAt.toISOString(),
  }
}

export function toTeacherClassPublic(
  teacherClass: TeacherClass
): TeacherClassPublic {
  return {
    id: teacherClass.id,
    userId: teacherClass.userId,
    name: teacherClass.name,
    code: teacherClass.code,
    active: teacherClass.active,
    topicId: teacherClass.topicId,
    cleverId: teacherClass.cleverId,
    totalStudents: teacherClass.totalStudents,
    deactivatedOn: teacherClass.deactivatedOn?.toISOString(),
    createdAt: teacherClass.createdAt.toISOString(),
  }
}

export function toTeacherClassWithStudentsPublic(
  teacherClass: TeacherClassWithStudents
): TeacherClassWithStudentsPublic {
  return {
    ...toTeacherClassPublic(teacherClass),
    students: teacherClass.students.map(toStudentProfilePublic),
  }
}

export function toTeacherAssignmentPublic(
  assignment: Assignment
): TeacherAssignmentPublic {
  return {
    ...toAssignmentPublic(assignment),
    studentIds: assignment.studentIds,
  }
}
