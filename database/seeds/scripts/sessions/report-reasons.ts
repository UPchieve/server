import pool from '../../pg-pool'
import * as db from 'zapatos/db'

export async function reportReasons() {
  await db
    .insert('report_reasons', [
      {
        created_at: new Date(),
        updated_at: new Date(),
        reason: 'This student was extremely rude or inappropriate',
      },
      {
        created_at: new Date(),
        updated_at: new Date(),
        reason: 'I am worried for the immediate safety of this student',
      },
    ])
    .run(pool)
}
