import { Types } from 'mongoose'
import { EVENTS } from '../constants'
import { School } from '../models/School'
import { Jobs } from '../worker/jobs'
import QueueService from './QueueService'
import { getSchool } from './SchoolService'
import * as AnalyticsService from './AnalyticsService'
import * as StudentRepo from '../models/Student/queries'
import { getIdFromModelReference } from '../utils/model-reference'
import * as UserActionCtrl from '../controllers/UserActionCtrl'
import config from '../config'
import { Ulid } from '../models/pgUtils'
import { FavoriteLimitReachedError } from './Errors'

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
  const userProperties: AnalyticsService.IdentifyProperties = {
    userType: 'student',
  }
  const student = await StudentRepo.getStudentById(studentId)

  if (student) {
    let school: School | undefined
    if (student.approvedHighschool)
      school = await getSchool(
        getIdFromModelReference(student.approvedHighschool)
      )

    // if student is school partner student
    if (school && school.isPartner) userProperties.schoolPartner = school.name

    // if student is partner student but not a school partner student
    if (student.studentPartnerOrg)
      userProperties.partner = student.studentPartnerOrg

    AnalyticsService.captureEvent(student._id, EVENTS.ACCOUNT_CREATED, {
      event: EVENTS.ACCOUNT_CREATED,
    })
    AnalyticsService.identify(student._id, userProperties)
  }
}

export async function checkAndUpdateVolunteerFavoriting(
  isFavorite: boolean,
  studentId: Types.ObjectId,
  volunteerId: Types.ObjectId,
  sessionId?: Types.ObjectId,
  ip?: string
) {
  if (isFavorite) {
    const totalFavoriteVolunteers = await StudentRepo.getTotalFavoriteVolunteers(
      studentId.toString()
    )
    if (config.favoriteVolunteerLimit - totalFavoriteVolunteers > 0) {
      await new UserActionCtrl.AccountActionCreator(studentId, ip, {
        volunteerId: volunteerId,
        session: sessionId,
      }).volunteerFavorited()
      await StudentRepo.addFavoriteVolunteer(studentId, volunteerId)
      return { isFavorite: true }
    }
    throw new FavoriteLimitReachedError('Favorite volunteer limit reached.')
  } else {
    await new UserActionCtrl.AccountActionCreator(studentId, ip, {
      volunteerId: volunteerId,
      session: sessionId,
    }).volunteerUnfavorited()
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
