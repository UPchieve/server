import pool from '../../pg-pool'
import * as db from 'zapatos/db'
import { getDbUlid } from '../utils'

export async function studentPartnerOrgsTest() {
  await db
    .insert('student_partner_orgs', [
      {
        id: getDbUlid(),
        updated_at: new Date(),
        created_at: new Date(),
        key: 'placeholder1',
        name: 'Placeholder 1',
        high_school_signup: true,
        school_signup_required: true,
      },
      {
        id: getDbUlid(),
        updated_at: new Date(),
        created_at: new Date(),
        key: 'placeholder2',
        name: 'Placeholder 2',
        high_school_signup: true,
      },
      {
        id: getDbUlid(),
        updated_at: new Date(),
        created_at: new Date(),
        key: 'placeholder3',
        name: 'Placeholder 3',
      },
    ])
    .run(pool)
}
