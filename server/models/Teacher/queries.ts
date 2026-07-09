import { getClient, TransactionClient } from '../../db'
import { RepoCreateError, RepoReadError, RepoUpdateError } from '../Errors'
import { CreateTeacherClassPayload, CreateTeacherPayload } from './types'
import * as pgQueries from './pg.queries'
import { getDbUlid, makeRequired, makeSomeOptional } from '../pgUtils'
import type { Uuid } from '../../types/shared'
import type { TeacherClass, TeacherProfile } from '../../types/teachers'

export type TeacherRow = {
  userId: Uuid
  schoolId?: Uuid
  createdAt: Date
}

export function toTeacherProfile(row: TeacherRow): TeacherProfile {
  return {
    userId: row.userId,
    schoolId: row.schoolId,
    createdAt: row.createdAt,
  }
}

export type TeacherClassRow = {
  id: Uuid
  userId: Uuid
  name: string
  code: string
  active: boolean
  deactivatedOn?: Date
  totalStudents?: number
  topicId?: number
  cleverId?: string
  createdAt: Date
}

export function toTeacherClass(row: TeacherClassRow): TeacherClass {
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    code: row.code,
    active: row.active,
    topicId: row.topicId,
    deactivatedOn: row.deactivatedOn,
    cleverId: row.cleverId,
    totalStudents: row.totalStudents,
    createdAt: row.createdAt,
  }
}

export async function createTeacher(
  data: CreateTeacherPayload,
  tc: TransactionClient
): Promise<void> {
  try {
    await pgQueries.createTeacherProfile.run(
      {
        userId: data.userId,
        schoolId: data.schoolId,
      },
      tc
    )
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export async function createTeacherClass(
  data: CreateTeacherClassPayload,
  tc: TransactionClient
): Promise<TeacherClass> {
  try {
    const [row] = await pgQueries.createTeacherClass.run(
      {
        id: getDbUlid(),
        userId: data.userId,
        name: data.name,
        code: data.code,
        topicId: data.topicId,
        cleverId: data.cleverId,
      },
      tc
    )
    if (!row) {
      throw new RepoCreateError('Unable to create teacher class.')
    }

    return toTeacherClass(
      makeSomeOptional(row, ['topicId', 'cleverId', 'deactivatedOn'])
    )
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export async function getTeacherById(
  userId: Uuid,
  tc: TransactionClient
): Promise<TeacherProfile | undefined> {
  try {
    const [row] = await pgQueries.getTeacherById.run(
      {
        userId,
      },
      tc
    )
    if (row) {
      return toTeacherProfile(makeSomeOptional(row, ['schoolId']))
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getTeacherClassesByUserId(
  userId: Uuid,
  tc: TransactionClient = getClient()
): Promise<TeacherClass[]> {
  try {
    const rows = await pgQueries.getTeacherClassesByUserId.run({ userId }, tc)
    return rows.map((row) =>
      toTeacherClass(
        makeSomeOptional(row, ['topicId', 'deactivatedOn', 'cleverId'])
      )
    )
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getTeacherClassByClassCode(
  classCode: string,
  tc: TransactionClient
): Promise<TeacherClass | undefined> {
  try {
    const [row] = await pgQueries.getTeacherClassByClassCode.run(
      { code: classCode.toUpperCase() },
      tc
    )
    if (row) {
      return toTeacherClass(
        makeSomeOptional(row, ['cleverId', 'topicId', 'deactivatedOn'])
      )
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getTeacherClassById(
  id: Uuid,
  tc: TransactionClient
): Promise<TeacherClass | undefined> {
  try {
    const teacherClass = await pgQueries.getTeacherClassById.run({ id }, tc)
    if (teacherClass.length) {
      return toTeacherClass(
        makeSomeOptional(teacherClass[0], ['cleverId', 'topicId'])
      )
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getStudentIdsInTeacherClass(
  tc: TransactionClient,
  classId: Uuid
): Promise<Uuid[]> {
  try {
    const studentIds = await pgQueries.getStudentIdsInTeacherClass.run(
      { classId },
      tc
    )
    return studentIds.map((s) => makeRequired(s).userId)
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function updateTeacherClass(data: {
  id: Uuid
  name: string
  topicId: number
}): Promise<TeacherClass | undefined> {
  try {
    const [row] = await pgQueries.updateTeacherClass.run(
      {
        id: data.id,
        name: data.name,
        topicId: data.topicId,
      },
      getClient()
    )
    return row ? toTeacherClass(makeSomeOptional(row, ['topicId'])) : undefined
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export async function deactivateTeacherClass(
  id: Uuid,
  tc: TransactionClient
): Promise<TeacherClass> {
  try {
    const [row] = await pgQueries.deactivateTeacherClass.run(
      {
        id,
      },
      tc
    )
    return toTeacherClass(makeSomeOptional(row, ['topicId']))
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export async function updateLastSuccessfulCleverSync(
  teacherId: Uuid,
  tc: TransactionClient
) {
  try {
    await pgQueries.updateLastSuccessfulCleverSync.run({ teacherId }, tc)
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export async function updateTeacherSchool(
  teacherId: Uuid,
  schoolId: Uuid | undefined,
  tc: TransactionClient
) {
  try {
    await pgQueries.updateTeacherSchool.run(
      {
        userId: teacherId,
        schoolId,
      },
      tc
    )
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export async function getAllStudentsForTeacher(
  teacherId: Uuid
): Promise<Uuid[]> {
  try {
    const studentIds = await pgQueries.getAllStudentsForTeacher.run(
      { teacherId },
      getClient()
    )
    return studentIds.map((s) => makeRequired(s).userId)
  } catch (err) {
    throw new RepoReadError(err)
  }
}
