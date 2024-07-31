import { runInTransaction, TransactionClient } from '../db'
import { Ulid } from '../models/pgUtils'
import * as StudentRepo from '../models/Student'
import * as SubjectsRepo from '../models/Subjects'
import * as TeacherRepo from '../models/Teacher'
import generateAlphanumericOfLength from '../utils/generate-alphanumeric'

export async function createTeacherClass(
  userId: Ulid,
  className: string,
  topicId?: number
) {
  return runInTransaction(async (tc: TransactionClient) => {
    const code = await generateUniqueClassCode(tc)
    const newClass = await TeacherRepo.createTeacherClass(
      {
        userId,
        name: className,
        code,
        topicId,
      },
      tc
    )
    const topic = topicId ? await SubjectsRepo.getTopics(topicId, tc) : {}
    return { ...newClass, ...topic }
  })
}

export async function getTeacherClasses(userId: Ulid) {
  return TeacherRepo.getTeacherClassesByUserId(userId)
}

export async function getTeacherClassByClassCode(code: string) {
  return runInTransaction(async (tc: TransactionClient) => {
    const teacherClass = await TeacherRepo.getTeacherClassByClassCode(code, tc)
    return teacherClass
  })
}

export async function getStudentsInTeacherClass(classId: Ulid) {
  return runInTransaction(async (tc: TransactionClient) => {
    const studentIds = await TeacherRepo.getStudentIdsInTeacherClass(
      tc,
      classId
    )
    return StudentRepo.getStudentProfilesByUserIds(tc, studentIds)
  })
}

async function generateUniqueClassCode(tc: TransactionClient) {
  let count = 5
  while (count > 0) {
    const code = generateAlphanumericOfLength(6)
    const teacherClass = await TeacherRepo.getTeacherClassByClassCode(code, tc)
    if (!teacherClass) {
      return code
    }
    count--
  }

  throw new Error('Could not generate unique class code.')
}
