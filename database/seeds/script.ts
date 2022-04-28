import fs from 'fs'
import parse from 'csv-parse/lib/sync'

interface csvPostalCodeRecord {
  zipcode: string
  income: number
  state: string
  longitude: string
  latitude: string
}

const targets = [
  'VI',
  'GU',
  'AE',
  'AA',
  'AP',
  'AS',
  'PR',
  'PW',
  'FM',
  'MP',
  'MH',
]

async function main(): Promise<void> {
  const zipFile = fs.readFileSync(`${__dirname}/aggregated_data.csv`)
  const zipRecords: csvPostalCodeRecord[] = await parse(zipFile, {
    delimiter: ',',
    columns: true,
  })
  const zips = zipRecords.filter((record: csvPostalCodeRecord) => {
    return targets.includes(record.state) && record.latitude !== '0'
  })
  console.log(zips.length)
}

main()
