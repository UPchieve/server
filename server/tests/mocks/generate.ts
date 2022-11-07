import { getDbUlid, getUuid, Ulid } from '../../models/pgUtils'
import { AssistmentsData } from '../../models/AssistmentsData'
import { Student } from '../../models/Student'
import { Availability } from '../../models/Availability'
import { User, UserContactInfo } from '../../models/User'
import faker from 'faker'
import _ from 'lodash'
import createNewAvailability from '../../utils/create-new-availability'
import { VolunteerPartnerOrg } from '../../models/VolunteerPartnerOrg'
import { StudentPartnerOrg } from '../../models/StudentPartnerOrg'
import { School } from '../../models/School'
import { GRADES } from '../../constants'
import { AppStudent, AppUser, AppVolunteer } from '../types'
import {
  LegacySurvey,
  SurveyQuestionDefinition,
  PresessionSurveyResponseData,
  StudentPresessionSurveyResponse,
  UserSurvey,
  UserSurveySubmission,
} from '../../models/Survey'
import { Pool } from 'pg'
import { getSubjectIdByName } from '../db-utils'

export function getEmail(): string {
  return faker.internet.email().toLowerCase()
}
export function getPhoneNumber(): string {
  const phoneNumber = faker.phone.phoneNumberFormat(0)
  const formattedPhoneNumber = phoneNumber.replace(/-/g, '')
  return `+1${formattedPhoneNumber}`
}
export const getFirstName = faker.name.firstName
export const getLastName = faker.name.lastName
export const getIpAddress = faker.internet.ip

export const buildAvailability = (overrides = {}): Availability => {
  const availability = createNewAvailability()

  const mergedAvailability = _.merge(availability, overrides)

  return mergedAvailability
}

export function buildUserContactInfo(
  overrides: Partial<UserContactInfo> = {}
): UserContactInfo {
  return {
    id: getDbUlid(),
    email: getEmail(),
    phone: getPhoneNumber(),
    firstName: getFirstName(),
    isVolunteer: false,
    isAdmin: false,
    volunteerPartnerOrg: undefined,
    studentPartnerOrg: undefined,
    lastActivityAt: new Date(),
    banned: false,
    deactivated: false,
    ...overrides,
  }
}

