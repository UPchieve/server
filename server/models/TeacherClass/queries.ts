import * as pgQueries from './pg.queries'
import { getClient, TransactionClient } from '../../db'
import { makeRequired, makeSomeOptional, Ulid, Uuid } from '../pgUtils'
import { RepoDeleteError, RepoReadError } from '../Errors'
import { TeacherClass } from '../../types/teachers'
import { toTeacherClass } from '../Teacher/queries'

export async function getTeacherClassesForStudent(
  studentId: Ulid,
  tc: TransactionClient = getClient()
): Promise<TeacherClass[]> {
  try {
    const rows = await pgQueries.getTeacherClassesForStudent.run(
      { studentId },
      tc
    )
    return rows.map((row) => toTeacherClass(makeSomeOptional(row, ['topicId'])))
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getTotalStudentsInClass(
  classId: Uuid,
  tc: TransactionClient
): Promise<number> {
  try {
    const [row] = await pgQueries.getTotalStudentsInClass.run({ classId }, tc)
    return row?.count ?? 0
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function removeStudentsFromClass(
  studentIds: Ulid[],
  classId: Uuid,
  tc: TransactionClient
): Promise<{ studentId: Uuid }[]> {
  try {
    const rows = await pgQueries.removeStudentsFromClass.run(
      {
        studentIds,
        classId,
      },
      tc
    )
    return rows.map(makeRequired)
  } catch (err) {
    throw new RepoDeleteError(err)
  }
}
