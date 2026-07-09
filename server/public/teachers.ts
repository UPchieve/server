import type {
  TeacherClassForStudentPublic,
  TeacherClassPublic,
  TeacherClassWithStudentsPublic,
  TeacherProfilePublic,
} from '../contracts/teachers'
import type {
  TeacherClass,
  TeacherProfile,
  TeacherClassForStudent,
  TeacherClassWithStudents,
} from '../types/teachers'
import { toStudentProfilePublic } from './students'

export function toTeacherClassForStudentPublic(
  teacherClass: TeacherClassForStudent
): TeacherClassForStudentPublic {
  return {
    id: teacherClass.id,
    active: teacherClass.active,
    name: teacherClass.name,
    topicId: teacherClass?.topicId,
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
    topicId: teacherClass?.topicId,
    cleverId: teacherClass?.cleverId,
    totalStudents: teacherClass?.totalStudents,
    createdAt: teacherClass.createdAt.toISOString(),
    deactivatedOn: teacherClass.deactivatedOn?.toISOString(),
  }
}

export function toTeacherProfilePublic(
  profile: TeacherProfile
): TeacherProfilePublic {
  return {
    userId: profile.userId,
    schoolId: profile.schoolId,
    createdAt: profile.createdAt.toISOString(),
  }
}

export function toTeacherClassWithStudentsPublic(
  teacherClass: TeacherClassWithStudents
): TeacherClassWithStudentsPublic {
  const { students, ...rest } = teacherClass
  return {
    ...toTeacherClassPublic(rest),
    students: students.map(toStudentProfilePublic),
  }
}
