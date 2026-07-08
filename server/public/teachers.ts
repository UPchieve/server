import type { TeacherClassPublic } from '../contracts/teachers'
import type { TeacherClassResult } from '../models/TeacherClass'

export function toTeacherClassPublic(
  teacherClass: TeacherClassResult
): TeacherClassPublic {
  return {
    id: teacherClass.id,
    active: teacherClass.active,
    name: teacherClass.name,
    topicId: teacherClass?.topicId,
    createdAt: teacherClass.createdAt.toISOString(),
    updatedAt: teacherClass.updatedAt.toISOString(),
  }
}
