import faker from 'faker'
import { Ulid } from 'id128'
import { getClient } from '../../db'
import {
  createUserStudentPartnerOrgInstance,
  getStudentPartnerOrgByKey,
  getStudentPartnerOrgBySchoolId,
} from '../../models/StudentPartnerOrg'
import { CreateUserPayload } from '../../models/User'

const client = getClient()

test('getStudentPartnerOrgByKey', async () => {
  const actual = await getStudentPartnerOrgByKey(
    client,
    'approved-partner-school'
  )

  expect(actual).toBeTruthy()
  expect(actual?.partnerId).toBe('01859800-bc97-8891-3437-c4a01ae9d271')
  expect(actual?.partnerKey).toBe('approved-partner-school')
  expect(actual?.partnerName).toBe('Approved Partner School')
  expect(actual?.siteId).toBeUndefined()
  expect(actual?.siteName).toBeUndefined()
  expect(actual?.schoolId).toBe('01859800-bc76-2674-709e-b08a177869f9')
})

test('getStudentPartnerOrgByKey with site', async () => {
  const actual = await getStudentPartnerOrgByKey(
    client,
    'college-mentors',
    'Brooklyn'
  )

  expect(actual).toBeTruthy()
  expect(actual?.partnerId).toBe('01859800-bbed-150a-2f52-f0856c633b63')
  expect(actual?.partnerKey).toBe('college-mentors')
  expect(actual?.partnerName).toBe('College Mentors')
  expect(actual?.siteId).toBe('01859800-bc55-58ea-c1c8-0d8f14d3a1a6')
  expect(actual?.siteName).toBe('Brooklyn')
  expect(actual?.schoolId).toBeUndefined()
})

test('getStudentPartnerOrgBySchoolId', async () => {
  const actual = await getStudentPartnerOrgBySchoolId(
    client,
    // "Another Approved Partner School"
    '01859800-bc76-4e87-f09a-8d9a672ae4df'
  )

  expect(actual).toBeTruthy()
  expect(actual?.partnerId).toBe('01859800-bca0-3533-953c-de3c47557aa2')
  expect(actual?.partnerKey).toBe('another-approved-partner-school')
  expect(actual?.partnerName).toBe('Another Approved Partner School')
  expect(actual?.siteId).toBeUndefined()
  expect(actual?.siteName).toBeUndefined()
  expect(actual?.schoolId).toBe('01859800-bc76-4e87-f09a-8d9a672ae4df')
})

test('createUserStudentPartnerOrgInstance creates the instance', async () => {
  const user = await createUser()

  await createUserStudentPartnerOrgInstance(
    {
      userId: user.id,
      studentPartnerOrgId: '01859800-bbed-9ed8-acba-e2227bf1212f',
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
    '01859800-bbed-9ed8-acba-e2227bf1212f'
  )
  expect(spoi.student_partner_org_site_id).toBeNull()
  expect(spoi.deactivated_on).toBeNull()
  expect(spoi.created_at).toBeTruthy()
  expect(spoi.updated_at).toBeTruthy()
})

test('createUserStudentPartnerOrgInstance includes site if provided', async () => {
  const user = await createUser()

  const spoId = '01859800-bbed-150a-2f52-f0856c633b63' // "College Mentors"
  const sposId = '01859800-bc55-cf29-d368-a659f5bae025' // "Oakland"
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
  expect(spoi.student_partner_org_id).toBe(
    '01859800-bbed-150a-2f52-f0856c633b63'
  )
  expect(spoi.student_partner_org_site_id).toBe(
    '01859800-bc55-cf29-d368-a659f5bae025'
  )
  expect(spoi.deactivated_on).toBeNull()
  expect(spoi.created_at).toBeTruthy()
  expect(spoi.updated_at).toBeTruthy()
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
