import pool from '../../pg-pool'
import * as db from 'zapatos/db'
import { getDbUlid } from '../utils'

async function getVolunteerPartnerOrgId(partnerOrgName: string) {
  const partnerOrg = await db
    .selectExactlyOne('volunteer_partner_orgs', { name: partnerOrgName })
    .run(pool)
  return partnerOrg.id
}

export async function requiredEmailDomainsTest() {
  await db
    .insert('required_email_domains', [
      {
        id: getDbUlid(),
        updated_at: new Date(),
        created_at: new Date(),
        domain: 'placeholder1.com',
        volunteer_partner_org_id: await getVolunteerPartnerOrgId(
          'Placeholder 1'
        ),
      },
    ])
    .run(pool)
}
