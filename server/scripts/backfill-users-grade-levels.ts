import { getClient } from '../db'
import { Jobs } from '../worker/jobs'
import logger from '../logger'

export default async function backfillUsersGradeLevels(): Promise<void> {
  try {
    // 2023-08-30T17:46:00Z is the timestamp when we had updated all grade levels in the database.
    // If a student was created before that time, we know we've done a grade level bump for them, and
    // we can take that date as the last time the grade was updated.
    const result = await getClient().query(`
      INSERT INTO users_grade_levels (user_id, signup_grade_level_id, grade_level_id, updated_at)
      SELECT
          sp.user_id,
          sp.grade_level_id,
          sp.grade_level_id,
          CASE WHEN sp.created_at < '2023-08-30T17:46:00Z' THEN
              '2023-08-30T17:46:00Z'::timestamptz
          ELSE
              sp.created_at
          END
      FROM student_profiles sp
      WHERE sp.grade_level_id IS NOT NULL
      ON CONFLICT (user_id) DO NOTHING
    `)

    logger.info(
      `${Jobs.BackfillUsersGradeLevels}: inserted ${result.rowCount} rows into users_grade_levels`
    )
  } catch (err) {
    logger.error({ err }, `${Jobs.BackfillUsersGradeLevels} failed`)
  }
}
