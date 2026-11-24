import * as pgQueries from './pg.queries'
import { RepoReadError } from '../Errors'
import { makeSomeRequired } from '../pgUtils'
import { TransactionClient } from '../../db'
import { GetSignUpSourceResult } from './types'

export async function getSignUpSourceByName(
  name: string,
  tc: TransactionClient
): Promise<GetSignUpSourceResult | undefined> {
  try {
    const result = await pgQueries.getSignUpSourceByName.run({ name }, tc)

    if (result.length) {
      return makeSomeRequired(result[0], ['id', 'name'])
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}
