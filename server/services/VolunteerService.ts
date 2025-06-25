import {
  ACCOUNT_USER_ACTIONS,
  EVENTS,
  PHOTO_ID_STATUS,
  STATUS,
} from '../constants'
import { Uuid } from '../models/pgUtils'
import { createAccountAction } from '../models/UserAction'
import * as VolunteerRepo from '../models/Volunteer'
import { Jobs } from '../worker/jobs'
import * as AnalyticsService from './AnalyticsService'
import { getTotalElapsedAvailabilityForDateRange } from './AvailabilityService'
import * as MailService from './MailService'
import QueueService from './QueueService'
import { getTimeTutoredForDateRange } from './SessionService'
import { getQuizzesPassedForDateRangeById } from '../models/UserAction'
import { TransactionClient } from '../db'
import { Sponsorship } from '../models/Volunteer'
import * as cache from '../cache'
import { getSubjectsWithTopic } from './SubjectsService'

export interface HourSummaryStats {
  totalCoachingHours: number
  totalQuizzesPassed: number
  totalElapsedAvailability: number
  totalVolunteerHours: number
}

export type VolunteerSubjectPresenceMap = { [subjectName: string]: number }

type VolunteerSubjectProfile = {
  userId: Uuid
  activeSubjects: string[]
  mutedSubjects: string[]
}

export async function getHourSummaryStats(
  volunteerId: Uuid,
  fromDate: Date,
  toDate: Date
): Promise<HourSummaryStats> {
  // TODO: promise.all fails fast, do we want this? - handle error?
  const [quizzesPassed, elapsedAvailability, timeTutoredMS] = await Promise.all(
    [
      getQuizzesPassedForDateRangeById(volunteerId, fromDate, toDate),
      getTotalElapsedAvailabilityForDateRange(volunteerId, fromDate, toDate),
      getTimeTutoredForDateRange(volunteerId, fromDate, toDate),
    ]
  )

  const timeTutoredInHours = Number(timeTutoredMS / 3600000).toFixed(2)
  const totalCoachingHours = Number(timeTutoredInHours)
  // Total volunteer hours calculation: [sum of coaching, elapsed avail/10, and quizzes]
  const totalVolunteerHours = Number(
    (
      totalCoachingHours +
      quizzesPassed +
      Number(elapsedAvailability) * 0.1
    ).toFixed(2)
  )
  return {
    totalCoachingHours,
    totalQuizzesPassed: quizzesPassed,
    totalElapsedAvailability: elapsedAvailability,
    totalVolunteerHours: totalVolunteerHours,
  }
}

export async function queueOnboardingReminderOneEmail(
  volunteerId: Uuid
): Promise<void> {
  const sevenDaysInMs = 1000 * 60 * 60 * 24 * 7
  await QueueService.add(
    Jobs.EmailOnboardingReminderOne,
    { volunteerId },
    { delay: sevenDaysInMs, removeOnComplete: true, removeOnFail: true }
  )
}

export async function queueOnboardingEventEmails(
  volunteerId: Uuid,
  isPartnerVolunteer: boolean = false
): Promise<void> {
  await QueueService.add(
    Jobs.EmailVolunteerQuickTips,
    { volunteerId },
    // Process job 5 days after the volunteer is onboarded.
    {
      delay: 1000 * 60 * 60 * 24 * 5,
      removeOnComplete: true,
      removeOnFail: true,
    }
  )
  if (isPartnerVolunteer) {
    await QueueService.add(
      Jobs.EmailPartnerVolunteerLowHoursSelected,
      { volunteerId },
      // Process job 10 days after the volunteer is onboarded.
      {
        delay: 1000 * 60 * 60 * 24 * 10,
        removeOnComplete: true,
        removeOnFail: true,
      }
    )
  }
}

export async function queueFailedFirstAttemptedQuizEmail(
  category: string,
  email: string,
  firstName: string,
  volunteerId: Uuid
) {
  await QueueService.add(
    Jobs.EmailFailedFirstAttemptedQuiz,
    {
      category,
      email,
      firstName,
      volunteerId,
    },
    {
      removeOnComplete: true,
      removeOnFail: true,
    }
  )
}

