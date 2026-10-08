import * as pgQueries from './pg.queries'
import { getClient, TransactionClient } from '../../db'
import { makeSomeRequired } from '../pgUtils'
import { RepoDeleteError, RepoReadError } from '../Errors'
import type { Uuid } from '../../types/shared'
import type { TeacherClassForStudent } from '../../types/teachers'

export async function getTeacherClassesForStudent(
  studentId: Uuid,
  tc: TransactionClient = getClient()
): Promise<TeacherClassForStudent[]> {
  try {
    const rows = await pgQueries.getTeacherClassesForStudent.run(
      { studentId },
      tc
    )
    return rows.map((row) =>
      makeSomeRequired(row, ['id', 'name', 'active', 'createdAt'])
    )
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
  studentIds: Uuid[],
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
    return rows.map((row) => makeSomeRequired(row, ['studentId']))
  } catch (err) {
    throw new RepoDeleteError(err)
  }
}
