import * as ZCRepo from '../models/ZipCode'
import logger from '../logger'
import fs from 'fs'
import parse from 'csv-parse/lib/sync'

export default async function upsertPostalCodes(): Promise<void> {
  try {
    const zipFile = fs.readFileSync(
      `${__dirname}/../../database/seeds/static/geography/postal-codes/aggregated_data.csv`
    )
    const zipRecords: ZCRepo.csvPostalCodeRecord[] = await parse(zipFile, {
      delimiter: ',',
      columns: true,
    })
    await ZCRepo.upsertZipcodes(zipRecords)
  } catch (err) {
    throw new Error(`error upserting postal code records: ${err}`)
  }
}
