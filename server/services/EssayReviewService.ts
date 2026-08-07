import { v4 as uuidv4 } from 'uuid'
import * as cache from '../cache'
import { InputError } from '../models/Errors'
import type { Uuid } from '../types/shared'

const essayReviewCacheKey = 'essay-review-submissions'
const maxEssayLength = 50000

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
  wordCount: number
  characterCount: number
  status: EssayReviewStatus
  submittedAt: string
  reviewedAt?: string
  reviewedBy?: Uuid
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
  return JSON.parse(value) as EssayReviewSubmission
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
    wordCount: countWords(essay),
    characterCount: essay.length,
    status: 'pending',
    submittedAt: new Date().toISOString(),
  }

  await cache.hset(
    essayReviewCacheKey,
    submission.id,
    JSON.stringify(submission)
  )
  return submission
}

export async function getEssayReviewSubmission(
  submissionId: string
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

export async function updateEssayReviewSubmission({
  submissionId,
  status,
  reviewedBy,
}: UpdateEssayReviewSubmission & {
  submissionId: string
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
