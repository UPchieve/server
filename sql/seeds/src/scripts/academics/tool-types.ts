import pool from '../../pg-pool'
import * as db from 'zapatos/db'

export async function toolTypes() {
    await db.insert('tool_types', [
        { updated_at: new Date(), created_at: new Date(), name: 'whiteboard' },
        { updated_at: new Date(), created_at: new Date(), name: 'documenteditor' },
    ]).run(pool)
}
