import { RepoCreateError, RepoReadError, RepoTransactionError } from '../Errors'
import { ZipCode } from './types'
import { makeSomeRequired } from '../pgUtils'
import { getClient } from '../../db'
import * as pgQueries from './pg.queries'
import config from '../../config'

export interface csvPostalCodeRecord {
  zipcode: string
  income: number
  state: string
  longitude: number
  latitude: number
}

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
      return makeSomeRequired(result[0], ['cbsaIncome', 'stateIncome'])
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function upsertZipcodes(zipRecords: csvPostalCodeRecord[]) {
  const transactionClient = await getClient().connect()
  try {
    await transactionClient.query('BEGIN')
    const recordInsertions = zipRecords.map((record: csvPostalCodeRecord) => {
      const typedRecord = record as csvPostalCodeRecord
      return pgQueries.upsertZipCode.run(
        {
          code: typedRecord.zipcode,
          usStateCode: typedRecord.state,
          income: typedRecord.income,
          latitude: typedRecord.latitude,
          longitude: typedRecord.longitude,
        },
        transactionClient
      )
    })
    await Promise.all(recordInsertions)
    await pgQueries.upsertZipCode.run(
      {
        code: '00000',
        usStateCode: 'NA',
        income: 0,
        latitude: 0,
        longitude: 0,
      },
      transactionClient
    )
    await transactionClient.query('COMMIT')
  } catch (err) {
    await transactionClient.query('ROLLBACK')
    if (err instanceof RepoCreateError) throw err
    throw new RepoTransactionError(err)
  } finally {
    transactionClient.release()
  }
}
