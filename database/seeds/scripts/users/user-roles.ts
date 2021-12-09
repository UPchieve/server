import pool from '../../pg-pool'
import * as db from 'zapatos/db'

export async function userRoles() {
  await db
    .insert('user_roles', [
      { updated_at: new Date(), created_at: new Date(), name: 'student' },
      { updated_at: new Date(), created_at: new Date(), name: 'volunteer' },
      { updated_at: new Date(), created_at: new Date(), name: 'admin' },
    ])
    .run(pool)
}
