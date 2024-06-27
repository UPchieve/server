import * as pgQueries from './pg.queries'
import client from '../../pgClient'

export async function partnerOrgInstances(): Promise<void> {
  await pgQueries.insertStudentPartnerOrgInstances.run(undefined, client)
  await pgQueries.insertExistingStudentPartnerOrgRelationships.run(
    undefined,
    client
  )
  await pgQueries.insertExistingPartnerSchoolRelationships.run(
    undefined,
    client
  )
  await pgQueries.insertExistingVolunteerPartnerOrgs.run(undefined, client)
  await pgQueries.insertExistingVolunteerPartnerOrgRelationships.run(
    undefined,
    client
  )
  await pgQueries.insertExistingSponsorOrgs.run(undefined, client)
  await pgQueries.insertExistingPartnerOrgSponsorOrgRelationships.run(
    undefined,
    client
  )
  await pgQueries.insertExistingSchoolsSponsorOrgRelationships.run(
    undefined,
    client
  )
  await pgQueries.insertStudentPartnerOrgAssociatedPartners.run(
    undefined,
    client
  )
  await pgQueries.insertSponsorOrgAssociatedPartners.run(undefined, client)
}
