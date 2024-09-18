import * as pgQueries from './pg.queries'
import { getClient, TransactionClient } from '../../db'
import { makeSomeOptional, Ulid } from '../pgUtils'
import { RepoReadError } from '../Errors'
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
