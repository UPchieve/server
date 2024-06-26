import { getPartnerSchools } from '../../models/School'
import { getClient } from '../../db'
import { getDbUlid } from '../../models/pgUtils'

const client = getClient()

describe('getPartnerSchools', () => {
  test('gets the schools', async () => {
    const result = await getPartnerSchools(client)

    expect(result?.length).toBeTruthy()

    const approvedSchool = result?.find(
      r => r.schoolName === 'Approved Partner School'
    )
    expect(approvedSchool?.schoolId).toBe(
      '01859800-bc76-2674-709e-b08a177869f9'
    )
    expect(approvedSchool?.partnerKey).toBe('approved-partner-school')
    expect(approvedSchool?.partnerSites?.length).toBe(0)
    const anotherApprovedSchool = result?.find(
      r => r.schoolName === 'Another Approved Partner School'
    )
    expect(anotherApprovedSchool?.schoolId).toBe(
      '01859800-bc76-4e87-f09a-8d9a672ae4df'
    )
    expect(anotherApprovedSchool?.partnerKey).toBe(
      'another-approved-partner-school'
    )
    expect(anotherApprovedSchool?.partnerSites?.length).toBe(0)
  })

  test('gets the schools with sites if applicable', async () => {
    // Insert a new school student partner org with sites.
    const schoolId = (
      await client.query(
        'INSERT INTO schools (id, name, approved, partner) VALUES ($1, $2, $3, $4) RETURNING id',
        [getDbUlid(), 'School with Sites', 'true', 'true']
      )
    ).rows[0].id
    const spoId = (
      await client.query(
        'INSERT INTO student_partner_orgs (id, key, name, high_school_signup, school_signup_required, school_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        [
          getDbUlid(),
          'school-with-sites',
          'School with Sites',
          true,
          true,
          schoolId,
        ]
      )
    ).rows[0].id
    await client.query(
      'INSERT INTO student_partner_org_sites (student_partner_org_id, id, name) VALUES($1, $2, $3), ($1, $4, $5)',
      [spoId, getDbUlid(), 'Phoenix', getDbUlid(), 'Tuscon']
    )

    const result = await getPartnerSchools(client)

    expect(result).toBeTruthy()
    const schoolWithSites = result?.find(r => r.schoolId === schoolId)
    expect(schoolWithSites?.schoolName).toBe('School with Sites')
    expect(schoolWithSites?.partnerKey).toBe('school-with-sites')
    expect(schoolWithSites?.partnerSites?.length).toBe(2)
    const sites = new Set(schoolWithSites!.partnerSites)
    expect(sites.has('Phoenix')).toBe(true)
    expect(sites.has('Tuscon')).toBe(true)
  })
})
