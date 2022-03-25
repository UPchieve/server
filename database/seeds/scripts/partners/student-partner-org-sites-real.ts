import { wrapInsert, NameToId, getDbUlid } from '../utils'
import * as pgQueries from './pg.queries'

export async function studentPartnerOrgSitesReal(
  spoIds: NameToId
): Promise<NameToId> {
  const sites = [
    {
      id: getDbUlid(),
      name: 'Aurora',
      studentPartnerOrgId: spoIds['college-track'] as string,
    },
    {
      id: getDbUlid(),
      name: 'Boyle Heights',
      studentPartnerOrgId: spoIds['college-track'] as string,
    },
    {
      id: getDbUlid(),
      name: 'Crenshaw',
      studentPartnerOrgId: spoIds['college-track'] as string,
    },
    {
      id: getDbUlid(),
      name: 'Denver',
      studentPartnerOrgId: spoIds['college-track'] as string,
    },
    {
      id: getDbUlid(),
      name: 'East Palo Alto',
      studentPartnerOrgId: spoIds['college-track'] as string,
    },
    {
      id: getDbUlid(),
      name: 'The Durant Center',
      studentPartnerOrgId: spoIds['college-track'] as string,
    },
    {
      id: getDbUlid(),
      name: 'New Orleans',
      studentPartnerOrgId: spoIds['college-track'] as string,
    },
    {
      id: getDbUlid(),
      name: 'Oakland',
      studentPartnerOrgId: spoIds['college-track'] as string,
    },
    {
      id: getDbUlid(),
      name: 'Sacramento',
      studentPartnerOrgId: spoIds['college-track'] as string,
    },
    {
      id: getDbUlid(),
      name: 'San Francisco',
      studentPartnerOrgId: spoIds['college-track'] as string,
    },
    {
      id: getDbUlid(),
      name: 'Ward 8',
      studentPartnerOrgId: spoIds['college-track'] as string,
    },
    {
      id: getDbUlid(),
      name: 'Watts',
      studentPartnerOrgId: spoIds['college-track'] as string,
    },
    {
      id: getDbUlid(),
      name: 'Yawkey Club of Roxbury',
      studentPartnerOrgId: spoIds['bgcb'] as string,
    },
    {
      id: getDbUlid(),
      name: 'Berkshire Partners Blue Hill Club',
      studentPartnerOrgId: spoIds['bgcb'] as string,
    },
    {
      id: getDbUlid(),
      name: 'Gerald and Darlene Jordan Club',
      studentPartnerOrgId: spoIds['bgcb'] as string,
    },
    {
      id: getDbUlid(),
      name: 'Edgerley Family South Boston Club',
      studentPartnerOrgId: spoIds['bgcb'] as string,
    },
    {
      id: getDbUlid(),
      name: 'Charlestown Club',
      studentPartnerOrgId: spoIds['bgcb'] as string,
    },
    {
      id: getDbUlid(),
      name: 'Mattapan Teen Center',
      studentPartnerOrgId: spoIds['bgcb'] as string,
    },
    {
      id: getDbUlid(),
      name: 'Beat the Streets General',
      studentPartnerOrgId: spoIds['beat-the-streets'] as string,
    },
    {
      id: getDbUlid(),
      name: 'Beat the Streets Academy',
      studentPartnerOrgId: spoIds['beat-the-streets'] as string,
    },
    {
      id: getDbUlid(),
      name: 'Family Gateway',
      studentPartnerOrgId: spoIds['att-connected-learning'] as string,
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
