import { runInTransaction, TransactionClient } from '../db'
import { Ulid } from '../models/pgUtils'
import * as StudentRepo from '../models/Student'
import * as TeacherRepo from '../models/Teacher'
import generateAlphanumericOfLength from '../utils/generate-alphanumeric'

export async function createTeacherClass(userId: Ulid, className: string) {
  return runInTransaction(async (tc: TransactionClient) => {
    const code = await generateUniqueClassCode(tc)
    return TeacherRepo.createTeacherClass(
      {
        userId,
        name: className,
        code,
      },
      tc
    )
  })
}

export async function getTeacherClasses(userId: Ulid) {
  return TeacherRepo.getTeacherClassesByUserId(userId)
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
