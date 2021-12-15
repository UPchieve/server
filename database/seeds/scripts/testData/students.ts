import pool from '../../pg-pool'
import * as db from 'zapatos/db'
import { getDbUlid, getIdByNameFailsafe } from '../utils'

export async function students() {
  const student1 = getDbUlid()
  const student2 = getDbUlid()
  const student3 = getDbUlid()

  await db
    .insert('users', [
      {
        id: student1,
        created_at: new Date(),
        updated_at: new Date(),
        email: 'student1@upchieve.org',
        password:
          '$2a$10$z.JMHnbX9IubnNZtqI.FOecTPVY1VTU1DJ6AJGIOT/x/OyAtdw3.y',
        first_name: 'Student',
        last_name: 'UPchieve',
        referral_code: 'A',
        verified: true,
      },
      {
        id: student2,
        created_at: new Date(),
        updated_at: new Date(),
        email: 'student2@upchieve.org',
        password:
          '$2a$10$z.JMHnbX9IubnNZtqI.FOecTPVY1VTU1DJ6AJGIOT/x/OyAtdw3.y',
        first_name: 'Student',
        last_name: 'UPchieve',
        referral_code: 'F',
        verified: true,
      },
      {
        id: student3,
        created_at: new Date(),
        updated_at: new Date(),
        email: 'student3@upchieve.org',
        password:
          '$2a$10$z.JMHnbX9IubnNZtqI.FOecTPVY1VTU1DJ6AJGIOT/x/OyAtdw3.y',
        first_name: 'Student',
        last_name: 'UPchieve',
        referral_code: 'G',
        verified: true,
        test_user: true,
      },
    ])
    .run(pool)

  await db
    .insert('student_profiles', [
      {
        user_id: student1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: student2,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: student3,
        student_partner_org_id: await getIdByNameFailsafe(
          'student_partner_orgs',
          'Placeholder 3'
        ),
        created_at: new Date(),
        updated_at: new Date(),
      },
    ])
    .run(pool)
}
