import * as pgQueries from './pg.queries'
import { getClient, TransactionClient } from '../../db'
import { makeSomeOptional, Ulid, Uuid } from '../pgUtils'
import { RepoDeleteError, RepoReadError } from '../Errors'
import { TeacherClassResult } from './types'

export async function getTeacherClassesForStudent(
  studentId: Ulid,
  tc: TransactionClient = getClient()
): Promise<TeacherClassResult[]> {
  try {
    const teacherClasses = await pgQueries.getTeacherClassesForStudent.run(
      { studentId },
      tc
    )
    return teacherClasses.map(c => makeSomeOptional(c, ['topicId']))
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getTotalStudentsInClass(
  classId: Uuid,
  tc: TransactionClient
): Promise<number> {
  try {
    const result = await pgQueries.getTotalStudentsInClass.run({ classId }, tc)
    return result[0]?.count ?? 0
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function removeStudentFromClass(
  studentId: Ulid,
  classId: Ulid,
  tc: TransactionClient = getClient()
) {
  try {
    return pgQueries.removeStudentFromClass.run({ studentId, classId }, tc)
  } catch (err) {
    throw new RepoDeleteError(err)
  }
}
