import { Ulid, Uuid } from '../models/pgUtils'
import * as NTHSApplicationRepo from '../models/NTHSApplication'
import * as NTHSGroupsRepo from '../models/NTHSGroups'
import type {
  NTHSApplicationResponses,
  NTHSCandidateApplication,
  NTHSUnlistedSchool,
} from '../models/NTHSApplication'
import { NTHSCandidateApplicationStatus } from '../models/NTHSGroups'
import { VolunteerOccupations } from '../models/Volunteer'
import * as UsersGradeLevelsRepo from '../models/UsersGradeLevels'
import * as UsersSchoolsRepo from '../models/UsersSchools'
import { getSchoolById } from '../models/School'
import { GRADES, USER_BAN_TYPES } from '../constants/user'
import { US_STATE_CODES } from '../constants/geography'
import { isHighSchoolGrade } from '../utils/grade-levels'
import { getRoClient, runInTransaction, TransactionClient } from '../db'
import { InputError, NTHSApplicationExistsError } from '../models/Errors'
import { CaughtError } from '../router/res-error'
import logger from '../logger'
import {
  sendNTHSCandidateApplicationApproved,
  sendNTHSCandidateApplicationDenied,
} from './MailService'
import { getUserContactInfo } from './UserService'

export const CURRENT_NTHS_APPLICATION_FORM_VERSION = 1

const MAX_ANSWER_LENGTH = 2000

type NTHSFormField = {
  key: string
  type: 'text' | 'attestation'
  required: boolean
}

// Keyed by form_version so an old row stays readable. A key's meaning must
// never change; a changed question needs a new key and a new version.
const NTHS_APPLICATION_FORMS: Record<number, NTHSFormField[]> = {
  1: [
    { key: 'whyStartChapter', type: 'text', required: true },
    { key: 'leadershipExperience', type: 'text', required: true },
    { key: 'recruitmentIdea', type: 'text', required: true },
    { key: 'motivatingCoaches', type: 'text', required: true },
    { key: 'commitWeeklyHours', type: 'attestation', required: true },
    { key: 'commitFoundingPresident', type: 'attestation', required: true },
    { key: 'commitMonthlyMeetings', type: 'attestation', required: true },
    {
      key: 'commitRecruitHighSchoolersOnly',
      type: 'attestation',
      required: true,
    },
    { key: 'coPresidentEmail', type: 'text', required: false },
    { key: 'howDidYouHear', type: 'text', required: false },
  ],
}

function validateResponses(
  formVersion: number,
  responses: NTHSApplicationResponses
): void {
  const fields = NTHS_APPLICATION_FORMS[formVersion]
  if (!fields)
    throw new InputError(`Unknown NTHS application form version ${formVersion}`)

  const unknownKeys = Object.keys(responses).filter(
    (key) => !fields.some((field) => field.key === key)
  )
  if (unknownKeys.length)
    throw new InputError(
      `Unexpected answers on the NTHS application: ${unknownKeys.join(', ')}`
    )

  for (const field of fields) {
    const answer = responses[field.key]
    // An absent key has to read as unanswered. Treating it as a falsy "no"
    // would let an application through without its attestations.
    if (answer === undefined || answer === null || answer === '') {
      if (field.required)
        throw new InputError(
          `The NTHS application needs an answer for ${field.key}`
        )
      continue
    }

    if (field.type === 'attestation') {
      if (answer !== true)
        throw new InputError(`${field.key} has to be agreed to`)
      continue
    }

    if (typeof answer !== 'string')
      throw new InputError(`${field.key} has to be text`)
    if (answer.length > MAX_ANSWER_LENGTH)
      throw new InputError(
        `${field.key} is longer than ${MAX_ANSWER_LENGTH} characters`
      )
  }
}

const MAX_SCHOOL_FIELD_LENGTH = 200

const UNLISTED_SCHOOL_FIELDS = ['name', 'city', 'state', 'website'] as const

