import pool from '../../pg-pool'
import * as db from 'zapatos/db'

export async function sessionFlags() {
    await db.insert('session_flags', [
        { created_at: new Date(), updated_at: new Date(), name: 'Absent student' },
        { created_at: new Date(), updated_at: new Date(), name: 'Absent volunteer' },
        { created_at: new Date(), updated_at: new Date(), name: 'Low session rating from coach' },
        { created_at: new Date(), updated_at: new Date(), name: 'Low session rating from student' },
        { created_at: new Date(), updated_at: new Date(), name: 'Low coach rating from student' },
        { created_at: new Date(), updated_at: new Date(), name: 'Reported' },
        { created_at: new Date(), updated_at: new Date(), name: 'Only looking for answers' },
        { created_at: new Date(), updated_at: new Date(), name: 'Rude or inappropriate' },
        { created_at: new Date(), updated_at: new Date(), name: 'Comment from student' },
        { created_at: new Date(), updated_at: new Date(), name: 'Has been unmatched' },
        { created_at: new Date(), updated_at: new Date(), name: 'Has had technical issues' },
    ]).run(pool)
}
