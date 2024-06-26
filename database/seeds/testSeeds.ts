import { ExpectedErrors } from './utils'
import { volunteers } from './testData/volunteers'
import { students } from './testData/students'
import { schools } from './testData/schools'
import { studentFavoriteVolunteers } from './testData/student-favorite-volunteers'
import * as statics from './testData/lookupStatics'
import { cities } from './testData/cities'
import { studentPartnerOrgsTest } from './testData/partners/student-partner-orgs-test'
import { studentPartnerOrgSitesTest } from './testData/partners/student-partner-org-sites-test'
import { volunteerPartnerOrgsTest } from './testData/partners/volunteer-partner-orgs-test'
import { requiredEmailDomainsTest } from './testData/partners/required-email-domains-test'
import { sponsorOrgsTest } from './testData/partners/sponsor-orgs'
import { associatedPartnersTest } from './testData/partners/associated-partners'
import { partnerOrgInstances } from './testData/partners/partner-org-instances'

async function seedData(): Promise<void> {
  let exitCode = 0
  try {
    const spoIds = await studentPartnerOrgsTest()
    await studentPartnerOrgSitesTest(spoIds)
    const vpoIds = await volunteerPartnerOrgsTest()
    await requiredEmailDomainsTest(vpoIds)

    const certIds = await statics.getCertifications()
    const quizIds = await statics.getQuizzes()

    const cityIds = await cities()
    const schoolIds = await schools(cityIds)

    const sponsorOrgs = await sponsorOrgsTest(spoIds, schoolIds)
    await associatedPartnersTest(vpoIds, spoIds, sponsorOrgs)

    await volunteers(vpoIds, certIds, quizIds)
    await students(spoIds, schoolIds)
    await partnerOrgInstances()
    // await studentFavoriteVolunteers(certIds, quizIds)

    console.log('All test data is seeded!')
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