// Applicants type bare domains, so a missing scheme is assumed rather than
// rejected. Staff open this straight from the admin panel, which is why any
// scheme other than http(s) is turned away instead of normalized.
function normalizeSchoolWebsite(value: string): string {
  const candidate = value.includes('://') ? value : `https://${value}`
  let url: URL
  try {
    url = new URL(candidate)
  } catch {
    throw new InputError('The school website is not a valid web address')
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:')
    throw new InputError(
      'The school website has to be an http or https address'
    )
  if (!url.hostname.includes('.'))
    throw new InputError('The school website is not a valid web address')
  return url.toString()
}

function requiredSchoolText(
  details: Record<string, unknown>,
  key: 'name' | 'city'
): string {
  const value = details[key]
  if (typeof value !== 'string' || !value.trim())
    throw new InputError(`The school details need a ${key}`)
  if (value.length > MAX_SCHOOL_FIELD_LENGTH)
    throw new InputError(
      `The school ${key} is longer than ${MAX_SCHOOL_FIELD_LENGTH} characters`
    )
  return value.trim()
}

// Name, city, and state are the filters getFilteredSchools takes, so together
// they narrow NCES to the handful of rows staff pick the real school from.
function validateUnlistedSchool(value: unknown): NTHSUnlistedSchool {
  if (typeof value !== 'object' || value === null || Array.isArray(value))
    throw new InputError('The school details have to be an object')

  const details = value as Record<string, unknown>
  const unknownKeys = Object.keys(details).filter(
    (key) => !UNLISTED_SCHOOL_FIELDS.includes(key as never)
  )
  if (unknownKeys.length)
    throw new InputError(
      `Unexpected school details: ${unknownKeys.join(', ')}. International schools are not supported yet.`
    )

  const state = details.state
  if (typeof state !== 'string' || !US_STATE_CODES.has(state.toUpperCase()))
    throw new InputError('The school details need a US state')

  const website = details.website
  if (website !== undefined && website !== null && website !== '') {
    if (typeof website !== 'string')
      throw new InputError('The school website has to be text')
    if (website.length > MAX_SCHOOL_FIELD_LENGTH)
      throw new InputError(
        `The school website is longer than ${MAX_SCHOOL_FIELD_LENGTH} characters`
      )
  }

  return {
    name: requiredSchoolText(details, 'name'),
    city: requiredSchoolText(details, 'city'),
    state: state.toUpperCase(),
    website:
      typeof website === 'string' && website.trim()
        ? normalizeSchoolWebsite(website.trim())
        : undefined,
  }
}

export enum NTHSApplicationIneligibilityReason {
  notAVolunteer = 'notAVolunteer',
  notAHighSchoolStudent = 'notAHighSchoolStudent',
  notOnboarded = 'notOnboarded',
  notApproved = 'notApproved',
  banned = 'banned',
  noCompletedSessions = 'noCompletedSessions',
}

export type NTHSApplicationEligibility = {
  eligible: boolean
  reasons: NTHSApplicationIneligibilityReason[]
  currentGradeName?: string
}

// The reasons stay in the log. Returning them would tell a shadow-banned user
// they are shadow banned.
export class NTHSApplicationNotEligibleError extends CaughtError {
  readonly httpStatus = 403
  readonly clientMessage =
    'You are not currently eligible to apply to start an NTHS chapter'
}

// TODO: block when the applicant's school already has an active chapter. The
// rule needs an active-versus-deactivated distinction the chapter statuses
// cannot express yet, so submissions are allowed through and handled manually.
export async function getApplicationEligibility(
  userId: Ulid,
  tc: TransactionClient = getRoClient()
): Promise<NTHSApplicationEligibility> {
  const facts = await NTHSApplicationRepo.getCandidateApplicationEligibility(
    {
      userId,
      highSchoolOccupation: VolunteerOccupations.HIGH_SCHOOL_STUDENT,
    },
    tc
  )

  if (!facts)
    return {
      eligible: false,
      reasons: [NTHSApplicationIneligibilityReason.notAVolunteer],
    }

  const reasons: NTHSApplicationIneligibilityReason[] = []
  if (!facts.isHighSchoolStudent)
    reasons.push(NTHSApplicationIneligibilityReason.notAHighSchoolStudent)
  if (!facts.onboarded)
    reasons.push(NTHSApplicationIneligibilityReason.notOnboarded)
  if (!facts.approved)
    reasons.push(NTHSApplicationIneligibilityReason.notApproved)
  if (
    facts.banType === USER_BAN_TYPES.COMPLETE ||
    facts.banType === USER_BAN_TYPES.SHADOW
  )
    reasons.push(NTHSApplicationIneligibilityReason.banned)
  if (!facts.hasCompletedSession)
    reasons.push(NTHSApplicationIneligibilityReason.noCompletedSessions)

  return {
    eligible: reasons.length === 0,
    reasons,
    currentGradeName: facts.currentGradeName,
  }
}

export async function submitCandidateApplication({
  userId,
  schoolId,
  unlistedSchool,
  gradeLevel,
  responses,
}: {
  userId: Ulid
  schoolId?: Uuid
  unlistedSchool?: unknown
  gradeLevel: GRADES
  responses: NTHSApplicationResponses
}): Promise<NTHSCandidateApplication> {
  if (!isHighSchoolGrade(gradeLevel))
    throw new InputError(
      `Only high school students can apply for an NTHS chapter, got grade ${gradeLevel}`
    )

  // A row with neither holds neither partial index, so it is invisible to dedup
  // and reaches staff with no school to review. A matched school wins outright,
  // since its details are already the authoritative ones.
  const schoolDetails =
    !schoolId && unlistedSchool !== undefined && unlistedSchool !== null
      ? validateUnlistedSchool(unlistedSchool)
      : undefined
  if (!schoolId && !schoolDetails)
    throw new InputError('An application needs a school')

  validateResponses(CURRENT_NTHS_APPLICATION_FORM_VERSION, responses)

  return await runInTransaction(async (tc: TransactionClient) => {
    // Read inside the transaction so eligibility comes from the primary. The
    // default read client is a replica, where lag can approve an applicant who
    // was just banned.
    const { eligible, reasons } = await getApplicationEligibility(userId, tc)
    if (!eligible)
      throw new NTHSApplicationNotEligibleError(
        'Ineligible NTHS chapter application',
        { userId, reasons }
      )

    // Nothing else stops a resubmission once an application is decided: the
    // pending index does not cover an approved row, so the new 'applied' row
    // outranks the approval by created_at and reports the applicant back to
    // themselves as pending, taking away the chapter they had just earned.
    // Someone still holding an unused approval is in that window; someone
    // already in a chapter has used theirs. A denial leaves activated_at null,
    // so reapplying after one stays open.
    const [groups, activated] = await Promise.all([
      NTHSGroupsRepo.getGroupsByUser(userId, tc),
      NTHSApplicationRepo.hasActivatedCandidateApplication(userId, tc),
    ])
    if (groups.length || activated)
      throw new NTHSApplicationExistsError(
        'You have already been approved to start an NTHS chapter'
      )

    // asUuid checks the shape only, so an id that is well formed but not a real
    // school would otherwise reach the users_schools and application foreign
    // keys, and an unmapped Repo error sends the raw Postgres text to the
    // client. Checked before either write so one lookup covers both.
    if (schoolId && !(await getSchoolById(schoolId, tc)))
      throw new InputError('That school could not be found')

    // upsertUserGradeLevel restamps updated_at, and that timestamp is the
    // anchor current_grade_levels advances from, so this has to be the grade
    // the applicant just confirmed.
    await UsersGradeLevelsRepo.upsertUserGradeLevel(userId, gradeLevel, tc)
    if (schoolId)
      await UsersSchoolsRepo.upsertUsersSchool(
        userId,
        schoolId,
        'student_at_school',
        tc
      )

    return await NTHSApplicationRepo.createCandidateApplication(
      {
        userId,
        schoolId,
        unlistedSchool: schoolDetails,
        formVersion: CURRENT_NTHS_APPLICATION_FORM_VERSION,
        responses,
      },
      tc
    )
  })
}

export async function getLatestCandidateApplication(
  userId: Ulid
): Promise<NTHSCandidateApplication | undefined> {
  return await NTHSApplicationRepo.getLatestCandidateApplication(userId)
}

export async function decideCandidateApplication({
  userId,
  status,
  deniedNotes,
}: {
  userId: Ulid
  status: NTHSCandidateApplicationStatus
  deniedNotes?: string
}): Promise<NTHSCandidateApplication> {
  if (status === NTHSCandidateApplicationStatus.applied)
    throw new InputError(
      'An application can only be decided as approved or denied'
    )

  // Two CHECK constraints require denied_notes to be present on a denial and
  // absent otherwise; without these guards either mistake reaches the client as
  // a 500.
  const isDenial = status === NTHSCandidateApplicationStatus.denied
  if (isDenial && !deniedNotes?.trim())
    throw new InputError('A denied application needs a reason')

  const application = await NTHSApplicationRepo.decideCandidateApplication({
    userId,
    status,
    deniedNotes: isDenial ? deniedNotes : undefined,
  })
  if (!application)
    throw new InputError(
      `No NTHS application awaiting a decision for user ${userId}`
    )

  const contactInfo = await getUserContactInfo(application.userId)
  if (contactInfo) {
    const recipient = [
      { firstName: contactInfo.firstName, email: contactInfo.email },
    ]
    if (application.status === NTHSCandidateApplicationStatus.approved)
      await sendNTHSCandidateApplicationApproved(recipient)
    if (application.status === NTHSCandidateApplicationStatus.denied)
      await sendNTHSCandidateApplicationDenied(recipient)
  } else {
    logger.warn(
      { userId: application.userId, status },
      'Decided an NTHS application without notifying the applicant'
    )
  }

  return application
}
