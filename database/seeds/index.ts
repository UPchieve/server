import { usStates } from './scripts/geography/us-states'
import { postalCodes } from './scripts/geography/postal-codes/postal-codes'
import { userRoles } from './scripts/users/user-roles'
import { banReasons } from './scripts/users/ban-reasons'
import { signupSources } from './scripts/users/signup-sources'
import { gradeLevels } from './scripts/users/grade-levels'
import { photoIdStatuses } from './scripts/users/photo-id-statuses'
import { volunteerReferenceStatuses } from './scripts/users/volunteer-reference-statuses'
import { studentPartnerOrgsTest } from './scripts/partners/student-partner-orgs-test'
import { studentPartnerOrgSitesTest } from './scripts/partners/student-partner-org-sites-test'
import { volunteerPartnerOrgsTest } from './scripts/partners/volunteer-partner-orgs-test'
import { requiredEmailDomainsTest } from './scripts/partners/required-email-domains-test'
import { trainingCourses } from './scripts/academics/training-courses'
import { topics } from './scripts/academics/topics'
import {
  subjects,
  certificationSubjectUnlocks,
} from './scripts/academics/subjects'
import { toolTypes } from './scripts/academics/tool-types'
import { certifications, getCertIds } from './scripts/academics/certifications'
import {
  quizSubcategories,
  quizzes,
  quizCertificationGrants,
  getQuizIds,
} from './scripts/academics/quizzes'
import { sessionFlags } from './scripts/sessions/session-flags'
import { reportReasons } from './scripts/sessions/report-reasons'
import { notificationTypes } from './scripts/notifications/notification-types'
import { notificationMethods } from './scripts/notifications/notification-methods'
import { priorityGroups } from './scripts/notifications/priority-groups'

import { startClient } from './pgClient'
import { ExpectedErrors } from './scripts/utils'

async function seedData(): Promise<void> {
  let exitCode = 0
  try {
    await startClient()

    await usStates()
    await postalCodes()

    await userRoles()
    await banReasons()
    await signupSources()
    await gradeLevels()

    const spoIds = await studentPartnerOrgsTest()
    await studentPartnerOrgSitesTest(spoIds)
    const vpoIds = await volunteerPartnerOrgsTest()
    await requiredEmailDomainsTest(vpoIds)

    await photoIdStatuses()
    await trainingCourses()
    await volunteerReferenceStatuses()

    const topicIds = await topics()
    const toolIds = await toolTypes()
    const subjectIds = await subjects(topicIds, toolIds)
    await quizzes()
    const quizIds = await getQuizIds()
    await quizSubcategories(quizIds)
    await certifications()
    const certIds = await getCertIds()
    await quizCertificationGrants(quizIds, certIds)
    await certificationSubjectUnlocks(subjectIds, quizIds)

    await sessionFlags()
    await reportReasons()

    await notificationTypes()
    await notificationMethods()
    await priorityGroups()

    // Test data
    // import { volunteers } from './scripts/testData/volunteers'
    // import { students } from './scripts/testData/students'
    // import { schools } from './scripts/testData/schools'
    // import { studentFavoriteVolunteers } from './scripts/testData/student-favorite-volunteers'
    // await schools()
    // await volunteers(vpoIds, certIds, quizIds)
    // await students(spoIds)
    // await studentFavoriteVolunteers(certIds, quizIds)
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
