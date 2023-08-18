import fs from 'fs'
import parse from 'csv-parse/lib/sync'
import { InputError } from '../models/Errors'

export function readCsvFromBuffer<T>(
  buffer: Buffer,
  requiredColumns: string[]
): T[] {
  return readCsv<T>(buffer, requiredColumns)
}

export function readCsvFromFilePath<T>(
  filePath: string,
  requiredColumns: string[]
) {
  const file = fs.readFileSync(filePath)
  return readCsv<T>(file, requiredColumns)
}

function readCsv<T>(input: Buffer | string, requiredColumns: string[]): T[] {
  try {
    const contents = parse(input, {
      delimiter: ',',
      columns: true,
    })

    if (!contents.length) {
      throw new InputError(`No content in the CSV.`)
    }
    if (!hasRequiredColumns(requiredColumns, contents[0])) {
      throw new InputError(
        `Missing a required column. Required: ${requiredColumns}`
      )
    }
    return contents
  } catch (e) {
    if (e instanceof Error && e.message.includes('Invalid Record Length')) {
      throw new InputError('Number of columns to headers does not match.')
    } else {
      throw e
    }
  }
}

function hasRequiredColumns(
  requiredColumns: string[],
  sample: Record<string, string>
): boolean {
  for (const col of requiredColumns) {
    if (!(col in sample)) {
      return false
    }
  }
  return true
}
