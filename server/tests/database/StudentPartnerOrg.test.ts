import { faker } from '@faker-js/faker'
import { Ulid } from 'id128'
import { getClient } from '../../db'
import {
  createUserStudentPartnerOrgInstance,
  deactivateUserStudentPartnerOrgInstance,
  getStudentPartnerOrgByKey,
  getStudentPartnerOrgBySchoolId,
} from '../../models/StudentPartnerOrg'
import { CreateUserPayload } from '../../models/User'
import { buildStudentPartnerOrg } from '../mocks/generate'
import { insertSingleRow } from '../db-utils'
import { getDbUlid } from '../../models/pgUtils'

const client = getClient()

test('getStudentPartnerOrgByKey', async () => {
  const actual = await getStudentPartnerOrgByKey(
    client,
    'approved-partner-school'
  )

  expect(actual).toBeTruthy()
  expect(actual?.partnerId).toBe('01919662-87fe-5dbc-4b00-412d50590a2b')
  expect(actual?.partnerKey).toBe('approved-partner-school')
  expect(actual?.partnerName).toBe('Approved Partner School')
  expect(actual?.siteId).toBeUndefined()
  expect(actual?.siteName).toBeUndefined()
  expect(actual?.schoolId).toBe('01919662-87fb-d63d-788d-7417e752f5d0')
})

test('getStudentPartnerOrgByKey with site', async () => {
  const actual = await getStudentPartnerOrgByKey(
    client,
    'college-mentors',
    'Brooklyn'
  )

  expect(actual).toBeTruthy()
  expect(actual?.partnerId).toBe('01919662-87dc-1b9c-e053-326c64a2edbc')
  expect(actual?.partnerKey).toBe('college-mentors')
  expect(actual?.partnerName).toBe('College Mentors')
  expect(actual?.siteId).toBe('01919662-87f5-aa97-e107-b2e537409c85')
  expect(actual?.siteName).toBe('Brooklyn')
  expect(actual?.schoolId).toBeUndefined()
})

describe('getStudentPartnerOrgBySchoolId', () => {
  const createSchool = (overrides = {}) => {
    return {
      id: getDbUlid(),
      name: faker.company.name(),
      approved: true,
      partner: true,
      cityId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    }
  }

  test.each([true, false])(
    'Returns the SPO for the school, if it exists, regardless of current school.partner status',
    async (schoolIsPartner: boolean) => {
      const school = createSchool({ partner: schoolIsPartner })
      const insertedSchool = await insertSingleRow('schools', school, client)
      const spo = buildStudentPartnerOrg({
        schoolId: insertedSchool.id,
      })
      const insertedSpo = await insertSingleRow(
        'student_partner_orgs',
        spo,
        client
      )
      const actual = await getStudentPartnerOrgBySchoolId(
        client,
        insertedSchool.id
      )
      expect(actual).toBeDefined()
      expect(actual?.schoolId).toEqual(insertedSchool.id)
      expect(actual?.partnerName).toEqual(insertedSpo.name)
      expect(actual?.siteName).toBeUndefined()
      expect(actual?.siteId).toBeUndefined()
    }
  )

  test('Returns undefined if no SPO exists', async () => {
    const school = createSchool({ partner: true })
    const insertedSchool = await insertSingleRow('schools', school, client)
    // Do not insert SPO
    const actual = await getStudentPartnerOrgBySchoolId(
      client,
      insertedSchool.id
    )
    expect(actual).toBeUndefined()
  })
})

test('createUserStudentPartnerOrgInstance creates the instance', async () => {
  const user = await createUser()

  await createUserStudentPartnerOrgInstance(
    {
      userId: user.id,
      studentPartnerOrgId: '01919662-87dc-1b9c-e053-326c64a2edbc',
    },
    client
  )

  const actual = await client.query(
    'SELECT * FROM users_student_partner_orgs_instances WHERE user_id = $1',
    [user.id]
  )

  expect(actual.rows.length).toBe(1)
  const spoi = actual.rows[0]
  expect(spoi.student_partner_org_id).toBe(
    '01919662-87dc-1b9c-e053-326c64a2edbc'
  )
  expect(spoi.student_partner_org_site_id).toBeNull()
  expect(spoi.deactivated_on).toBeNull()
  expect(spoi.created_at).toBeTruthy()
  expect(spoi.updated_at).toBeTruthy()
})

test('createUserStudentPartnerOrgInstance includes site if provided', async () => {
  const user = await createUser()

  const spoId = '01919662-87dc-1b9c-e053-326c64a2edbc' // "College Mentors"
  const sposId = '01919662-87f5-ff78-938f-0a96942eb02f' // "Oakland"
  await createUserStudentPartnerOrgInstance(
    {
      userId: user.id,
      studentPartnerOrgId: spoId,
      studentPartnerOrgSiteId: sposId,
    },
    client
  )

  const actual = await client.query(
    'SELECT * FROM users_student_partner_orgs_instances WHERE user_id = $1',
    [user.id]
  )

  expect(actual.rows.length).toBe(1)
  const spoi = actual.rows[0]
  expect(spoi.student_partner_org_id).toBe(spoId)
  expect(spoi.student_partner_org_site_id).toBe(sposId)
  expect(spoi.deactivated_on).toBeNull()
  expect(spoi.created_at).toBeTruthy()
  expect(spoi.updated_at).toBeTruthy()
})

test('deactivateUserStudentPartnerOrgInstance adds deactivated_on if exists', async () => {
  const user = await createUser()

  const spoId = '01919662-87dc-1b9c-e053-326c64a2edbc' // "College Mentors"
  const sposId = '01919662-87f5-ff78-938f-0a96942eb02f' // "Oakland"
  await createUserStudentPartnerOrgInstance(
    {
      userId: user.id,
      studentPartnerOrgId: spoId,
      studentPartnerOrgSiteId: sposId,
    },
    client
  )

  const before = await client.query(
    'SELECT * FROM users_student_partner_orgs_instances WHERE user_id = $1',
    [user.id]
  )
  expect(before.rows.length).toBe(1)
  const beforeInstance = before.rows[0]
  expect(beforeInstance.student_partner_org_id).toBe(spoId)
  expect(beforeInstance.deactivated_on).toBeNull()

  await deactivateUserStudentPartnerOrgInstance(client, user.id, spoId)

  const after = await client.query(
    'SELECT * FROM users_student_partner_orgs_instances WHERE user_id = $1',
    [user.id]
  )
  expect(after.rows.length).toBe(1)
  const afterInstance = after.rows[0]
  expect(afterInstance.deactivated_on).toBeTruthy()
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
