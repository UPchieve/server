import pool from '../../pg-pool'
import * as db from 'zapatos/db'

export async function gradeLevels() {
    await db.insert('grade_levels', [
        { updated_at: new Date(), created_at: new Date(), name: '8' },
        { updated_at: new Date(), created_at: new Date(), name: '9' },
        { updated_at: new Date(), created_at: new Date(), name: '10' },
        { updated_at: new Date(), created_at: new Date(), name: '11' },
        { updated_at: new Date(), created_at: new Date(), name: '12' },
        { updated_at: new Date(), created_at: new Date(), name: 'college' },
    ]).run(pool)
}
