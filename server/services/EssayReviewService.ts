import { v4 as uuidv4 } from 'uuid'
import * as cache from '../cache'
import { InputError } from '../models/Errors'
import type { Uuid } from '../types/shared'
import { hoursInMs } from '../utils/time-utils'
import { ISODateString } from '../types/dates'

const essayReviewCacheKey = 'essay-review-submissions'
const essayReviewEmailPreferencesCacheKey = 'essay-review-email-preferences'
const maxEssayLength = 50000
const maxReviewLength = 20000
const maximumTutorReviews = 6
const volunteerEssayReviewWindowHours = hoursInMs(24)

export type EssayReviewStatus = 'pending' | 'reviewed'

export type EssayReviewSubmission = {
  id: string
  userId: Uuid
  studentEmail: string
  studentFirstName?: string
  essay: string
  essayPurpose?: string
  essayPrompt?: string
  additionalContext?: string
  reviewReasons: string[]
  reviewEmail?: string
  wordCount: number
  characterCount: number
  status: EssayReviewStatus
  submittedAt: ISODateString
  reviewedAt?: ISODateString
  reviewedBy?: Uuid
  reviews: EssayReview[]
  finalReviews?: string[]
  emailSentAt?: ISODateString
}

type EssayReview = {
  id: Uuid
  reviewerId: Uuid
  reviewerFirstName?: string
  review: string
  submittedAt: ISODateString
}

export type CreateEssayReviewSubmission = {
  userId: Uuid
  studentEmail: string
  studentFirstName?: string
  essay: string
  essayPurpose?: string
  essayPrompt?: string
  additionalContext?: string
  reviewReasons?: string[]
  reviewEmail: string
}

export type UpdateEssayReviewSubmission = {
  status: EssayReviewStatus
  reviewedBy: Uuid
}

function cleanOptionalText(value?: string): string | undefined {
  return value?.trim() || undefined
}

function countWords(value: string): number {
  const normalizedValue = value.trim()
  return normalizedValue ? normalizedValue.split(/\s+/u).length : 0
}

function parseSubmission(value: string): EssayReviewSubmission {
  const submission = JSON.parse(value) as EssayReviewSubmission
  return {
    ...submission,
    reviews: submission.reviews ?? [],
  }
}

export async function createEssayReviewSubmission(
  payload: CreateEssayReviewSubmission
): Promise<EssayReviewSubmission> {
  const essay = payload.essay.trim()
  if (!essay) {
    throw new InputError('Essay is required')
  }
  if (essay.length > maxEssayLength) {
    throw new InputError(`Essay must be ${maxEssayLength} characters or fewer`)
  }

  const reviewEmail = payload.reviewEmail.trim()
  if (!reviewEmail) {
    throw new InputError('Review email is required')
  }

  const submission: EssayReviewSubmission = {
    id: uuidv4(),
    userId: payload.userId,
    studentEmail: payload.studentEmail.trim(),
    studentFirstName: cleanOptionalText(payload.studentFirstName),
    essay,
    essayPurpose: cleanOptionalText(payload.essayPurpose),
    essayPrompt: cleanOptionalText(payload.essayPrompt),
    additionalContext: cleanOptionalText(payload.additionalContext),
    reviewReasons: payload.reviewReasons ?? [],
    reviewEmail,
    wordCount: countWords(essay),
    characterCount: essay.length,
    status: 'pending',
    submittedAt: new Date().toISOString(),
    reviews: [],
  }

  await cache.hset(
    essayReviewCacheKey,
    submission.id,
    JSON.stringify(submission)
  )
  return submission
}

export async function createTutorEssayReview({
  submissionId,
  reviewerId,
  reviewerFirstName,
  review,
}: {
  submissionId: Uuid
  reviewerId: Uuid
  reviewerFirstName?: string
  review: string
}): Promise<EssayReviewSubmission | null> {
  const submission = await getEssayReviewSubmission(submissionId)
  if (!submission) return null
  if (submission.reviews.some((review) => review.reviewerId === reviewerId)) {
    throw new InputError('You already reviewed this essay')
  }

  const cleanedReview = review.trim()
  if (!cleanedReview) throw new InputError('Review is required')
  if (cleanedReview.length > maxReviewLength) {
    throw new InputError(
      `Review must be ${maxReviewLength} characters or fewer`
    )
  }

  const tutorReview: EssayReview = {
    id: uuidv4(),
    reviewerId,
    reviewerFirstName: cleanOptionalText(reviewerFirstName),
    review: cleanedReview,
    submittedAt: new Date().toISOString(),
  }
  const updatedSubmission = {
    ...submission,
    reviews: [...submission.reviews, tutorReview],
  }
  await cache.hset(
    essayReviewCacheKey,
    submissionId,
    JSON.stringify(updatedSubmission)
  )
  return updatedSubmission
}

export async function getEssayReviewEmailPreference(
  volunteerId: Uuid
): Promise<boolean> {
  return (
    (await cache.hget(essayReviewEmailPreferencesCacheKey, volunteerId)) ===
    'true'
  )
}

export async function setEssayReviewEmailPreference(
  volunteerId: Uuid,
  optedIn: boolean
): Promise<void> {
  await cache.hset(
    essayReviewEmailPreferencesCacheKey,
    volunteerId,
    String(optedIn)
  )
}

export async function getEssayReviewSubmission(
  submissionId: Uuid
): Promise<EssayReviewSubmission | undefined> {
  const cachedSubmission = await cache.hget(essayReviewCacheKey, submissionId)
  return cachedSubmission ? parseSubmission(cachedSubmission) : undefined
}

export async function getEssayReviewSubmissions(): Promise<
  EssayReviewSubmission[]
> {
  const cachedSubmissions = await cache.hgetall(essayReviewCacheKey)

  return Object.values(cachedSubmissions)
    .map(parseSubmission)
    .sort((firstSubmission, secondSubmission) => {
      if (firstSubmission.status !== secondSubmission.status) {
        return firstSubmission.status === 'pending' ? -1 : 1
      }

      return (
        new Date(firstSubmission.submittedAt).getTime() -
        new Date(secondSubmission.submittedAt).getTime()
      )
    })
}

export async function getAvailableEssayReviewSubmissions(): Promise<
  EssayReviewSubmission[]
> {
  const submissions = await getEssayReviewSubmissions()
  const avaibleSubmissionsForTutor = submissions.filter(
    isEssayAvailableForVolunteer
  )
  return avaibleSubmissionsForTutor
}

function isEssayAvailableForVolunteer(
  submission: EssayReviewSubmission
): boolean {
  const cutoff = Date.now() - volunteerEssayReviewWindowHours
  const submittedAt = new Date(submission.submittedAt).getTime()
  return (
    submission.status === 'pending' &&
    submittedAt >= cutoff &&
    submission.reviews.length < maximumTutorReviews
  )
}

export async function updateEssayReviewSubmission({
  submissionId,
  status,
  reviewedBy,
}: UpdateEssayReviewSubmission & {
  submissionId: Uuid
}): Promise<EssayReviewSubmission | undefined> {
  const submission = await getEssayReviewSubmission(submissionId)
  if (!submission) return undefined

  const updatedSubmission: EssayReviewSubmission = {
    ...submission,
    status,
    reviewedAt: status === 'reviewed' ? new Date().toISOString() : undefined,
    reviewedBy: status === 'reviewed' ? reviewedBy : undefined,
  }

  await cache.hset(
    essayReviewCacheKey,
    submissionId,
    JSON.stringify(updatedSubmission)
  )

  return updatedSubmission
}
