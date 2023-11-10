import { TransactionClient } from '../../db'
import * as pgQueries from './pg.queries'
import { getDbUlid, Ulid } from '../pgUtils'
import { RepoCreateError } from '../Errors'

export async function createParentGuardian(
  email: string,
  tc: TransactionClient
) {
  try {
    const id = getDbUlid()
    await pgQueries.createParentGuardian.run(
      {
        id,
        email,
      },
      tc
    )
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export async function linkParentGuardianToStudent(
  parent_guardian_id: Ulid,
  student_id: Ulid,
  tc: TransactionClient
) {
  try {
    await pgQueries.linkParentGuardianToStudent.run(
      {
        parent_guardian_id,
        student_id,
      },
      tc
    )
  } catch (err) {
    throw new RepoCreateError(err)
  }
}
