import { wrapInsert, NameToId, getDbUlid } from '../utils'
import * as pgQueries from './pg.queries'

export async function associatedPartnersReal(
  vpoIds: NameToId,
  spoIds: NameToId,
  ssoIds: NameToId,
): Promise<NameToId> {
  const partners = [
    {
      id: getDbUlid(),
      key: 'att-connected-learning',
      volunteerPartnerOrgId: (vpoIds['att'] as string),
      studentPartnerOrgId: (spoIds['att-connected-learning'] as string)
    },
    {
      id: getDbUlid(),
      key: 'vils',
      volunteerPartnerOrgId: (vpoIds['verizon'] as string),
      studentSponsorOrgId: (ssoIds['vils'] as string)
    },
  ]
  const temp: NameToId = {}
  for (const partner of partners) {
    temp[org.key] = await wrapInsert(
      'associated_partners',
      pgQueries.insertAssociatedPartner.run,
      { ...org }
    )
  }
  return temp
}
