import { TransactionClient } from '../../db'
import * as pgQueries from './pg.queries'
import { getDbUlid, makeRequired, Ulid } from '../pgUtils'
import { RepoCreateError } from '../Errors'

export async function createParentGuardian(
  email: string,
  tc: TransactionClient
): Promise<{ id: string }> {
  try {
    const id = getDbUlid()
    const result = await pgQueries.createParentGuardian.run(
      {
        id,
        email,
      },
      tc
    )
    if (!result.length)
      throw new RepoCreateError('createParentGuardian returned 0 rows.')
    return makeRequired(result[0])
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
