import { wrapInsert, NameToId, getDbUlid } from '../../utils'
import * as pgQueries from './pg.queries'

export async function sponsorOrgsTest(
  spoIds: NameToId,
  schoolIds: NameToId
): Promise<NameToId> {
  const sponsors = [
    {
      id: getDbUlid(),
      key: 'onlySponsorsSchools',
      name: 'Only Sponsors Schools',
    },
    {
      id: getDbUlid(),
      key: 'onlySponsorsPartnerOrgs',
      name: 'Only Sponsors Partner Orgs',
    },
    {
      id: getDbUlid(),
      key: 'sponsorsBoth',
      name: 'Sponsors Both',
    },
  ]

  const sponsorOrgs: NameToId = {}
  for (const sponsor of sponsors) {
    sponsorOrgs[sponsor.key] = await wrapInsert(
      'sponsor_orgs',
      pgQueries.insertSponsorOrg.run,
      { ...sponsor }
    )
  }

  const schoolSponsor = [
    {
      schoolId: schoolIds['Approved Partner School'] as string,
      sponsorOrgId: sponsorOrgs['onlySponsorsSchools'] as string,
    },
    {
      schoolId: schoolIds['Another Approved Partner School'] as string,
      sponsorOrgId: sponsorOrgs['sponsorsBoth'] as string,
    },
  ]

  for (const school of schoolSponsor) {
    await wrapInsert(
      'schools_sponsor_orgs',
      pgQueries.insertSchoolsSponsorOrg.run,
      { ...school }
    )
  }

  const spoSponsor = [
    {
      spoId: spoIds['Community Org'] as string,
      sponsorOrgId: sponsorOrgs['onlySponsorsPartnerOrgs'] as string,
    },
    {
      spoId: spoIds['School Helpers'] as string,
      sponsorOrgId: sponsorOrgs['sponsorsBoth'] as string,
    },
  ]

  for (const spo of spoSponsor) {
    await wrapInsert(
      'schools_sponsor_orgs',
      pgQueries.insertStudentPartnerSponsorOrg.run,
      { ...spo }
    )
  }

  return sponsorOrgs
}
