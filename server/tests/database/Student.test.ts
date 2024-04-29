import {
  createStudentProfile,
  getStudentContactInfoById,
  upsertStudentProfile,
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
      studentPartnerOrgKey: 'school-helpers',
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
      studentPartnerOrgKey: 'college-mentors',
      studentPartnerOrgSiteName: 'Denver',
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

describe('upsertStudentProfile', () => {
  test('creates the student if did not exist', async () => {
    const user = await createUser()
    const student = {
      userId: user.id,
    }

    const before = await client.query(
      'SELECT * FROM student_profiles WHERE user_id = $1',
      [user.id]
    )
    expect(before.rows.length).toBe(0)

    const returned = await upsertStudentProfile(student, client)
    expect(returned.isCreated).toBe(true)

    const after = await client.query(
      'SELECT * FROM student_profiles WHERE user_id = $1',
      [user.id]
    )
    expect(after.rows.length).toBe(1)
  })

  test('updates the student if did exist', async () => {
    const user = await createUser()
    const student = {
      userId: user.id,
    }
    await client.query('INSERT INTO student_profiles (user_id) VALUES($1)', [
      user.id,
    ])

    const before = await client.query(
      'SELECT * FROM student_profiles WHERE user_id = $1',
      [user.id]
    )
    expect(before.rows.length).toBe(1)

    const GRADE_LEVEL_10_ID = 3
    const COLLEGE_MENTORS_SPO_ID = '01859800-bbed-150a-2f52-f0856c633b63'
    const COLLEGE_MENTORS_SPO_SITE_ID = '01859800-bc55-58ea-c1c8-0d8f14d3a1a6'
    const updatedStudent = {
      ...student,
      gradeLevel: '10th',
      zipCode: '00000',
      schoolId: '01859800-bc76-7db0-734b-b567fa67a568',
      studentPartnerOrgKey: 'college-mentors',
      studentPartnerOrgSiteName: 'Brooklyn',
    }

    const returned = await upsertStudentProfile(updatedStudent, client)
    expect(returned.isCreated).toBe(false)

    const after = await client.query(
      'SELECT * FROM student_profiles WHERE user_id = $1',
      [user.id]
    )
    expect(after.rows.length).toBe(1)
    expect(after.rows[0].grade_level_id).toBe(GRADE_LEVEL_10_ID)
    expect(after.rows[0].postal_code).toBe(updatedStudent.zipCode)
    expect(after.rows[0].school_id).toBe(updatedStudent.schoolId)
    expect(after.rows[0].student_partner_org_id).toBe(COLLEGE_MENTORS_SPO_ID)
    expect(after.rows[0].student_partner_org_site_id).toBe(
      COLLEGE_MENTORS_SPO_SITE_ID
    )
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
