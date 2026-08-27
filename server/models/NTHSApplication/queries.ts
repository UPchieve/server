import { getClient, getRoClient, TransactionClient } from '../../db'
import {
  NTHSApplicationExistsError,
  RepoCreateError,
  RepoReadError,
  RepoUpdateError,
} from '../Errors'
import { makeSomeRequired, Ulid, Uuid } from '../pgUtils'
import * as pgQueries from './pg.queries'
import type {
  NTHSApplicationEligibilityFacts,
  NTHSApplicationResponses,
  NTHSCandidateApplication,
  NTHSUnlistedSchool,
  NTHSCandidate,
} from './types'
import { NTHSCandidateApplicationStatus } from '../NTHSGroups/types'
import { USER_ACTION } from '../../constants/user'

const NON_NULL_COLUMNS = [
  'id',
  'userId',
  'status',
  'formVersion',
  'responses',
  'createdAt',
] as const

const UNIQUE_VIOLATION = '23505'
const PER_USER_INDEX = 'nths_one_pending_application_per_user'

function asApplication(
  row:
    | pgQueries.ICreateCandidateApplicationResult
    | pgQueries.IDecideCandidateApplicationResult
    | pgQueries.ILatestCandidateApplicationResult
): NTHSCandidateApplication {
  const application = makeSomeRequired(row, [...NON_NULL_COLUMNS])
  return {
    ...application,
    status: application.status as NTHSCandidateApplicationStatus,
    responses: application.responses as NTHSApplicationResponses,
    unlistedSchool: application.unlistedSchool as
      | NTHSUnlistedSchool
      | undefined,
  }
}

function asApplicant(
  row: pgQueries.INeedsApplicationStatusEmailResult
): NTHSCandidate {
  const applicant = makeSomeRequired(row, ['email', 'userId', 'firstName'])
  return {
    ...applicant,
  }
}

// Only the applicant's own pending application collides. Several candidates from
// one school may apply at once; one chapter per school is enforced on
// nths_group_school_affiliation instead.
function asExistsError(err: unknown): NTHSApplicationExistsError | undefined {
  const { code, constraint } = (err ?? {}) as {
    code?: string
    constraint?: string
  }
  if (code !== UNIQUE_VIOLATION) return
  if (constraint === PER_USER_INDEX)
    return new NTHSApplicationExistsError(
      'You already have an application being reviewed'
    )
}

export async function getLatestCandidateApplicationStatus(
  userId: Ulid,
  tc: TransactionClient = getRoClient()
): Promise<NTHSCandidateApplicationStatus | undefined> {
  try {
    const results = await pgQueries.latestCandidateApplicationStatus.run(
      { userId },
      tc
    )
    return results[0]?.status as NTHSCandidateApplicationStatus | undefined
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getCandidateApplicationEligibility(
  {
    userId,
    highSchoolOccupation,
  }: { userId: Ulid; highSchoolOccupation: string },
  tc: TransactionClient = getRoClient()
): Promise<NTHSApplicationEligibilityFacts | undefined> {
  try {
    const results = await pgQueries.candidateApplicationEligibility.run(
      { userId, highSchoolOccupation },
      tc
    )
    if (!results.length) return
    const row = makeSomeRequired(results[0], [
      'onboarded',
      'approved',
      'isHighSchoolStudent',
      'hasCompletedSession',
    ])
    return {
      banType: row.banType,
      onboarded: row.onboarded,
      approved: row.approved,
      isHighSchoolStudent: !!row.isHighSchoolStudent,
      hasCompletedSession: !!row.hasCompletedSession,
      currentGradeName: row.currentGradeName,
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getActivatedCandidateApplication(
  userId: Ulid,
  tc: TransactionClient = getRoClient()
): Promise<{ id: number; schoolId?: Uuid } | undefined> {
  try {
    const results = await pgQueries.activatedCandidateApplication.run(
      { userId },
      tc
    )
    if (!results.length) return
    return makeSomeRequired(results[0], ['id'])
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function isSchoolClaimedForNTHSChapter(
  {
    schoolId,
    userId,
  }: {
    schoolId: Uuid
    userId: Ulid
  },
  tc: TransactionClient = getRoClient()
): Promise<boolean> {
  try {
    const results = await pgQueries.isSchoolClaimedForNthsChapter.run(
      { schoolId, userId },
      tc
    )
    return !!results[0]?.claimed
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getLatestCandidateApplication(
  userId: Ulid,
  tc: TransactionClient = getRoClient()
): Promise<NTHSCandidateApplication | undefined> {
  try {
    const results = await pgQueries.latestCandidateApplication.run(
      { userId },
      tc
    )
    if (!results.length) return
    return asApplication(results[0])
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function createCandidateApplication(
  {
    userId,
    schoolId,
    unlistedSchool,
    formVersion,
    responses,
  }: {
    userId: Ulid
    schoolId?: Uuid
    unlistedSchool?: NTHSUnlistedSchool
    formVersion: number
    responses: NTHSApplicationResponses
  },
  tc: TransactionClient = getClient()
): Promise<NTHSCandidateApplication> {
  try {
    const results = await pgQueries.createCandidateApplication.run(
      {
        userId,
        schoolId,
        unlistedSchool: unlistedSchool as pgQueries.Json | undefined,
        formVersion,
        responses: responses as pgQueries.Json,
      },
      tc
    )
    if (!results.length)
      throw new Error('Insert of NTHS candidate application returned no row')
    return asApplication(results[0])
  } catch (err) {
    const exists = asExistsError(err)
    if (exists) throw exists
    throw new RepoCreateError(err)
  }
}

export async function decideCandidateApplication(
  {
    userId,
    status,
    deniedNotes,
  }: {
    userId: Ulid
    status: NTHSCandidateApplicationStatus
    deniedNotes?: string
  },
  tc: TransactionClient = getClient()
): Promise<NTHSCandidateApplication | undefined> {
  try {
    const results = await pgQueries.decideCandidateApplication.run(
      { userId, status, deniedNotes },
      tc
    )
    if (!results.length) return
    return asApplication(results[0])
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export async function needsDenialEmail(
  cohortStartDate: Date,
  cohortEndDate: Date,
  templateId: string,
  tc: TransactionClient = getClient()
) {
  try {
    const results = await pgQueries.needsApplicationStatusEmail.run(
      {
        application_status: 'denied',
        cohort_start: cohortStartDate,
        cohort_end: cohortEndDate,
        email_template_id: templateId,
      },
      tc
    )
    if (!results.length) {
      return []
    }
    return results.map((v) => asApplicant(v))
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function needsApprovalEmail(
  cohortStartDate: Date,
  cohortEndDate: Date,
  templateId: string,
  tc: TransactionClient = getClient()
) {
  try {
    const results = await pgQueries.needsApplicationStatusEmail.run(
      {
        application_status: 'approved',
        cohort_start: cohortStartDate,
        cohort_end: cohortEndDate,
        email_template_id: templateId,
      },
      tc
    )
    if (!results.length) {
      return []
    }
    return results.map((v) => asApplicant(v))
  } catch (err) {
    throw new RepoReadError(err)
  }
}
