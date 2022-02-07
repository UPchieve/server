import { Types } from 'mongoose'
import VolunteerModel, { Volunteer } from '../models/Volunteer'
import { getVolunteerById } from '../models/Volunteer/queries'
import { Jobs } from '../worker/jobs'
import { getTimeTutoredForDateRange } from './SessionService'
import { getElapsedAvailabilityForDateRange } from './AvailabilityService'
import { getQuizzesPassedForDateRange } from '../models/UserAction/queries'
import QueueService from './QueueService'
import * as AnalyticsService from './AnalyticsService'
import * as MailService from './MailService'
import * as UserActionCtrl from '../controllers/UserActionCtrl'

import {
  PHOTO_ID_STATUS,
  USER_ACTION,
  REFERENCE_STATUS,
  STATUS,
  EVENTS,
} from '../constants'

export interface HourSummaryStats {
  totalCoachingHours: number
  totalQuizzesPassed: number
  totalElapsedAvailability: number
  totalVolunteerHours: number
}

export async function getHourSummaryStats(
  volunteerId: Types.ObjectId,
  fromDate: Date,
  toDate: Date
): Promise<HourSummaryStats> {
  // TODO: promise.all fails fast, do we want this? - handle error?
  const [
    quizzesPassed,
    elapsedAvailability,
    timeTutoredMS,
  ] = await Promise.all([
    getQuizzesPassedForDateRange(volunteerId, fromDate, toDate),
    getElapsedAvailabilityForDateRange(volunteerId, fromDate, toDate),
    getTimeTutoredForDateRange(volunteerId, fromDate, toDate),
  ])

  const timeTutoredInHours = Number(timeTutoredMS / 3600000).toFixed(2)
  const totalCoachingHours = Number(timeTutoredInHours)
  // Total volunteer hours calculation: [sum of coaching, elapsed avail/10, and quizzes]
  const totalVolunteerHours = Number(
    (
      totalCoachingHours +
      quizzesPassed.length +
      Number(elapsedAvailability) * 0.1
    ).toFixed(2)
  )
  return {
    totalCoachingHours,
    totalQuizzesPassed: quizzesPassed.length,
    totalElapsedAvailability: elapsedAvailability,
    totalVolunteerHours: totalVolunteerHours,
  }
}

export async function queueOnboardingReminderOneEmail(
  volunteerId: Types.ObjectId
): Promise<void> {
  const sevenDaysInMs = 1000 * 60 * 60 * 24 * 7
  await QueueService.add(
    Jobs.EmailOnboardingReminderOne,
    { volunteerId },
    { delay: sevenDaysInMs }
  )
}

export async function queueOnboardingEventEmails(
  volunteerId: Types.ObjectId
): Promise<void> {
  await QueueService.add(
    Jobs.EmailVolunteerQuickTips,
    { volunteerId },
    // process job 5 days after the volunteer is onboarded
    { delay: 1000 * 60 * 60 * 24 * 5 }
  )
}

export async function queueFailedFirstAttemptedQuizEmail(
  category: string,
  email: string,
  firstName: string,
  volunteerId: Types.ObjectId
) {
  await QueueService.add(Jobs.EmailFailedFirstAttemptedQuiz, {
    category,
    email,
    firstName,
    volunteerId,
  })
}