export function buildUserRow(overrides: Partial<User> = {}): User {
  return {
    id: getDbUlid(),
    verified: true,
    emailVerified: true,
    phoneVerified: false,
    email: getEmail().toLowerCase(),
    phone: getPhoneNumber(),
    password: 'Password123',
    firstName: getFirstName(),
    lastName: getLastName(),
    banned: false,
    testUser: false,
    deactivated: false,
    referralCode: 'ABC',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

export function buildUser(overrides: Partial<AppUser> = {}): AppUser {
  const userRow = buildUserRow()
  return {
    ...userRow,
    firstname: userRow.firstName,
    lastname: userRow.lastName,
    isBanned: userRow.banned,
    isDeactivated: userRow.deactivated,
    isTestUser: userRow.testUser,
    isAdmin: false,
    isVolunteer: false,
    ...overrides,
  }
}

export function buildStudentProfile(overrides: Partial<Student> = {}): Student {
  const userId = buildUser().id
  return {
    userId,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

export function buildStudent(overrides: Partial<AppStudent> = {}): AppStudent {
  const student = {
    ...buildUser({ isVolunteer: false }),
    zipCode: '11201',
    schoolId: getDbUlid(),
    currentGrade: GRADES.EIGHTH,
    signupSourceId: 1,
    studentPartnerOrg: '',
    studentPartnerSite: '',
    partnerUserId: '',
    college: 'UPchieve University',
    ...overrides,
  }

  return student
}

export function buildVolunteer(
  overrides: Partial<AppVolunteer> = {}
): AppVolunteer {
  return {
    ...buildUser({ isVolunteer: true }),
    volunteerPartnerOrg: '',
    phone: getPhoneNumber(),

    ...overrides,
  }
}

export function buildStudentRow(overrides: Partial<Student> = {}): Student {
  const userId = buildUserRow().id
  return {
    userId,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

type SessionRow = any
export async function buildSession(
  overrides: Partial<SessionRow> & { studentId: Ulid },
  client?: Pool
): Promise<SessionRow> {
  return {
    id: getDbUlid(),
    subjectId: client ? await getSubjectIdByName('algebraOne', client) : 1,
    hasWhiteboardDoc: true,
    reviewed: false,
    toReview: false,
    timeTutored: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

export function buildAssistmentsData(
  overrides: Partial<AssistmentsData> & { sessionId: Ulid }
): AssistmentsData {
  return {
    id: getDbUlid(),
    problemId: Math.floor(Math.random() * 100),
    assignmentId: getUuid(),
    studentId: getUuid(),
    sent: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

export function buildVolunteerPartnerOrg(
  overrides: Partial<VolunteerPartnerOrg> = {}
): VolunteerPartnerOrg {
  return {
    key: 'health-co',
    name: 'Health Co',
    receiveWeeklyHourSummaryEmail: false,
    domains: [],
    deactivated: false,
    ...overrides,
  }
}

export function buildStudentPartnerOrg(
  overrides: Partial<StudentPartnerOrg> = {}
): StudentPartnerOrg {
  return {
    key: 'school-helpers',
    name: 'School Helpers',
    highSchoolSignup: false,
    schoolSignupRequired: false,
    collegeSignup: false,
    signupCode: 'SCHOOLHELPERS',
    sites: [],
    isSchool: false,
    deactivated: false,
    ...overrides,
  }
}

export function buildSchool(overrides: Partial<School> = {}): School {
  return {
    id: getDbUlid(),
    nameStored: 'Approved School',
    stateStored: 'NY',
    isApproved: true,
    isPartner: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    cityNameStored: 'Brooklyn',
    ...overrides,
  }
}

export function buildPresessionLegacySurveyResponse(
  overrides: Partial<PresessionSurveyResponseData> = {}
): PresessionSurveyResponseData {
  return {
    'primary-goal': {
      answer: 'To finish my homework.',
    },
    'topic-understanding': {
      answer: 2,
    },
    ...overrides,
  }
}

export const buildPresessionSurveyLegacy = (
  overrides: Partial<LegacySurvey> = {}
): LegacySurvey => {
  const survey = {
    id: getDbUlid(),
    userId: getDbUlid(),
    sessionId: getDbUlid(),
    responseData: buildPresessionLegacySurveyResponse(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }

  return survey
}

export const buildPresessionSurvey = (
  overrides: Partial<SurveyQuestionDefinition> = {}
): SurveyQuestionDefinition => {
  const survey = {
    questionId: '1',
    questionText: "What is your primary goal for today's session?",
    displayPriority: 1,
    questionType: 'multiple choice',
    responses: [
      {
        responseId: 1,
        responseText: 'Complete a homework assignment',
        responseDisplayPriority: 1,
        responseDisplayImage: '',
      },
    ],
    ...overrides,
  }

  return survey
}

export const buildPresessionSurveyResponse = (
  overrides: Partial<StudentPresessionSurveyResponse> = {}
): StudentPresessionSurveyResponse => {
  const survey = {
    displayLabel: 'Their goal:',
    response: 'Complete a homework assignment',
    score: 1,
    displayOrder: 10,
    ...overrides,
  }

  return survey
}

export const buildUserSurveySubmission = (
  overrides: Partial<UserSurveySubmission> = {}
): UserSurveySubmission => {
  const survey = {
    userSurveyId: getDbUlid(),
    questionId: 1,
    responseChoiceId: 2,
    openResponse: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }

  return survey
}

export const buildUserSurvey = (
  overrides: Partial<UserSurvey> = {}
): UserSurvey => {
  const survey = {
    id: getDbUlid(),
    userId: getDbUlid(),
    sessionId: getDbUlid(),
    surveyId: 1,
    surveyTypeId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }

  return survey
}
