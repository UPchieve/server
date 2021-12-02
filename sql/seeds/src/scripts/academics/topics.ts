import pool from '../../pg-pool'
import * as db from 'zapatos/db'

export async function topics() {
    await db.insert('topics', [
        { updated_at: new Date(), created_at: new Date(), name: 'math', display_name: 'Math', dashboard_order: 1 },
        { updated_at: new Date(), created_at: new Date(), name: 'science', display_name: 'Science', dashboard_order: 4 },
        { updated_at: new Date(), created_at: new Date(), name: 'college', display_name: 'College Counseling', dashboard_order: 3 },
        { updated_at: new Date(), created_at: new Date(), name: 'sat', display_name: 'Standardized Testing', dashboard_order: 2 },
        { updated_at: new Date(), created_at: new Date(), name: 'readingWriting', display_name: 'Reading and Writing', dashboard_order: 5 },
    ]).run(pool)
}
