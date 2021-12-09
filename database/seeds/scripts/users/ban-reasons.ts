import pool from '../../pg-pool'
import * as db from 'zapatos/db'

export async function banReasons() {
  await db
    .insert('ban_reasons', [
      { updated_at: new Date(), created_at: new Date(), name: 'non us signup' },
      {
        updated_at: new Date(),
        created_at: new Date(),
        name: 'session reported',
      },
      {
        updated_at: new Date(),
        created_at: new Date(),
        name: 'used banned ip',
      },
      { updated_at: new Date(), created_at: new Date(), name: 'admin' },
    ])
    .run(pool)
}
