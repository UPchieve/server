import pool from '../../pg-pool'
import * as db from 'zapatos/db'

export async function signupSources() {
    await db.insert('signup_sources', [
        { updated_at: new Date(), created_at: new Date(), name: 'Web search' },
        { updated_at: new Date(), created_at: new Date(), name: 'Social media' },
        { updated_at: new Date(), created_at: new Date(), name: 'Friend / Classmate' },
        { updated_at: new Date(), created_at: new Date(), name: 'School / Teacher' },
        { updated_at: new Date(), created_at: new Date(), name: 'Parent / Relative' },
        { updated_at: new Date(), created_at: new Date(), name: 'Other' }
    ]).run(pool)
}
