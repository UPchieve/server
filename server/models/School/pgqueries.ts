import { RepoReadError } from '../Errors'
import { PgSchool } from './types'
import { makeRequired, Ulid } from '../pgUtils'
import * as pgQueries from './pg.queries'
import { getClient } from '../../pg'

export async function findSchoolByUpchieveId(
  schoolId: Ulid
): Promise<PgSchool | undefined> {
  try {
    const result = await pgQueries.findSchoolByUpchieveId.run(
      { schoolId },
      getClient()
    )

    if (result.length) {
      return makeRequired(result[0])
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

// export async function getSchool(schoolId: Ulid): Promise<PgSchool | undefined> {
//   try {
//     const result = await pgQueries.getSchool.run({ schoolId }, getClient())

//     // TODO: fix return type with virtuals and add approvalNotifyEmails
//     if (result.length) {
//       return makeRequired(result[0])
//     }
//   } catch (err) {
//     throw new RepoReadError(err)
//   }
// }
