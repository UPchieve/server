import { ACCOUNT_USER_ACTIONS, EVENTS } from '../constants'
import { AdminSchool } from '../models/School'
import { Jobs } from '../worker/jobs'
import QueueService from './QueueService'
import { getSchool } from './SchoolService'
import * as AnalyticsService from './AnalyticsService'
import * as StudentRepo from '../models/Student/queries'
import config from '../config'
import { Ulid } from '../models/pgUtils'
import { FavoriteLimitReachedError } from './Errors'
import { createAccountAction } from '../models/UserAction'

export const queueOnboardingEmails = async (studentId: Ulid): Promise<void> => {
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
export async function processStudentTrackingPostHog(studentId: Ulid) {
  const userProperties: AnalyticsService.IdentifyProperties = {
    userType: 'student',
  }
  // replace with getStudentPartnerInfoById from Student Repo
  const student = await StudentRepo.getStudentContactInfoById(studentId)

  if (student) {
    let school: AdminSchool | undefined
    if (student.schoolId) school = await getSchool(student.schoolId)

    // if student is school partner student
    if (school && school.isPartner) userProperties.schoolPartner = school.name

    // if student is partner student but not a school partner student
    if (student.studentPartnerOrg)
      userProperties.partner = student.studentPartnerOrg

    AnalyticsService.captureEvent(student.id, EVENTS.ACCOUNT_CREATED, {
      event: EVENTS.ACCOUNT_CREATED,
    })
    AnalyticsService.identify(student.id, userProperties)
  }
}

export async function checkAndUpdateVolunteerFavoriting(
  isFavorite: boolean,
  studentId: Ulid,
  volunteerId: Ulid,
  sessionId?: Ulid,
  ip?: string
) {
  if (isFavorite) {
    const totalFavoriteVolunteers = await StudentRepo.getTotalFavoriteVolunteers(
      studentId.toString()
    )
    if (config.favoriteVolunteerLimit - totalFavoriteVolunteers > 0) {
      await createAccountAction({
        userId: studentId,
        volunteerId: volunteerId,
        sessionId: sessionId,
        action: ACCOUNT_USER_ACTIONS.VOLUNTEER_FAVORITED,
      })
      await StudentRepo.addFavoriteVolunteer(studentId, volunteerId)
      return { isFavorite: true }
    }
    throw new FavoriteLimitReachedError('Favorite volunteer limit reached.')
  } else {
    await createAccountAction({
      userId: studentId,
      volunteerId: volunteerId,
      sessionId: sessionId,
      action: ACCOUNT_USER_ACTIONS.VOLUNTEER_UNFAVORITED,
    })
    await StudentRepo.deleteFavoriteVolunteer(studentId, volunteerId)
    return { isFavorite: false }
  }
}

export async function getFavoriteVolunteersPaginated(
  userId: Ulid,
  page: number
) {
  const limit = 10
  const offset = limit * (page - 1)
  return await StudentRepo.getFavoriteVolunteers(userId, limit, offset)
}
