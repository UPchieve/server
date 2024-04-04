import * as db from '../db'
import { logError } from '../worker/logger'
import { log } from '../worker/logger'

export default async function main() {
  try {
    await db.connect()
    await db.getClient().query(`
    UPDATE
        progress_reports
    SET
        prompt_id = subquery.id,
        updated_at = NOW()
    FROM (
        SELECT
            progress_report_prompts.id
        FROM
            progress_report_prompts
            JOIN subjects ON subjects.id = progress_report_prompts.subject_id
        WHERE
            subjects.name = 'reading'
            AND progress_report_prompts.active IS TRUE) AS subquery;
    `)
    log('Successfully updated progress report prompt ids')
  } catch (e) {
    logError(e as Error)
  }
}
