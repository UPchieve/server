import { usStates } from './static/geography/us-states'
import { postalCodes } from './static/geography/postal-codes/postal-codes'
import { userRoles } from './static/users/user-roles'
import { banReasons } from './static/users/ban-reasons'
import { signupSources } from './static/users/signup-sources'
import { gradeLevels } from './static/users/grade-levels'
import { photoIdStatuses } from './static/users/photo-id-statuses'
import { volunteerReferenceStatuses } from './static/users/volunteer-reference-statuses'
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

import { weekdays } from './static/geography/weekdays'

export async function initStaticSeedData(
  numZipCodes: number | undefined
): Promise<void> {
  await usStates()
  await postalCodes(numZipCodes)
  await weekdays()

  await userRoles()
  await banReasons()
  await signupSources()
  await gradeLevels()

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
}
