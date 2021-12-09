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
import { subjects } from './scripts/academics/subjects'
import { toolTypes } from './scripts/academics/tool-types'
import { quizSubcategories, quizzes } from './scripts/academics/quizzes'
import { sessionFlags } from './scripts/sessions/session-flags'
import { reportReasons } from './scripts/sessions/report-reasons'
import { notificationTypes } from './scripts/notifications/notification-types'
import { notificationMethods } from './scripts/notifications/notification-methods'
import { notificationPriorityGroups } from './scripts/notifications/priority-groups'

async function seedData(): Promise<void> {
  let exitCode = 0
  try {
    await usStates()
    await postalCodes()
    await userRoles()
    await banReasons()
    await signupSources()
    await gradeLevels()

    await studentPartnerOrgsTest()
    await studentPartnerOrgSitesTest()
    await volunteerPartnerOrgsTest()
    await requiredEmailDomainsTest()

    await photoIdStatuses()
    await trainingCourses()
    await volunteerReferenceStatuses()

    await topics()
    await toolTypes()
    await subjects()

    await quizzes()
    await quizSubcategories()
    // await quizQuestions()
    await sessionFlags()
    await reportReasons()
    await notificationTypes()
    await notificationMethods()
    await notificationPriorityGroups()
    console.log('All data is seeded!')
  } catch (err) {
    exitCode = 1
    console.log(err as Error)
  } finally {
    process.exit(exitCode)
  }
}

seedData()
