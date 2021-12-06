import pool from '../../pg-pool'
import * as db from 'zapatos/db'

export async function trainingCourses() {
    await db.insert('training_courses', [
        { updated_at: new Date(), created_at: new Date(), name: 'UPchieve 101', }
    ]).run(pool)
}
