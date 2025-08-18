import * as pgQueries from './pg.queries'
import { RepoReadError } from '../Errors'
import { makeRequired } from '../pgUtils'
import { getClient, TransactionClient } from '../../db'
import { GetSignUpSourceResult, SignupSources } from './types'

export async function getSignUpSourceByName(
  name: string,
  tc: TransactionClient
): Promise<GetSignUpSourceResult | undefined> {
  try {
    const result = await pgQueries.getSignUpSourceByName.run({ name }, tc)

    if (result.length) {
      return makeRequired(result[0])
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getSignUpSources(
  forRole?: 'student' | 'volunteer'
): Promise<SignupSources[]> {
  try {
    const result = await pgQueries.getSignupSources.run(
      {
        role: forRole,
      },
      getClient()
    )
    if (!result.length) return []
    return result.map((row) => makeRequired(row))
  } catch (err) {
    throw new RepoReadError(err)
  }
}
