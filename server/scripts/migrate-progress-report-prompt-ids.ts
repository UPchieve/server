import * as db from '../db'
import logger from '../logger'

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
    logger.info('Successfully updated progress report prompt ids')
  } catch (e) {
    logger.error('Failed to migrate progress report prompt ids', { err: e })
  }
}
