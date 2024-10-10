import { getClient, TransactionClient } from '../../db'
import { RepoCreateError, RepoReadError, RepoUpsertError } from '../Errors'
import {
  CreateTeacherClassPayload,
  CreateTeacherPayload,
  TeacherClass,
} from './types'
import * as pgQueries from './pg.queries'
import { getDbUlid, makeRequired, makeSomeOptional, Ulid } from '../pgUtils'

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
        topicId: data.topicId,
      },
      tc
    )
    if (!teacherClass.length) {
      throw new RepoCreateError('Unable to create teacher class.')
    }
    return makeSomeOptional(teacherClass[0], ['topicId'])
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export async function getTeacherById(userId: Ulid, tc: TransactionClient) {
  try {
    const teacher = await pgQueries.getTeacherById.run(
      {
        userId,
      },
      tc
    )
    if (teacher.length) {
      return makeSomeOptional(teacher[0], ['schoolId'])
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getTeacherClassesByUserId(
  userId: Ulid,
  tc: TransactionClient = getClient()
): Promise<TeacherClass[]> {
  try {
    const classes = await pgQueries.getTeacherClassesByUserId.run(
      { userId },
      tc
    )
    return classes.map(c => makeSomeOptional(c, ['topicId', 'deactivatedOn']))
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getTeacherClassByClassCode(
  classCode: string,
  tc: TransactionClient
) {
  try {
    const teacherClass = await pgQueries.getTeacherClassByClassCode.run(
      { code: classCode.toUpperCase() },
      tc
    )
    if (teacherClass.length) {
      return makeSomeOptional(teacherClass[0], ['topicId', 'deactivatedOn'])
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getTeacherClassById(id: Ulid, tc: TransactionClient) {
  try {
    const teacherClass = await pgQueries.getTeacherClassById.run({ id }, tc)
    if (teacherClass.length) {
      return makeSomeOptional(teacherClass[0], ['topicId'])
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getStudentIdsInTeacherClass(
  tc: TransactionClient,
  classId: Ulid
): Promise<Ulid[]> {
  try {
    const studentIds = await pgQueries.getStudentIdsInTeacherClass.run(
      { classId },
      tc
    )
    return studentIds.map(s => makeRequired(s).userId)
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function updateTeacherClass(data: {
  id: Ulid
  name: string
  topicId: number
}) {
  try {
    const updatedClass = await pgQueries.updateTeacherClass.run(
      {
        id: data.id,
        name: data.name,
        topicId: data.topicId,
      },
      getClient()
    )
    return makeSomeOptional(updatedClass[0], ['topicId'])
  } catch (err) {
    throw new RepoUpsertError(err)
  }
}

export async function deactivateTeacherClass(id: string) {
  try {
    const updatedClass = await pgQueries.deactivateTeacherClass.run(
      {
        id,
      },
      getClient()
    )
    return makeSomeOptional(updatedClass[0], ['topicId'])
  } catch (err) {
    throw new RepoUpsertError(err)
  }
}
