import { usStates } from './static/geography/us-states'
import { postalCodes } from './static/geography/postal-codes/postal-codes'
import { userRoles } from './static/users/user-roles'
import { banReasons } from './static/users/ban-reasons'
import { signupSources } from './static/users/signup-sources'
import { gradeLevels } from './static/users/grade-levels'
import { photoIdStatuses } from './static/users/photo-id-statuses'
import { volunteerReferenceStatuses } from './static/users/volunteer-reference-statuses'
import { studentPartnerOrgsTest } from './static/partners/student-partner-orgs-test'
import { studentPartnerOrgSitesTest } from './static/partners/student-partner-org-sites-test'
import { volunteerPartnerOrgsTest } from './static/partners/volunteer-partner-orgs-test'
import { requiredEmailDomainsTest } from './static/partners/required-email-domains-test'
import { trainingCourses } from './static/academics/training-courses'
import { topics } from './static/academics/topics'
import {
  subjects,
  certificationSubjectUnlocks,
} from './static/academics/subjects'
import { toolTypes } from './static/academics/tool-types'
import { certifications, getCertIds } from './static/academics/certifications'
import {
  quizSubcategories,
  quizzes,
  quizCertificationGrants,
  getQuizIds,
} from './static/academics/quizzes'
import { sessionFlags } from './static/sessions/session-flags'
import { reportReasons } from './static/sessions/report-reasons'
import { notificationTypes } from './static/notifications/notification-types'
import { notificationMethods } from './static/notifications/notification-methods'
import { priorityGroups } from './static/notifications/priority-groups'

import { ExpectedErrors } from './utils'
import { weekdays } from './static/geography/weekdays'

async function seedData(): Promise<void> {
  let exitCode = 0
  try {
    await usStates()
    await postalCodes()
    await weekdays()

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
