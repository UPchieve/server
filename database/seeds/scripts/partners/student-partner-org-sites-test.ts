import pool from '../../pg-pool'
import * as db from 'zapatos/db'
import { getDbUlid } from '../utils'

async function getStudentPartnerOrgId(partnerOrgName: string) {
  const partnerOrg = await db
    .selectExactlyOne('student_partner_orgs', { name: partnerOrgName })
    .run(pool)
  return partnerOrg.id
}

export async function studentPartnerOrgSitesTest() {
  await db
    .insert('student_partner_org_sites', [
      {
        id: getDbUlid(),
        updated_at: new Date(),
        created_at: new Date(),
        name: 'placeholder1',
        student_partner_org_id: await getStudentPartnerOrgId('Placeholder 1'),
      },
      {
        id: getDbUlid(),
        updated_at: new Date(),
        created_at: new Date(),
        name: 'placeholder2',
        student_partner_org_id: await getStudentPartnerOrgId('Placeholder 2'),
      },
      {
        id: getDbUlid(),
        updated_at: new Date(),
        created_at: new Date(),
        name: 'placeholder3',
        student_partner_org_id: await getStudentPartnerOrgId('Placeholder 3'),
      },
    ])
    .run(pool)
}
