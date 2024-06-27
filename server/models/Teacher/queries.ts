import { TransactionClient } from '../../db'
import { RepoCreateError } from '../Errors'
import { CreateTeacherPayload } from './types'
import * as pgQueries from './pg.queries'

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
