import { RepoReadError } from '../Errors'
import { ZipCode } from './types'
import { makeRequired } from '../pgUtils'
import { getClient } from '../../db'
import * as pgQueries from './pg.queries'
import config from '../../config'

export async function getZipCodeByZipCode(
  zipCode: string
): Promise<ZipCode | undefined> {
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
