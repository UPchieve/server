import { RepoReadError } from '../Errors'
import { PgSchool } from './types'
import { makeRequired, Ulid } from '../pgUtils'
import * as pgQueries from './pg.queries'
import { getClient } from '../../pg'

export async function findSchoolById(
  schoolId: Ulid
): Promise<PgSchool | undefined> {
  try {
    const result = await pgQueries.findSchoolById.run({ schoolId }, getClient())

    if (result.length) {
      return makeRequired(result[0])
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}
