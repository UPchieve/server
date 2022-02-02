import { wrapInsert, NameToId, getDbUlid } from '../utils'
import * as pgQueries from './pg.queries'

export async function studentPartnerOrgSitesTest(
  spoIds: NameToId
): Promise<NameToId> {
  const sites = [
    {
      id: getDbUlid(),
      name: 'placeholder1',
      studentPartnerOrgId: spoIds['Placeholder 1'] as string,
    },
    {
      id: getDbUlid(),
      name: 'placeholder2',
      studentPartnerOrgId: spoIds['Placeholder 2'] as string,
    },
    {
      id: getDbUlid(),
      name: 'placeholder3',
      studentPartnerOrgId: spoIds['Placeholder 3'] as string,
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
