import { runInTransaction, TransactionClient } from '../db'
import { InputError } from '../models/Errors'
import { Ulid } from '../models/pgUtils'
import * as AssignmentsService from './AssignmentsService'
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
    const topic = topicId ? await SubjectsRepo.getTopics(topicId, tc) : []
    return { ...newClass, topic: topic[0] }
  })
}

export async function getTeacherClasses(userId: Ulid) {
  return runInTransaction(async (tc: TransactionClient) => {
    const teacherClasses = await TeacherRepo.getTeacherClassesByUserId(
      userId,
      tc
    )
    const teacherClassesAndStudents = await Promise.all(
      teacherClasses.map(async teacherClass => {
        const students = await getStudentsInTeacherClass(teacherClass.id)
        return {
          ...teacherClass,
          students,
        }
      })
    )
    return teacherClassesAndStudents
  })
}

export async function getTeacherClassByClassCode(code: string) {
  return runInTransaction(async (tc: TransactionClient) => {
    const teacherClass = await TeacherRepo.getTeacherClassByClassCode(code, tc)
    return teacherClass
  })
}

export async function getTeacherClassById(id: Ulid) {
  return runInTransaction(async (tc: TransactionClient) => {
    const teacherClass = await TeacherRepo.getTeacherClassById(id, tc)
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

export async function getTeacherSchoolIdFromClassCode(
  code: string,
  tc?: TransactionClient
) {
  return runInTransaction(async (tc: TransactionClient) => {
    const teacherClass = await TeacherRepo.getTeacherClassByClassCode(code, tc)
    if (!teacherClass) return

    const teacher = await TeacherRepo.getTeacherById(teacherClass.userId, tc)
    if (!teacher) return

    return teacher.schoolId
  }, tc)
}

export async function addStudentToTeacherClass(
  userId: Ulid,
  classCode: string,
  tc?: TransactionClient
) {
  return runInTransaction(async (tc: TransactionClient) => {
    const teacherClass = await TeacherRepo.getTeacherClassByClassCode(
      classCode,
      tc
    )
    if (!teacherClass) throw new InputError('Invalid class code.')

    // Order is important here: when assigning a student to all the class
    // assignments (i.e. the assignments that are assigned to the entire class),
    // we don't want to include the newly added student in that count.
    await AssignmentsService.addStudentToClassAssignments(
      userId,
      teacherClass.id,
      tc
    )
    await StudentRepo.addStudentToTeacherClass(tc, userId, teacherClass.id)

    return teacherClass
  }, tc)
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
