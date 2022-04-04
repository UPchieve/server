import { schoolsSponsorOrgsReal, studentPartnerOrgsSponsorOrgsReal } from './scripts/partners/sponsor-orgs-real'
import { ExpectedErrors, NameToId } from './scripts/utils'
import * as pgQueries from './scripts/partners/pg.queries'
import client from './pgClient'

async function getStudentPartnerOrgIds(): Promise<NameToId> {
  try {
    const result = await pgQueries.getStudentPartnerOrgs.run(undefined, client)
    const map: NameToId = {}
    for (const row of result) {
      map[row.key] = row.id
    }
    return map
  } catch (err) {
    throw new Error('Could not read student partner orgs')
  }
}

async function getSponsorOrgIds(): Promise<NameToId> {
  try {
    const result = await pgQueries.getSponsorOrgs.run(undefined, client)
    const map: NameToId = {}
    for (const row of result) {
      map[row.key] = row.id
    }
    return map
  } catch (err) {
    throw new Error('Could not read student partner orgs')
  }
}

async function seedData(): Promise<void> {
  let exitCode = 0
  try {
    const spoIds = await getStudentPartnerOrgIds()
    const ssoIds = await getSponsorOrgIds()
    await schoolsSponsorOrgsReal(ssoIds)
    await studentPartnerOrgsSponsorOrgsReal(ssoIds, spoIds)

    console.log('All data is seeded!')
    if (ExpectedErrors.length)
      console.log(
        `Tried to re-seed ${ExpectedErrors.length} objects already in database`
      )
  } catch (err) {
    exitCode = 1
    console.log(err as Error)
  } finally {
    process.exit(exitCode)
  }
}

seedData()