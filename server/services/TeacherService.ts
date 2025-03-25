import _ from 'lodash'
import { getClient, runInTransaction, TransactionClient } from '../db'
import { InputError } from '../models/Errors'
import { Ulid, Uuid } from '../models/pgUtils'
import * as AssignmentsService from './AssignmentsService'
import * as StudentService from './StudentService'
import * as StudentRepo from '../models/Student'
import * as SubjectsRepo from '../models/Subjects'
import * as TeacherRepo from '../models/Teacher'
import * as TeacherClassRepo from '../models/TeacherClass'
import * as UserRepo from '../models/User'
import generateAlphanumericOfLength from '../utils/generate-alphanumeric'
import { USER_BAN_REASONS, USER_BAN_TYPES } from '../constants'
import { StudentUserProfile } from '../models/Student'
import { TeacherClassWithStudents } from '../models/Teacher'

export async function getTeacherById(userId: Ulid, tc?: TransactionClient) {
  return runInTransaction(async (tc: TransactionClient) => {
    return TeacherRepo.getTeacherById(userId, tc)
  }, tc)
}

export async function createTeacherClass(
  userId: Ulid,
  className: string,
  topicId?: number,
  cleverId?: string,
  tc?: TransactionClient
) {
  return runInTransaction(async (tc: TransactionClient) => {
    const code = await generateUniqueClassCode(tc)
    const newClass = await TeacherRepo.createTeacherClass(
      {
        userId,
        name: className,
        code,
        topicId,
        cleverId,
      },
      tc
    )
    const topic = topicId ? await SubjectsRepo.getTopics(topicId, tc) : []
    return { ...newClass, topic: topic[0] }
  }, tc)
}

export async function getTeacherClasses(
  userId: Ulid,
  tc?: TransactionClient
): Promise<TeacherClassWithStudents[]> {
  return runInTransaction(async (tc: TransactionClient) => {
    const teacherClasses = await TeacherRepo.getTeacherClassesByUserId(
      userId,
      tc
    )
    const teacherClassesAndStudents = await Promise.all(
      teacherClasses.map(async (teacherClass) => {
        const students = await getStudentsInTeacherClass(teacherClass.id, tc)
        return {
          ...teacherClass,
          students,
        }
      })
    )
    return teacherClassesAndStudents
  }, tc)
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

export async function getStudentIdsInTeacherClass(
  classId: Ulid,
  tc: TransactionClient
): Promise<Ulid[]> {
  return runInTransaction(async (tc: TransactionClient) => {
    return TeacherRepo.getStudentIdsInTeacherClass(tc, classId)
  }, tc)
}

export async function getStudentsInTeacherClass(
  classId: Ulid,
  tc?: TransactionClient
): Promise<StudentUserProfile[]> {
  return runInTransaction(async (tc: TransactionClient) => {
    const studentIds = await TeacherRepo.getStudentIdsInTeacherClass(
      tc,
      classId
    )
    return StudentRepo.getStudentProfilesByUserIds(tc, studentIds)
  }, tc)
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

export async function addStudentToTeacherClassByClassCode(
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
    if (teacherClass.cleverId)
      throw new InputError('Unable to edit students in Clever class.')

    await addStudentsToTeacherClassById([userId], teacherClass.id, tc)
    return teacherClass
  }, tc)
}

export async function addStudentsToTeacherClassById(
  studentIds: Ulid[],
  classId: Uuid,
  tc: TransactionClient
) {
  return runInTransaction(async (tc: TransactionClient) => {
    // We automatically add students to all the class assignments
    // (i.e. the assignments that are assigned to the entire class) when
    // they join a class.
    // Order is important here: when assigning a student to all the class
    // assignments, we don't want to include the newly added students in
    // that count.
    await AssignmentsService.addStudentsToClassAssignments(
      studentIds,
      classId,
      tc
    )
    return StudentRepo.addStudentsToTeacherClass(studentIds, classId, tc)
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

export async function updateTeacherClass(
  id: string,
  name: string,
  topicId: number
) {
  const updatedClass = await TeacherRepo.updateTeacherClass({
    id,
    name,
    topicId,
  })
  return updatedClass
}

export async function deactivateTeacherClass(
  id: string,
  tc?: TransactionClient
) {
  return runInTransaction(async (tc: TransactionClient) => {
    return TeacherRepo.deactivateTeacherClass(id, tc)
  }, tc)
}

export async function removeStudentFromClass(studentId: Ulid, classId: Ulid) {
  return runInTransaction(async (tc: TransactionClient) => {
    const teacherClass = await TeacherRepo.getTeacherClassById(classId, tc)
    if (!teacherClass) throw new InputError('Invalid class id.')
    if (teacherClass.cleverId)
      throw new InputError('Unable to edit students in Clever class.')

    return removeStudentsFromTeacherClassById([studentId], classId, tc)
  })
}

export async function removeStudentsFromTeacherClassById(
  studentIds: Ulid[],
  classId: Ulid,
  tc: TransactionClient
) {
  return runInTransaction(async (tc: TransactionClient) => {
    return TeacherClassRepo.removeStudentsFromClass(studentIds, classId, tc)
  }, tc)
}

export async function adminUpdateTeacher(
  teacherId: Ulid,
  updateData: {
    firstName?: string
    lastName?: string
    email: string
    isDeactivated: boolean
    isVerified: boolean
    banType?: USER_BAN_TYPES
    banReason?: USER_BAN_REASONS
    schoolId?: string
  },
  tc?: TransactionClient
) {
  return runInTransaction(async (tc: TransactionClient) => {
    await UserRepo.adminUpdateUser(teacherId, updateData, tc)

    const teacherBeforeUpdate = await TeacherRepo.getTeacherById(teacherId, tc)
    if (!teacherBeforeUpdate) {
      throw new Error('User is not a teacher.')
    }

    if (!updateData.schoolId) {
      // No new school to update to - a teacher must have a school.
      return
    }

    if (teacherBeforeUpdate.schoolId !== updateData.schoolId) {
      await TeacherRepo.updateTeacherSchool(teacherId, updateData.schoolId, tc)

      const teacherClasses = await getTeacherClasses(teacherId, tc)
      const allTeacherStudents = _.uniqBy(
        teacherClasses
          .map((teacherClass) => {
            return teacherClass.students
          })
          .reduce((a, b) => {
            return a.concat(b)
          }, []),
        'id'
      )

      await Promise.all(
        allTeacherStudents.map(async (student) => {
          // This check for schoolId is necessary again to prevent ts error.
          if (!updateData.schoolId) return
          return StudentService.updateStudentSchool(
            student.id,
            updateData.schoolId,
            student.schoolId,
            tc
          )
        })
      )
    }
  }, tc ?? getClient())
}

export async function updateLastSuccessfulCleverSync(
  teacherId: Ulid,
  tc: TransactionClient
) {
  return TeacherRepo.updateLastSuccessfulCleverSync(teacherId, tc)
}

export async function getAllStudentsForTeacher(teacherId: Ulid) {
  return TeacherRepo.getAllStudentsForTeacher(teacherId)
}
