import { makeRequired, Ulid } from '../pgUtils'
import { UserSchoolAssociationType, UsersSchool } from './types'
import { RepoDeleteError, RepoUpsertError } from '../Errors'
import * as pgQueries from './pg.queries'
import { getClient, TransactionClient } from '../../db'

export async function upsertUsersSchool(
  userId: Ulid,
  schoolId: Ulid,
  associationType: UserSchoolAssociationType,
  tc: TransactionClient = getClient()
): Promise<UsersSchool> {
  try {
    const results = await pgQueries.insertUsersSchool.run(
      {
        userId,
        schoolId,
        associationType,
      },
      tc
    )
    if (!results.length) {
      throw new Error(
        `Did not get back any row inserted into users_schools for user ${userId} and school ${schoolId}`
      )
    }
    return makeRequired(results[0])
  } catch (err) {
    throw new RepoUpsertError(err)
  }
}

export async function deleteUsersSchool(
  userId: Ulid,
  schoolId: Ulid,
  tc: TransactionClient = getClient()
) {
  try {
    await pgQueries.deleteUsersSchool.run({ userId, schoolId }, tc)
  } catch (err) {
    throw new RepoDeleteError(err)
  }
}
