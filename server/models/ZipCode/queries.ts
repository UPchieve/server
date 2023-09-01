import { RepoCreateError, RepoReadError, RepoTransactionError } from '../Errors'
import { ZipCode } from './types'
import { makeSomeOptional } from '../pgUtils'
import { getClient } from '../../db'
import * as pgQueries from './pg.queries'
import config from '../../config'

export interface csvPostalCodeRecord {
  zipcode: string
  income: number
  cbsa_income?: number | null
  state_income?: number | null
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
      return makeSomeOptional(result[0], ['cbsaIncome', 'stateIncome'])
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function upsertZipcodes(zipRecords: csvPostalCodeRecord[]) {
  const transactionClient = await getClient().connect()
  try {
    await transactionClient.query('BEGIN')
    for (const record of zipRecords) {
      // The parsing library has an open issue where empty values in the csv
      // are given a string value of 'null' instead of just null.
      // See https://github.com/adaltas/node-csv/issues/307.
      if (<unknown>record.cbsa_income === 'null') {
        record.cbsa_income = null
      }
      if (<unknown>record.state_income === 'null') {
        record.state_income = null
      }
      const typedRecord = record as csvPostalCodeRecord
      await pgQueries.upsertZipCode.run(
        {
          code: typedRecord.zipcode,
          usStateCode: typedRecord.state,
          income: typedRecord.income,
          cbsaIncome: typedRecord.cbsa_income,
          stateIncome: typedRecord.state_income,
          latitude: typedRecord.latitude,
          longitude: typedRecord.longitude,
        },
        transactionClient
      )
    }
    await pgQueries.upsertZipCode.run(
      {
        code: '00000',
        usStateCode: 'NA',
        income: 0,
        cbsaIncome: 0,
        stateIncome: 0,
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
