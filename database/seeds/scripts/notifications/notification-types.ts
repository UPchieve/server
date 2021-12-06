import pool from '../../pg-pool'
import * as db from 'zapatos/db'

export async function notificationTypes() {
    await db.insert('notification_types', [
        { created_at: new Date(), updated_at: new Date(), type: 'initial' },
        { created_at: new Date(), updated_at: new Date(), type: 'followup' },
    ]).run(pool)
}
