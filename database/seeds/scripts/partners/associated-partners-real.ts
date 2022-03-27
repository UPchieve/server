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
      studentPartnerOrgId: (spoIds['att-connected-learning'] as string),
      studentSponsorOrgId: undefined
    },
    {
      id: getDbUlid(),
      key: 'vils',
      volunteerPartnerOrgId: (vpoIds['verizon'] as string),
      studentPartnerOrgId: undefined,
      studentSponsorOrgId: (ssoIds['vils'] as string)
    },
  ]
  const temp: NameToId = {}
  for (const partner of partners) {
    temp[partner.key] = await wrapInsert(
      'associated_partners',
      pgQueries.insertAssociatedPartner.run,
      { ...partner }
    )
  }
  return temp
}