export async function queuePartnerOnboardingEventEmails(
  volunteerId: Types.ObjectId
): Promise<void> {
  await QueueService.add(
    Jobs.EmailPartnerVolunteerLowHoursSelected,
    { volunteerId },
    // process job 10 days after the volunteer is onboarded
    { delay: 1000 * 60 * 60 * 24 * 10 }
  )
  await QueueService.add(
    Jobs.EmailPartnerVolunteerOnlyCollegeCerts,
    { volunteerId },
    // process job 15 days after the volunteer is onboarded
    { delay: 1000 * 60 * 60 * 24 * 15 }
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
    // TODO: repo pattern
    const volunteers = await VolunteerModel.aggregate([
      {
        $match: {
          isApproved: false,
          photoIdS3Key: { $ne: null },
          photoIdStatus: {
            $in: [PHOTO_ID_STATUS.SUBMITTED, PHOTO_ID_STATUS.APPROVED],
          },
          references: { $size: 2 },
          'references.status': {
            $nin: [
              REFERENCE_STATUS.REJECTED,
              REFERENCE_STATUS.UNSENT,
              REFERENCE_STATUS.SENT,
            ],
          },
          occupation: { $ne: null },
          country: { $ne: null },
        },
      },
      {
        $project: {
          firstname: 1,
          lastname: 1,
          email: 1,
          createdAt: 1,
        },
      },
      {
        $lookup: {
          from: 'useractions',
          localField: '_id',
          foreignField: 'user',
          as: 'userAction',
        },
      },
      {
        $unwind: '$userAction',
      },
      {
        $match: {
          'userAction.action': {
            $in: [
              USER_ACTION.ACCOUNT.ADDED_PHOTO_ID,
              USER_ACTION.ACCOUNT.SUBMITTED_REFERENCE_FORM,
              USER_ACTION.ACCOUNT.COMPLETED_BACKGROUND_INFO,
            ],
          },
        },
      },
      {
        $group: {
          _id: '$_id',
          firstname: { $first: '$firstname' },
          lastname: { $first: '$lastname' },
          email: { $first: '$email' },
          // Get the date of their latest user action associated with the approval process
          readyForReviewAt: {
            $max: '$userAction.createdAt',
          },
        },
      },
    ])
      .sort({ readyForReviewAt: 1 })
      .skip(skip)
      .limit(PER_PAGE)

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
  volunteerId: Types.ObjectId,
  photoIdStatus: string,
  referencesStatus: string[]
): Promise<void> {
  const volunteerBeforeUpdate = await getVolunteerById(volunteerId)
  if (!volunteerBeforeUpdate) return

  const hasCompletedBackgroundInfo =
    volunteerBeforeUpdate.occupation &&
    volunteerBeforeUpdate.occupation.length > 0 &&
    volunteerBeforeUpdate.country
      ? true
      : false
  // A volunteer must have the following list items approved before being considered an approved volunteer
  //  1. two references
  //  2. photo id
  const isApproved = getPendingVolunteerApprovalStatus(
    photoIdStatus,
    referencesStatus,
    hasCompletedBackgroundInfo
  )

  const [referenceOneStatus, referenceTwoStatus] = referencesStatus
  const update: PendingVolunteerUpdate = {
    isApproved,
  }
  if (photoIdStatus) update.photoIdStatus = photoIdStatus
  if (referenceOneStatus) update['references.0.status'] = referenceOneStatus
  if (referenceTwoStatus) update['references.1.status'] = referenceTwoStatus
  // TODO: repo pattern
  await VolunteerModel.updateOne({ _id: volunteerId }, update)

  if (
    photoIdStatus === PHOTO_ID_STATUS.REJECTED &&
    volunteerBeforeUpdate.photoIdStatus !== PHOTO_ID_STATUS.REJECTED
  ) {
    await new UserActionCtrl.AccountActionCreator(volunteerId).rejectedPhotoId()
    AnalyticsService.captureEvent(volunteerId, EVENTS.PHOTO_ID_REJECTED, {
      event: EVENTS.PHOTO_ID_REJECTED,
    })
    MailService.sendRejectedPhotoSubmission(volunteerBeforeUpdate)
  }

  const isNewlyApproved = isApproved && !volunteerBeforeUpdate.isApproved
  if (isNewlyApproved) {
    await new UserActionCtrl.AccountActionCreator(volunteerId).accountApproved()
    AnalyticsService.captureEvent(volunteerId, EVENTS.ACCOUNT_APPROVED, {
      event: EVENTS.ACCOUNT_APPROVED,
    })
  }
  if (isNewlyApproved && !volunteerBeforeUpdate.isOnboarded)
    MailService.sendApprovedNotOnboardedEmail(volunteerBeforeUpdate)

  for (let i = 0; i < referencesStatus.length; i++) {
    const reference = volunteerBeforeUpdate.references[i]
    if (
      referencesStatus[i] === REFERENCE_STATUS.REJECTED &&
      reference.status !== REFERENCE_STATUS.REJECTED
    ) {
      await new UserActionCtrl.AccountActionCreator(volunteerId, '', {
        referenceEmail: reference.email,
      }).rejectedReference()
      AnalyticsService.captureEvent(volunteerId, EVENTS.REFERENCE_REJECTED, {
        event: EVENTS.REFERENCE_REJECTED,
        referenceEmail: reference.email,
      })
      MailService.sendRejectedReference(reference, volunteerBeforeUpdate)
    }
  }
}

export async function addBackgroundInfo(
  volunteerId: Types.ObjectId,
  update: Partial<Volunteer>,
  ip: string
): Promise<void> {
  const volunteer = await getVolunteerById(volunteerId)
  if (!volunteer) throw new Error('Volunteer for background info not found')
  const volunteerPartnerOrg = volunteer.volunteerPartnerOrg
  if (volunteerPartnerOrg) {
    update.isApproved = true
    await new UserActionCtrl.AccountActionCreator(volunteerId).accountApproved()
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
      delete update[tField]
  }

  await new UserActionCtrl.AccountActionCreator(
    volunteerId,
    ip
  ).completedBackgroundInfo()
  // TODO: repo pattern
  await VolunteerModel.updateOne({ _id: volunteerId }, update)
}