export async function getVolunteersToReview(page: number = 1): Promise<{
  volunteers: any[]
  isLastPage: boolean
}> {
  const pageNum = page
  const PER_PAGE = 15
  const skip = (pageNum - 1) * PER_PAGE

  try {
    // Replaced by VolunteerRepo.getVolunteersToReview
    const volunteers = await VolunteerRepo.getVolunteersToReview(PER_PAGE, skip)

    const isLastPage = volunteers.length < PER_PAGE
    return { volunteers, isLastPage }
  } catch (error) {
    throw new Error((error as Error).message)
  }
}

export function getPendingVolunteerApprovalStatus(
  photoIdStatus: string,
  hasCompletedBackgroundInfo: boolean
) {
  return photoIdStatus === STATUS.APPROVED && hasCompletedBackgroundInfo
}

export async function updatePendingVolunteerStatus(
  volunteerId: Uuid,
  photoIdStatus: string
): Promise<void> {
  const volunteerBeforeUpdate =
    await VolunteerRepo.getVolunteerForPendingStatus(volunteerId)
  if (!volunteerBeforeUpdate) return

  const hasCompletedBackgroundInfo =
    volunteerBeforeUpdate.occupations &&
    volunteerBeforeUpdate.occupations.length > 0 &&
    volunteerBeforeUpdate.country
      ? true
      : false
  // A volunteer must have the following list items approved before being considered an approved volunteer
  // 1. photo id
  // 2. completed background information
  const isApproved = getPendingVolunteerApprovalStatus(
    photoIdStatus,
    hasCompletedBackgroundInfo
  )

  await VolunteerRepo.updateVolunteerPending(
    volunteerId,
    isApproved,
    photoIdStatus
  )

  if (
    photoIdStatus === PHOTO_ID_STATUS.REJECTED &&
    volunteerBeforeUpdate.photoIdStatus !== PHOTO_ID_STATUS.REJECTED
  ) {
    await createAccountAction({
      userId: volunteerId,
      action: ACCOUNT_USER_ACTIONS.REJECTED_PHOTO_ID,
    })
    AnalyticsService.captureEvent(volunteerId, EVENTS.PHOTO_ID_REJECTED, {
      event: EVENTS.PHOTO_ID_REJECTED,
    })
    MailService.sendRejectedPhotoSubmission(volunteerBeforeUpdate)
  }

  const isNewlyApproved = isApproved && !volunteerBeforeUpdate.approved
  if (isNewlyApproved) {
    await createAccountAction({
      userId: volunteerId,
      action: ACCOUNT_USER_ACTIONS.APPROVED,
    })
    AnalyticsService.captureEvent(volunteerId, EVENTS.ACCOUNT_APPROVED, {
      event: EVENTS.ACCOUNT_APPROVED,
    })

    if (volunteerBeforeUpdate.onboarded) {
      AnalyticsService.captureEvent(volunteerId, EVENTS.ACCOUNT_VOLUNTEER_READY)
    }
  }
  if (isNewlyApproved && !volunteerBeforeUpdate.onboarded)
    MailService.sendApprovedNotOnboardedEmail(volunteerBeforeUpdate)
}

export async function addBackgroundInfo(
  volunteerId: Uuid,
  update: Omit<VolunteerRepo.BackgroundInfo, 'approved'>,
  ip: string
): Promise<void> {
  const volunteer = await VolunteerRepo.getVolunteerContactInfoById(volunteerId)
  if (!volunteer) throw new Error('Volunteer for background info not found')
  const volunteerPartnerOrg = volunteer.volunteerPartnerOrg
  let approved: boolean | undefined
  if (volunteerPartnerOrg) {
    approved = true
    await createAccountAction({
      userId: volunteerId,
      action: ACCOUNT_USER_ACTIONS.APPROVED,
      ipAddress: ip,
    })
    // TODO: if not onboarded, send a partner-specific version of the "approved but not onboarded" email
  }

  // remove fields with empty strings and empty arrays from the update
  for (const field in update) {
    const tField = field as keyof typeof update
    if (
      (update &&
        update[tField] &&
        Array.isArray(update[tField]) &&
        (update[tField] as Array<any>).length === 0) ||
      update[tField] === ''
    )
      update[tField] = undefined
  }

  await createAccountAction({
    userId: volunteerId,
    action: ACCOUNT_USER_ACTIONS.COMPLETED_BACKGROUND_INFO,
    ipAddress: ip,
  })
  await VolunteerRepo.updateVolunteerBackgroundInfo(volunteerId, {
    ...update,
    approved,
  })
}

