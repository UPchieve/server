import { Types } from 'mongoose'
import { EVENTS } from '../constants'
import { School } from '../models/School'
import { Jobs } from '../worker/jobs'
import QueueService from './QueueService'
import { getSchool } from './SchoolService'
import * as AnalyticsService from './AnalyticsService'
import { getStudentById } from '../models/Student/queries'
import { getIdFromModelReference } from '../utils/model-reference'

export const queueOnboardingEmails = async (
  studentId: Types.ObjectId
): Promise<void> => {
  await QueueService.add(
    Jobs.EmailStudentOnboardingHowItWorks,
    { studentId },
    // process job 1 day after the student account is created
    { delay: 1000 * 60 * 60 * 24 * 1 }
  )
  await QueueService.add(
    Jobs.EmailMeetOurVolunteers,
    { studentId },
    // process job 3 days after the student account is created
    { delay: 1000 * 60 * 60 * 24 * 3 }
  )
  await QueueService.add(
    Jobs.EmailStudentOnboardingMission,
    { studentId },
    // process job 10 days after the student account is created
    { delay: 1000 * 60 * 60 * 24 * 10 }
  )
  await QueueService.add(
    Jobs.EmailStudentOnboardingSurvey,
    { studentId },
    // process job 14 days after the student account is created
    { delay: 1000 * 60 * 60 * 24 * 14 }
  )
}

// registered as listener on student-created
export async function processStudentTrackingPostHog(studentId: Types.ObjectId) {
  const userProperties: any = {
    userType: 'student',
  }
  const student = await getStudentById(studentId)
  let school: School | undefined

  if (student) {
    if (
      student.approvedHighschool &&
      student.approvedHighschool instanceof Types.ObjectId
    ) {
      school = await getSchool(
        getIdFromModelReference(student.approvedHighschool)
      )
    } else school = student.approvedHighschool

    let schoolName
    if (school)
      schoolName = school.nameStored ? school.nameStored : school.SCH_NAME

    // if student is school partner student
    if (school && school.isPartner) {
      userProperties.schoolPartner = schoolName
    }
    // if student is partner student but not a school partner student
    if (student.studentPartnerOrg)
      userProperties.partner = student.studentPartnerOrg

    AnalyticsService.captureEvent(student._id, EVENTS.ACCOUNT_CREATED, {
      event: EVENTS.ACCOUNT_CREATED,
    })
    AnalyticsService.identify(student._id, userProperties)
  }
}
