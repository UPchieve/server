import pool from '../../pg-pool'
import * as db from 'zapatos/db'

export async function notificationMethods() {
    await db.insert('notification_methods', [
        { created_at: new Date(), updated_at: new Date(), method: 'sms' },
        { created_at: new Date(), updated_at: new Date(), method: 'push' },
        { created_at: new Date(), updated_at: new Date(), method: 'voice' },
        { created_at: new Date(), updated_at: new Date(), method: 'email' },
    ]).run(pool)
}
