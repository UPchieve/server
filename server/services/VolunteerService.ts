import { logger } from '@sentry/utils'
import {
  ACCOUNT_USER_ACTIONS,
  EVENTS,
  PHOTO_ID_STATUS,
  REFERENCE_STATUS,
  STATUS,
} from '../constants'
import { Ulid } from '../models/pgUtils'
import { createAccountAction } from '../models/UserAction'
import * as VolunteerRepo from '../models/Volunteer'
import { Jobs } from '../worker/jobs'
import * as AnalyticsService from './AnalyticsService'
import { getTotalElapsedAvailabilityForDateRange } from './AvailabilityService'
import * as MailService from './MailService'
import QueueService from './QueueService'
import { getTimeTutoredForDateRange } from './SessionService'
import { getQuizzesPassedForDateRangeById } from '../models/UserAction'

export interface HourSummaryStats {
  totalCoachingHours: number
  totalQuizzesPassed: number
  totalElapsedAvailability: number
  totalVolunteerHours: number
}

export async function getHourSummaryStats(
  volunteerId: Ulid,
  fromDate: Date,
  toDate: Date
): Promise<HourSummaryStats> {
  // TODO: promise.all fails fast, do we want this? - handle error?
  const [
    quizzesPassed,
    elapsedAvailability,
    timeTutoredMS,
  ] = await Promise.all([
    getQuizzesPassedForDateRangeById(volunteerId, fromDate, toDate),
    getTotalElapsedAvailabilityForDateRange(volunteerId, fromDate, toDate),
    getTimeTutoredForDateRange(volunteerId, fromDate, toDate),
  ])

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
  volunteerId: Ulid
): Promise<void> {
  const sevenDaysInMs = 1000 * 60 * 60 * 24 * 7
  await QueueService.add(
    Jobs.EmailOnboardingReminderOne,
    { volunteerId },
    { delay: sevenDaysInMs, removeOnComplete: true, removeOnFail: true }
  )
}

export async function queueOnboardingEventEmails(
  volunteerId: Ulid
): Promise<void> {
  await QueueService.add(
    Jobs.EmailVolunteerQuickTips,
    { volunteerId },
    // process job 5 days after the volunteer is onboarded
    {
      delay: 1000 * 60 * 60 * 24 * 5,
      removeOnComplete: true,
      removeOnFail: true,
    }
  )
}

export async function queueFailedFirstAttemptedQuizEmail(
  category: string,
  email: string,
  firstName: string,
  volunteerId: Ulid
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

export async function queuePartnerOnboardingEventEmails(
  volunteerId: Ulid
): Promise<void> {
  await QueueService.add(
    Jobs.EmailPartnerVolunteerLowHoursSelected,
    { volunteerId },
    // process job 10 days after the volunteer is onboarded
    {
      delay: 1000 * 60 * 60 * 24 * 10,
      removeOnComplete: true,
      removeOnFail: true,
    }
  )
}

export async function getVolunteersToReview(
  page: number = 1
): Promise<{
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
  referencesStatus: string[],
  hasCompletedBackgroundInfo: boolean
) {
  return (
    referencesStatus[0] === STATUS.APPROVED &&
    referencesStatus[1] === STATUS.APPROVED &&
    photoIdStatus === STATUS.APPROVED &&
    hasCompletedBackgroundInfo
  )
}

interface PendingVolunteerUpdate {
  isApproved: boolean
  photoIdStatus?: string
  'references.0.status'?: string
  'references.1.status'?: string
}

export async function updatePendingVolunteerStatus(
  volunteerId: Ulid,
  photoIdStatus: string,
  referencesStatus: { [key: string]: string }
): Promise<void> {
  const volunteerBeforeUpdate = await VolunteerRepo.getVolunteerForPendingStatus(
    volunteerId
  )
  if (!volunteerBeforeUpdate) return

  const hasCompletedBackgroundInfo =
    volunteerBeforeUpdate.occupations &&
    volunteerBeforeUpdate.occupations.length > 0 &&
    volunteerBeforeUpdate.country
      ? true
      : false
  // A volunteer must have the following list items approved before being considered an approved volunteer
  //  1. two references
  //  2. photo id
  const isApproved = getPendingVolunteerApprovalStatus(
    photoIdStatus,
    Object.values(referencesStatus),
    hasCompletedBackgroundInfo
  )

  for (const [referenceId, status] of Object.entries(referencesStatus)) {
    await VolunteerRepo.updateVolunteerReferenceStatusById(referenceId, status)
  }
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
  }
  if (isNewlyApproved && !volunteerBeforeUpdate.onboarded)
    MailService.sendApprovedNotOnboardedEmail(volunteerBeforeUpdate)

  for (const [referenceId, status] of Object.entries(referencesStatus)) {
    const reference = volunteerBeforeUpdate.references.find(
      v => v.id === referenceId
    )
    if (!reference) {
      logger.error(
        `Recieved status update for reference ${referenceId} which does not belong to volunteer ${volunteerBeforeUpdate.id}`
      )
      continue
    }
    if (
      status === REFERENCE_STATUS.REJECTED &&
      reference.status !== REFERENCE_STATUS.REJECTED
    ) {
      await createAccountAction({
        userId: volunteerId,
        action: ACCOUNT_USER_ACTIONS.REJECTED_REFERENCE,
        referenceEmail: reference.email,
      })
      AnalyticsService.captureEvent(volunteerId, EVENTS.REFERENCE_REJECTED, {
        event: EVENTS.REFERENCE_REJECTED,
        referenceEmail: reference.email,
      })
      MailService.sendRejectedReference(reference, volunteerBeforeUpdate)
    }
  }
}

export async function addBackgroundInfo(
  volunteerId: Ulid,
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
