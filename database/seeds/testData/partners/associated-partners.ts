import { wrapInsert, NameToId, getDbUlid } from '../../utils'
import * as pgQueries from './pg.queries'

export async function associatedPartnersTest(
  vpoIds: NameToId,
  spoIds: NameToId,
  sponsorIds: NameToId
): Promise<NameToId> {
  const associatedPartnerOrgs = [
    {
      id: getDbUlid(),
      key: 'associatedWithSponsorOrg',
      vpoId: vpoIds['Big Telecom'] as string,
      spoId: undefined,
      soId: sponsorIds['onlySponsorsSchools'] as string,
    },
    {
      id: getDbUlid(),
      key: 'associatedWithPartnerOrg',
      vpoId: vpoIds['Big Telecom'] as string,
      spoId: spoIds['College Mentors'] as string,
      soId: undefined,
    },
  ]

  const associatedPartners: NameToId = {}
  for (const ap of associatedPartnerOrgs) {
    associatedPartners[ap.key] = await wrapInsert(
      'associated_partners',
      pgQueries.insertAssociatedPartner.run,
      { ...ap }
    )
  }

  return associatedPartners
}
