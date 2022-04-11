import { wrapInsert, NameToId, getDbUlid } from '../../utils'
import * as pgQueries from './pg.queries'

export async function studentPartnerOrgSitesTest(
  spoIds: NameToId
): Promise<NameToId> {
  const sites = [
    {
      id: getDbUlid(),
      name: 'Brooklyn',
      studentPartnerOrgId: spoIds['College Mentors'] as string,
    },
    {
      id: getDbUlid(),
      name: 'Denver',
      studentPartnerOrgId: spoIds['College Mentors'] as string,
    },
    {
      id: getDbUlid(),
      name: 'Oakland',
      studentPartnerOrgId: spoIds['College Mentors'] as string,
    },
  ]
  const temp: NameToId = {}
  for (const site of sites) {
    temp[site.name] = await wrapInsert(
      'student_partner_org_sites',
      pgQueries.insertStudentPartnerOrgSite.run,
      { ...site }
    )
  }
  return temp
}
