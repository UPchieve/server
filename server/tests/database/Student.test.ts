import {
  createStudentProfile,
  getStudentContactInfoById,
  upsertStudentProfile,
} from '../../models/Student/queries'
import { Ulid } from 'id128'
import { faker } from '@faker-js/faker'
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

  test('Partner key not null', async () => {
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
      '01919662-87dc-5824-8bf6-e5e408bf6f40'
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
      '01919662-87dc-1b9c-e053-326c64a2edbc'
    )
    expect(createdStudent.student_partner_org_site_id).toBe(
      '01919662-87f5-4c6a-507e-0887e65ba6c7'
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

    const COLLEGE_MENTORS_SPO_ID = '01919662-87dc-1b9c-e053-326c64a2edbc'
    const COLLEGE_MENTORS_SPO_SITE_ID = '01919662-87f5-aa97-e107-b2e537409c85'
    const updatedStudent = {
      ...student,
      gradeLevel: '10th',
      zipCode: '00000',
      schoolId: '01919662-87fb-76b3-54f8-db306e73e181',
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
    expect(after.rows[0].postal_code).toBe(updatedStudent.zipCode)
    expect(after.rows[0].school_id).toBe(updatedStudent.schoolId)
    expect(after.rows[0].student_partner_org_id).toBe(COLLEGE_MENTORS_SPO_ID)
    expect(after.rows[0].student_partner_org_site_id).toBe(
      COLLEGE_MENTORS_SPO_SITE_ID
    )
  })

  test('updates only the values that are new, except grade level and partner site', async () => {
    const user = await createUser()

    const GRADE_LEVEL_8TH_ID = 1
    const COLLEGE_MENTORS_SPO_ID = '01919662-87dc-1b9c-e053-326c64a2edbc'
    const COLLEGE_MENTORS_SPO_SITE_ID = '01919662-87f5-ff78-938f-0a96942eb02f'
    const UNAPPROVED_SCHOOL_ID = '01919662-87fb-9261-542c-58cbced78fc3'
    await client.query(
      'INSERT INTO student_profiles (user_id, postal_code, student_partner_org_id, student_partner_org_site_id, grade_level_id, school_id, college, created_at, updated_at) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [
        user.id,
        '00000',
        COLLEGE_MENTORS_SPO_ID,
        COLLEGE_MENTORS_SPO_SITE_ID,
        GRADE_LEVEL_8TH_ID,
        UNAPPROVED_SCHOOL_ID,
        'some college',
        new Date(),
        new Date(),
      ]
    )
    const before = await client.query(
      'SELECT * FROM student_profiles WHERE user_id = $1',
      [user.id]
    )
    expect(before.rows.length).toBe(1)

    const returnedNoUpdate = await upsertStudentProfile(
      { userId: user.id },
      client
    )
    expect(returnedNoUpdate.isCreated).toBe(false)

    const afterNoUpdate = await client.query(
      'SELECT * FROM student_profiles WHERE user_id = $1',
      [user.id]
    )
    expect(afterNoUpdate.rows.length).toBe(1)
    expect(afterNoUpdate.rows[0].postal_code).toBe('00000')
    expect(afterNoUpdate.rows[0].grade_level_id).toBe(GRADE_LEVEL_8TH_ID)
    expect(afterNoUpdate.rows[0].school_id).toBe(UNAPPROVED_SCHOOL_ID)
    expect(afterNoUpdate.rows[0].student_partner_org_id).toBe(
      COLLEGE_MENTORS_SPO_ID
    )
    expect(afterNoUpdate.rows[0].student_partner_org_site_id).toBe(
      COLLEGE_MENTORS_SPO_SITE_ID
    )

    const updatedStudent = {
      userId: user.id,
      gradeLevel: '12th',
      studentPartnerOrgKey: 'school-helpers',
    }
    const returnedWithUpdate = await upsertStudentProfile(
      updatedStudent,
      client
    )
    expect(returnedWithUpdate.isCreated).toBe(false)

    const afterWithUpdate = await client.query(
      'SELECT * FROM student_profiles WHERE user_id = $1',
      [user.id]
    )
    expect(afterWithUpdate.rows.length).toBe(1)
    expect(afterWithUpdate.rows[0].grade_level_id).toBe(GRADE_LEVEL_8TH_ID)
    expect(afterWithUpdate.rows[0].student_partner_org_id).toBe(
      '01919662-87dc-5824-8bf6-e5e408bf6f40'
    )
    expect(afterWithUpdate.rows[0].student_partner_org_site_id).toBeNull()
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
        userData.firstName ?? faker.person.firstName(),
        userData.lastName ?? faker.person.lastName(),
        userData.email ?? faker.internet.email(),
        faker.string.alphanumeric(20),
      ]
    )
  ).rows[0]
}

async function getStudentProfile(userId: string) {
  return client.query('SELECT * FROM student_profiles WHERE user_id = $1', [
    userId,
  ])
}
