import * as ApRepo from '../models/AssociatedPartner'
import * as SoRepo from '../models/SponsorOrg'
import * as SpoRepo from '../models/StudentPartnerOrg'
import * as VpoRepo from '../models/VolunteerPartnerOrg'
import { getClient } from '../db'

export default async function migrateHistoricalPartnershipsData(): Promise<
  void
> {
  const client = await getClient().connect()

  try {
    await client.query('BEGIN')

    // STUDENT PARTNER ORGS
    // First turn schools into canonical student partner orgs
    await SpoRepo.migratePartnerSchoolsToPartnerOrgs(client)
    // Next create spo-upchieve instances
    await SpoRepo.migrateExistingStudentPartnerOrgs(client)
    // Finally create user-spo instances
    await SpoRepo.migrateExistingStudentPartnerOrgRelationships(client)
    await SpoRepo.migrateExistingPartnerSchoolRelationships(client)

    // VOLUNTEER PARTNER ORGS
    // First create vpo-upchieve instances
    await VpoRepo.migrateExistingVolunteerPartnerOrgs(client)
    // Finally create user-vpo insances
    await VpoRepo.migrateExistingvolunteerPartnerOrgRelationships(client)

    // SPONSOR ORGS
    // First create so-upchieve instances
    await SoRepo.migrateExistingSponsorOrgs(client)
    // Next create spo-so instances
    await SoRepo.migrateExistingPartnerOrgSponsorOrgRelationships(client)
    // Finally create school-so instances
    await SoRepo.migrateExistingSchoolsSponsorOrgRelationships(client)

    // ASSOCIATED PARTNERS
    await ApRepo.migrateStudentPartnerOrgAssociatedPartners(client)
    await ApRepo.migrateSponsorOrgAssociatedPartners(client)

    await client.query('COMMIT')
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}
