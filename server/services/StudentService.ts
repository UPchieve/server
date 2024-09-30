import { ACCOUNT_USER_ACTIONS, EVENTS } from '../constants'
import { Jobs } from '../worker/jobs'
import QueueService from './QueueService'
import * as AnalyticsService from './AnalyticsService'
import * as FavoritingService from './FavoritingService'
import * as StudentRepo from '../models/Student/queries'
import * as TeacherClassRepo from '../models/TeacherClass/queries'
import config from '../config'
import { Ulid } from '../models/pgUtils'
import { FavoriteLimitReachedError } from './Errors'
import { createAccountAction } from '../models/UserAction'
import {
  StudentPartnerOrgInstance,
  StudentSignupSources,
} from '../models/Student/queries'
import { TeacherClassResult } from '../models/TeacherClass'
import { runInTransaction, TransactionClient } from '../db'

export const queueOnboardingEmails = async (studentId: Ulid): Promise<void> => {
  await QueueService.add(
    Jobs.EmailStudentOnboardingHowItWorks,
    { studentId },
    // process job 1 day after the student account is created
    {
      delay: 1000 * 60 * 60 * 24 * 1,
      removeOnComplete: true,
      removeOnFail: true,
    }
  )
  await QueueService.add(
    Jobs.EmailMeetOurVolunteers,
    { studentId },
    // process job 3 days after the student account is created
    {
      delay: 1000 * 60 * 60 * 24 * 3,
      removeOnComplete: true,
      removeOnFail: true,
    }
  )
  await QueueService.add(
    Jobs.EmailStudentOnboardingMission,
    { studentId },
    // process job 10 days after the student account is created
    {
      delay: 1000 * 60 * 60 * 24 * 10,
      removeOnComplete: true,
      removeOnFail: true,
    }
  )
  await QueueService.add(
    Jobs.EmailStudentOnboardingSurvey,
    { studentId },
    // process job 14 days after the student account is created
    {
      delay: 1000 * 60 * 60 * 24 * 14,
      removeOnComplete: true,
      removeOnFail: true,
    }
  )
}

// registered as listener on student-created
export async function processStudentTrackingPostHog(studentId: Ulid) {
  AnalyticsService.captureEvent(studentId, EVENTS.ACCOUNT_CREATED)
}

export async function checkAndUpdateVolunteerFavoriting(
  isFavorite: boolean,
  studentId: Ulid,
  volunteerId: Ulid,
  sessionId?: Ulid,
  ip?: string
) {
  return await runInTransaction(async (tc: TransactionClient) => {
    if (isFavorite) {
      const totalFavoriteVolunteers = await StudentRepo.getTotalFavoriteVolunteers(
        studentId.toString()
      )
      if (totalFavoriteVolunteers >= config.favoriteVolunteerLimit) {
        throw new FavoriteLimitReachedError('Favorite volunteer limit reached.')
      }
      await createAccountAction(
        {
          userId: studentId,
          volunteerId: volunteerId,
          sessionId: sessionId,
          action: ACCOUNT_USER_ACTIONS.VOLUNTEER_FAVORITED,
        },
        tc
      )
      const favoritedResult = await StudentRepo.addFavoriteVolunteer(
        studentId,
        volunteerId,
        tc
      )
      if (favoritedResult) {
        await FavoritingService.emailFavoritedVolunteer(volunteerId, studentId)
      }
      return { isFavorite: true }
    } else {
      await createAccountAction({
        userId: studentId,
        volunteerId: volunteerId,
        sessionId: sessionId,
        action: ACCOUNT_USER_ACTIONS.VOLUNTEER_UNFAVORITED,
      })
      await StudentRepo.deleteFavoriteVolunteer(studentId, volunteerId, tc)
      return { isFavorite: false }
    }
  })
}

export async function getFavoriteVolunteersPaginated(
  userId: Ulid,
  page: number
) {
  const limit = 5
  const offset = limit * (page - 1)
  return await StudentRepo.getFavoriteVolunteersPaginated(userId, limit, offset)
}

export async function getStudentSignupSources(): Promise<
  StudentSignupSources[] | undefined
> {
  return await StudentRepo.getStudentSignupSources()
}

export async function adminGetActivePartnersForStudent(
  studentId: Ulid
): Promise<StudentPartnerOrgInstance[] | undefined> {
  return await StudentRepo.getActivePartnersForStudent(studentId)
}

export async function doesStudentWithEmailExist(email: string) {
  return !!(await StudentRepo.getStudentByEmail(email))
}

export async function getStudentByEmail(email?: string) {
  if (!email) return
  return StudentRepo.getStudentByEmail(email)
}

export async function getActiveClassesForStudent(
  studentId: Ulid
): Promise<TeacherClassResult[]> {
  const teacherClasses = await TeacherClassRepo.getTeacherClassesForStudent(
    studentId
  )
  return teacherClasses.filter(c => c.active)
}
