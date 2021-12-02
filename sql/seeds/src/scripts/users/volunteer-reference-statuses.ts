import pool from '../../pg-pool'
import * as db from 'zapatos/db'

export async function volunteerReferenceStatuses() {
    await db.insert('volunteer_reference_statuses', [
        { updated_at: new Date(), created_at: new Date(), name: 'sent' },
        { updated_at: new Date(), created_at: new Date(), name: 'submitted', },
        { updated_at: new Date(), created_at: new Date(), name: 'approved', },
        { updated_at: new Date(), created_at: new Date(), name: 'rejected', },
        { updated_at: new Date(), created_at: new Date(), name: 'removed', }
    ]).run(pool)
}
