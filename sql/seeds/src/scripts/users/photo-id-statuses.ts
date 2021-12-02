import pool from '../../pg-pool'
import * as db from 'zapatos/db'

export async function photoIdStatuses() {
    await db.insert('photo_id_statuses', [
        { updated_at: new Date(), created_at: new Date(), name: 'approved' },
        { updated_at: new Date(), created_at: new Date(), name: 'submitted' },
        { updated_at: new Date(), created_at: new Date(), name: 'rejected' }
    ]).run(pool)
}
