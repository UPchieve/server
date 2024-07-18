import { readFile } from 'fs/promises'
import { getClient } from '../db'
import * as ApRepo from '../models/AssociatedPartner'
import { RepoTransactionError } from '../models/Errors'
import * as SoRepo from '../models/SponsorOrg'
import * as SpoRepo from '../models/StudentPartnerOrg'
import * as VpoRepo from '../models/VolunteerPartnerOrg'

type PartnerRepresentation = {
  name: string
  start: Date
  end: Date | undefined
}

function parseJsonFile(file: any): PartnerRepresentation[] {
  const raw = JSON.parse(file)
  const out: PartnerRepresentation[] = []
  for (const obj of raw) {
    if (
      obj['Start'] === '' ||
      obj['Start'] === undefined ||
      obj['Name'] === '' ||
      obj['Name'] === undefined
    )
      continue
    out.push({
      name: obj['Name'],
      start: obj['Start'],
      end: obj['End'] === '' ? undefined : obj['End'],
    })
  }
  return out
}

export default async function migrateHistoricalPartnershipsData(): Promise<
  void
> {
  const client = await getClient().connect()

  try {
    await client.query('BEGIN')

    const schools = parseJsonFile(
      await readFile('./server/scripts/schools.json')
    )
    const vpos = parseJsonFile(await readFile('./server/scripts/vpos.json'))
    const spos = parseJsonFile(await readFile('./server/scripts/spos.json'))

    // STUDENT PARTNER ORGS
    // First turn schools into canonical student partner orgs
    for (const school of schools) {
      await SpoRepo.migratePartnerSchoolsToPartnerOrgs(
        school.name,
        school.start,
        client
      )
    }
    // Next create spo-upchieve instances
    await SpoRepo.migrateExistingStudentPartnerOrgs(client)
    // Backfill SPO start dates
    for (const org of schools.concat(spos)) {
      await SpoRepo.backfillStudentPartnerOrgStartDates(
        org.name,
        org.start,
        org.end,
        client
      )
    }
    // Finally create user-spo instances
    await SpoRepo.migrateExistingStudentPartnerOrgRelationships(client)
    await SpoRepo.migrateExistingPartnerSchoolRelationships(client)

    // VOLUNTEER PARTNER ORGS
    // First create vpo-upchieve instances
    await VpoRepo.migrateExistingVolunteerPartnerOrgs(client)
    // Backfill VPO start dates
    for (const org of vpos) {
      await VpoRepo.backfillVolunteerPartnerOrgStartDates(
        org.name,
        org.start,
        org.end,
        client
      )
    }
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
    throw new RepoTransactionError(err)
  } finally {
    client.release()
  }
}

migrateHistoricalPartnershipsData()
