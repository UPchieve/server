import { ACCOUNT_USER_ACTIONS, EVENTS } from '../constants'
import { School } from '../models/School'
import { Jobs } from '../worker/jobs'
import QueueService from './QueueService'
import { getSchool } from './SchoolService'
import * as AnalyticsService from './AnalyticsService'
import * as StudentRepo from '../models/Student/queries'
import config from '../config'
import { Ulid } from '../models/pgUtils'
import { FavoriteLimitReachedError } from './Errors'
import { createAccountAction } from '../models/UserAction'
import {
  StudentPartnerOrgInstance,
  StudentSignupSources,
} from '../models/Student/queries'
import moment from 'moment'
import { updateUserPhoneNumberByUserId } from '../models/User'

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

export const queueProcrastinationTextReminder = async (
  studentId: Ulid,
  phoneNumber: string,
  reminderDate: string
): Promise<void> => {
  await updateUserPhoneNumberByUserId(studentId, phoneNumber)

  const utcReminderDate = moment(reminderDate, 'MM-DD-YYYY HH:mm a').tz('GMT')
  const diffInMilliseconds = utcReminderDate.diff(moment().utc())

  await QueueService.add(
    Jobs.StudentProcrastinationTextReminder,
    { userId: studentId },
    {
      delay: diffInMilliseconds,
      removeOnComplete: true,
      removeOnFail: true,
    }
  )
  AnalyticsService.captureEvent(
    studentId,
    EVENTS.STUDENT_PROCRASTINATION_PREVENTION_REMINDER_QUEUED,
    {
      event: EVENTS.STUDENT_PROCRASTINATION_PREVENTION_REMINDER_QUEUED,
    }
  )
}
