import pool from '../../pg-pool'
import * as db from 'zapatos/db'

export async function notificationPriorityGroups() {
    await db.insert('notification_priority_groups', [
        { created_at: new Date(), updated_at: new Date(), name: 'Partner volunteers - not notified in the last 3 days AND they don’t have "high level subjects"', priority: 1 },
        { created_at: new Date(), updated_at: new Date(), name: 'Regular volunteers - not notified in the last 3 days AND they don’t have "high level subjects"', priority: 2 },
        { created_at: new Date(), updated_at: new Date(), name: 'Partner volunteers - not notified in the last 24 hours AND they don’t have "high level subjects"', priority: 3 },
        { created_at: new Date(), updated_at: new Date(), name: 'Regular volunteers - not notified in the last 24 hours AND they don’t have "high level subjects"', priority: 4 },
        { created_at: new Date(), updated_at: new Date(), name: 'All volunteers - not notified in the last 24 hours', priority: 5 },
        { created_at: new Date(), updated_at: new Date(), name: 'All volunteers - not notified in the last 60 mins', priority: 6 },
        { created_at: new Date(), updated_at: new Date(), name: 'All volunteers - not notified in the last 15 mins', priority: 7 },
    ]).run(pool)
}
