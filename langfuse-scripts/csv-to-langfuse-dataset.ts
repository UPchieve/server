import parse from 'csv-parse/lib/sync'
import path from 'path'
import { readFileSync } from 'fs'
import { Langfuse } from 'langfuse-node'

/* to run:
 * ts-node -r dotenv/config langfuse-scripts/csv-to-langfuse-dataset.ts
 */

function recordsFrom(file: string) {
  const content = readFileSync(file)
  const records = parse(content, { columns: true })
  for (const row of records) {
    row.appropriate = row.appropriate === 'TRUE'
    row.reasons = row.reasons.length ? JSON.parse(row.reasons) : {}
  }
  return records
}

function print(progress: string) {
  process.stdout.cursorTo(0)
  process.stdout.write(progress)
}

type Record = {
  message: string
  appropriate: boolean
  reasons: Array<string>
  type: 'student' | 'volunteer'
}
async function uploadDataset({
  datasetName,
  records,
}: {
  datasetName: string
  records: Array<Record>
}) {
  const langfuse = new Langfuse()
  let processed = 0
  const failures: Array<{ record: Record; error: unknown }> = []
  for (const { message, type, reasons, appropriate } of records) {
    try {
      await langfuse.createDatasetItem({
        datasetName,
        input: { message, type },
        expectedOutput: { reasons, appropriate },
      })
    } catch (e) {
      failures.push({
        record: { message, reasons, type, appropriate },
        error: e,
      })
    } finally {
      print(`${++processed}/${records.length}`)
    }
  }

  if (failures.length) {
    console.log(`\n${failures.length}/${records.length} failed`)
  }

  console.log(`\nUploaded ${records.length - failures.length} records!`)
}

const file = path.join(
  __dirname,
  '.',
  'csvs',
  'ai-moderator-v1-baseline-results-data.csv'
)
uploadDataset({ datasetName: 'moderation', records: recordsFrom(file) })
