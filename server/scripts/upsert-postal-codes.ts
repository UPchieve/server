import * as ZCRepo from '../models/ZipCode'
import fs from 'fs'
import { parse } from 'csv-parse/sync'
import { runInTransaction } from '../db'

export default async function upsertPostalCodes(): Promise<void> {
  try {
    const zipFile = fs.readFileSync(
      `${__dirname}/../../database/seeds/static/geography/postal-codes/aggregated_data.csv`
    )
    const zipRecords: ZCRepo.csvPostalCodeRecord[] = await parse(zipFile, {
      delimiter: ',',
      columns: true,
    })
    await runInTransaction(async (tc) => {
      return ZCRepo.upsertZipcodes(zipRecords, tc)
    })
  } catch (err) {
    throw new Error(`error upserting postal code records: ${err}`)
  }
}
