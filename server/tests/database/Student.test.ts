import {
  createStudentProfile,
  getStudentContactInfoById,
} from '../../models/Student/queries'
import { Ulid } from 'id128'
import faker from 'faker'
import { CreateUserPayload } from '../../models/User'
import { getClient } from '../../db'

const client = getClient()

test('Make a connection', async () => {
  const result = await getStudentContactInfoById(Ulid.generate().toRaw())
  expect(result).toBeUndefined()
})

describe('createStudentProfile', () => {
  test('Only userId not null', async () => {
    const user = await createUser()

    const student = {
      userId: user.id,
    }
    const result = await createStudentProfile(student, client)
    expect(result.userId).toBe(user.id)
    expect(result.createdAt).toBeTruthy()
    expect(result.updatedAt).toBeTruthy()

    const actual = await getStudentProfile(user.id)
    expect(actual.rows.length).toBe(1)
    const createdStudent = actual.rows[0]
    expect(createdStudent.college).toBeFalsy()
    expect(createdStudent.created_at).toBeTruthy()
    expect(createdStudent.grade_level_id).toBeFalsy()
    expect(createdStudent.postal_code).toBeFalsy()
    expect(createdStudent.school_id).toBeFalsy()
    expect(createdStudent.student_partner_org_id).toBeFalsy()
    expect(createdStudent.student_partner_org_site_id).toBeFalsy()
    expect(createdStudent.student_partner_org_user_id).toBeFalsy()
    expect(createdStudent.updated_at).toBeTruthy()
    expect(createdStudent.user_id).toBe(user.id)
  })

  test('Grade level not null', async () => {
    const user = await createUser()

    const student = {
      userId: user.id,
      gradeLevel: '9th',
    }
    const result = await createStudentProfile(student, client)
    expect(result.userId).toBe(user.id)

    const actual = await getStudentProfile(user.id)
    expect(actual.rows.length).toBe(1)
    const createdStudent = actual.rows[0]
    expect(createdStudent.grade_level_id).toBe(2)
  })

  test('Parter key not null', async () => {
    const user = await createUser()

    const student = {
      userId: user.id,
      studentPartnerOrg: 'school-helpers',
    }
    const result = await createStudentProfile(student, client)
    expect(result.userId).toBe(user.id)

    const actual = await getStudentProfile(user.id)
    expect(actual.rows.length).toBe(1)
    const createdStudent = actual.rows[0]
    expect(createdStudent.student_partner_org_id).toBe(
      '01859800-bbed-b3e3-f1db-a8e79e57e498'
    )
  })

  test('Partner key and site not null', async () => {
    const user = await createUser()

    const student = {
      userId: user.id,
      studentPartnerOrg: 'college-mentors',
      partnerSite: 'Denver',
    }
    const result = await createStudentProfile(student, client)
    expect(result.userId).toBe(user.id)

    const actual = await getStudentProfile(user.id)
    expect(actual.rows.length).toBe(1)
    const createdStudent = actual.rows[0]
    expect(createdStudent.student_partner_org_id).toBe(
      '01859800-bbed-150a-2f52-f0856c633b63'
    )
    expect(createdStudent.student_partner_org_site_id).toBe(
      '01859800-bc55-365f-1735-c9d446c9adcc'
    )
  })

  test('Grade level not null', async () => {
    const user = await createUser()

    const student = {
      userId: user.id,
      gradeLevel: '8th',
    }
    const result = await createStudentProfile(student, client)
    expect(result.userId).toBe(user.id)

    const actual = await getStudentProfile(user.id)
    expect(actual.rows.length).toBe(1)
    const createdStudent = actual.rows[0]
    expect(createdStudent.grade_level_id).toBe(1)
  })
})

async function createUser(
  userData: Partial<CreateUserPayload> = {}
): Promise<{ id: string }> {
  return (
    await client.query(
      'INSERT INTO users (id, first_name, last_name, email, referral_code) VALUES($1, $2, $3, $4, $5) RETURNING id',
      [
        Ulid.generate().toRaw(),
        userData.firstName ?? faker.name.firstName(),
        userData.lastName ?? faker.name.lastName(),
        userData.email ?? faker.internet.email(),
        faker.random.alphaNumeric(20),
      ]
    )
  ).rows[0]
}

async function getStudentProfile(userId: string) {
  return client.query('SELECT * FROM student_profiles WHERE user_id = $1', [
    userId,
  ])
}
