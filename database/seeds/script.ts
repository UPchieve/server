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

const topLine =
  `INSERT INTO upchieve.postal_codes (code, us_state_code, income, location, created_at, updated_at)
  VALUES`

function formatZip(raw: csvPostalCodeRecord): string {
  const data = [
    raw.zipcode,
    `'${raw.state}'`,
    raw.income,
    `POINT(${raw.latitude},${raw.longitude})`,
    `NOW()`,
    `NOW()`
  ]
  const values = data.join(', ')
  return '(' + values + ')'
}

async function main(): Promise<void> {
  const zipFile = fs.readFileSync(`${__dirname}/aggregated_data.csv`)
  const zipRecords: csvPostalCodeRecord[] = await parse(zipFile, {
    delimiter: ',',
    columns: true,
  })
  const zips = zipRecords.filter((record: csvPostalCodeRecord) => {
    return targets.includes(record.state)
  })
  const formattedZips = zips.map(v => formatZip(v))
  formattedZips.unshift(topLine)
  console.log(formattedZips.join(',\n  '))
}

main()
