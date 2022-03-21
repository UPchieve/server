import { RepoReadError } from '../Errors'
import { PgZipCode } from './types'
import { makeRequired } from '../pgUtils'
import { getClient } from '../../pg'
import * as pgQueries from './pg.queries'
import config from '../../config'

export async function getZipCodeByZipCode(
  zipCode: string
): Promise<PgZipCode | undefined> {
  try {
    const medianIncomeThreshold = config.eligibleIncomeThreshold
    const result = await pgQueries.getZipCodeByZipCode.run(
      { zipCode, medianIncomeThreshold },
      getClient()
    )

    if (result.length) {
      return makeRequired(result[0])
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}
