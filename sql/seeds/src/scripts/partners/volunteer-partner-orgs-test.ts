import pool from '../../pg-pool'
import * as db from 'zapatos/db'
import { getDbUlid } from '../utils'

export async function volunteerPartnerOrgsTest() {
    await db.insert('volunteer_partner_orgs', [
        { id: getDbUlid(), updated_at: new Date(), created_at: new Date(), key: 'placeholder1', name: 'Placeholder 1', receive_weekly_hour_summary_email: true},
        { id: getDbUlid(), updated_at: new Date(), created_at: new Date(), key: 'placeholder2', name: 'Placeholder 2' },
    ]).run(pool)
}
