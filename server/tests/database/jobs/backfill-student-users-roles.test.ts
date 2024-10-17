import { faker } from '@faker-js/faker'
import { getDbUlid } from '../../../../database/seeds/utils'
import { getClient } from '../../../db'
import { backfill } from '../../../scripts/backfill-student-users-roles'

const client = getClient()
const ROSTER_SIGNUP_SOURCE_ID = 7
const STUDENT_USER_ROLE_ID = 1

describe('backfillStudentUsersRoles', () => {
  beforeAll(async () => {
    await client.query('DELETE FROM users_roles;')
  })

  const APPROVED_PARTNER_SCHOOL_ID = '01919662-87fb-d63d-788d-7417e752f5d0'
  const APPROVED_PARTNER_SCHOOL_SPO_ID = '01919662-87fe-5dbc-4b00-412d50590a2b'
  const ANOTHER_APPROVED_PARTNER_SCHOOL_ID =
    '01919662-87fb-6ad2-8227-c1e38adf0907'
  const ANOTHER_APPROVED_PARTNER_SCHOOL_SPO_ID =
    '01919662-8800-b5d6-dff4-97b4627082b9'

  test('inserts users_roles for each student', async () => {
    const idStudent1 = await createStudentUser(APPROVED_PARTNER_SCHOOL_ID)
    const idStudent2 = await createStudentUser(
      ANOTHER_APPROVED_PARTNER_SCHOOL_ID
    )

    const before = await client.query('SELECT * FROM users_roles;')
    expect(before.rows.length).toBe(0)

    await backfill(client)

    const after = await client.query('SELECT * FROM users_roles;')
    expect(after.rows.length).toBe(2)

    const urStudent1 = after.rows.filter(r => r.user_id === idStudent1)
    expect(urStudent1.length).toBe(1)
    expect(urStudent1[0].role_id).toBe(STUDENT_USER_ROLE_ID)

    const urStudent2 = after.rows.filter(r => r.user_id === idStudent2)
    expect(urStudent2.length).toBe(1)
    expect(urStudent2[0].role_id).toBe(STUDENT_USER_ROLE_ID)
  })

  test('adds student_partner_org_id on student_profile for each student', async () => {
    const idStudent1 = await createStudentUser(APPROVED_PARTNER_SCHOOL_ID)
    const idStudent2 = await createStudentUser(APPROVED_PARTNER_SCHOOL_ID)
    const idStudent3 = await createStudentUser(
      ANOTHER_APPROVED_PARTNER_SCHOOL_ID
    )

    const before = await client.query(
      `
      SELECT student_partner_org_id FROM student_profiles
      WHERE user_id IN ($1, $2, $3);
      `,
      [idStudent1, idStudent2, idStudent3]
    )
    expect(before.rows.length).toBe(3)
    before.rows.forEach(r => expect(r.student_partner_org_id).toBeNull())

    await backfill(client)

    const after = await client.query(
      `
      SELECT student_partner_org_id FROM student_profiles
      WHERE user_id IN ($1, $2, $3);
      `,
      [idStudent1, idStudent2, idStudent3]
    )
    expect(after.rows.length).toBe(3)
    const expected = [
      APPROVED_PARTNER_SCHOOL_SPO_ID,
      APPROVED_PARTNER_SCHOOL_SPO_ID,
      ANOTHER_APPROVED_PARTNER_SCHOOL_SPO_ID,
    ].sort()
    expect(after.rows.map(r => r.student_partner_org_id).sort()).toEqual(
      expected
    )
  })

  async function createStudentUser(schoolId: string) {
    const user = await client.query(
      `
      INSERT INTO users (id, first_name, last_name, email, signup_source_id, referral_code)
      VALUES($1, $2, $3, $4, $5, $6)
      RETURNING id;
  `,
      [
        getDbUlid(),
        faker.person.firstName(),
        faker.person.lastName(),
        faker.internet.email(),
        ROSTER_SIGNUP_SOURCE_ID,
        faker.string.alphanumeric(6),
      ]
    )

    const userId = user.rows[0].id
    await client.query(
      `
      INSERT INTO student_profiles (user_id, school_id)
      VALUES($1, $2)
    `,
      [userId, schoolId]
    )

    return userId
  }
})
