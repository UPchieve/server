import { makeSomeRequired, Ulid } from '../pgUtils'
import { RepoUpsertError } from '../Errors'
import * as pgQueries from './pg.queries'
import { getClient, TransactionClient } from '../../db'
import { UsersGradeLevels } from './types'

export async function upsertUserGradeLevel(
  userId: Ulid,
  gradeLevel: string,
  tc: TransactionClient = getClient()
): Promise<UsersGradeLevels> {
  try {
    const result = await pgQueries.upsertUserGradeLevel.run(
      {
        userId,
        gradeLevel,
      },
      tc
    )
    if (!result.length) {
      throw new RepoUpsertError('upsertUserGradeLevel returned 0 rows')
    }
    return makeSomeRequired(result[0], ['userId', 'gradeLevelId', 'updatedAt'])
  } catch (err) {
    throw new RepoUpsertError(err)
  }
}
