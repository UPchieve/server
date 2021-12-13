import pool from '../../pg-pool'
import * as db from 'zapatos/db'
import { getDbUlid } from '../utils'

export async function schools() {
  await db
    .insert('schools', [
      {
        id: getDbUlid(),
        name: 'test data',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: getDbUlid(),
        name: 'Legacy Signup High School',
        created_at: new Date(),
        updated_at: new Date(),
        approved: true,
        partner: true,
      },
    ])
    .run(pool)
}
