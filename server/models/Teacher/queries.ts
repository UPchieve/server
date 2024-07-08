import { TransactionClient } from '../../db'
import { RepoCreateError, RepoReadError } from '../Errors'
import {
  CreateTeacherClassPayload,
  CreateTeacherPayload,
  TeacherClass,
} from './types'
import * as pgQueries from './pg.queries'
import { getDbUlid, makeRequired, Ulid } from '../pgUtils'

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
    const teacherClass = await pgQueries.createTeacherClass.run(
      {
        id: getDbUlid(),
        userId: data.userId,
        name: data.name,
        code: data.code,
      },
      tc
    )
    if (!teacherClass.length) {
      throw new RepoCreateError('Unable to create teacher class.')
    }
    return makeRequired(teacherClass[0])
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export async function getTeacherClassesByUserId(
  userId: Ulid,
  tc: TransactionClient
): Promise<TeacherClass[]> {
  try {
    const classes = await pgQueries.getTeacherClassesByUserId.run(
      { userId },
      tc
    )
    return classes.map(c => makeRequired(c))
  } catch (err) {
    throw new RepoReadError(err)
  }
}