export async function onboardVolunteer(
  volunteerId: Uuid,
  ip: string,
  tc: TransactionClient
): Promise<void> {
  const volunteer = await VolunteerRepo.getVolunteerForOnboardingById(
    volunteerId,
    tc
  )
  if (!volunteer) {
    // If there is no volunteer, means they've already been onboarded.
    return
  }

  // Onboard the volunteer if they were not previously onboarded,
  // but they have now met the requirements.
  if (
    volunteer.subjects.length &&
    volunteer.hasCompletedUpchieve101 &&
    volunteer.availabilityLastModifiedAt
  ) {
    await VolunteerRepo.updateVolunteerOnboarded(volunteer.id, tc)
    await queueOnboardingEventEmails(
      volunteer.id,
      !!volunteer.volunteerPartnerOrgKey
    )
    await createAccountAction(
      {
        action: ACCOUNT_USER_ACTIONS.ONBOARDED,
        userId: volunteer.id,
        ipAddress: ip,
      },
      tc
    )
    AnalyticsService.captureEvent(volunteer.id, EVENTS.ACCOUNT_ONBOARDED, {
      event: EVENTS.ACCOUNT_ONBOARDED,
    })

    if (volunteer.approved) {
      AnalyticsService.captureEvent(volunteerId, EVENTS.ACCOUNT_VOLUNTEER_READY)
    }
  }
}

export async function getActiveSponsorshipsByUserId(
  userId: Uuid,
  tc?: TransactionClient
): Promise<Sponsorship[]> {
  return await VolunteerRepo.getActiveSponsorshipsByUserId(userId, tc)
}

function getVolunteerSubjectPresenceCacheKey(subject: string) {
  return `online:subject:${subject}`
}

async function getVolunteerSubjectProfile(
  userId: Uuid
): Promise<VolunteerSubjectProfile | undefined> {
  const subjectsResult = await VolunteerRepo.getVolunteerSubjects(userId)
  const mutedSubjectsResult =
    await VolunteerRepo.getVolunteerMutedSubjects(userId)

  const subjects: string[] = []
  const activeSubjects: string[] = []
  for (const { name, active } of subjectsResult) {
    subjects.push(name)
    if (active) activeSubjects.push(name)
  }

  const mutedSubjects = mutedSubjectsResult.map(({ name }) => name)
  return {
    userId,
    activeSubjects,
    mutedSubjects,
  }
}

export async function updateVolunteerSubjectPresence(
  userId: Uuid,
  action: 'add' | 'remove'
): Promise<void> {
  const subjectProfile = await getVolunteerSubjectProfile(userId)
  if (!subjectProfile) return

  const activeSubjects = subjectProfile.activeSubjects.filter(
    (subject) => !subjectProfile.mutedSubjects.includes(subject)
  )
  if (activeSubjects.length === 0) return

  const promises = activeSubjects.map((subject) => {
    const key = getVolunteerSubjectPresenceCacheKey(subject)
    return action === 'add'
      ? cache.sadd(key, userId)
      : cache.removeFromSet(key, userId)
  })
  await Promise.all(promises)
}

export async function getSubjectPresence(): Promise<VolunteerSubjectPresenceMap> {
  const allSubjects = await getSubjectsWithTopic()
  const subjectPresenceMap: VolunteerSubjectPresenceMap = {}

  for (const subject of Object.values(allSubjects)) {
    const key = getVolunteerSubjectPresenceCacheKey(subject.name)
    const count = await cache.getSetSize(key)
    subjectPresenceMap[subject.name] = count
  }

  return subjectPresenceMap
}
