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
import { MessageForFrontend, Session, UserSessions } from '../../models/Session'
import {
  ProgressReport,
  ProgressReportDetail,
  ProgressReportSummary,
  ProgressReportConcept,
} from '../../services/ProgressReportsService'
import {
  ProgressReportConceptRow,
  ProgressReportStatuses,
  ProgressReportSummaryRow,
} from '../../models/ProgressReports/'

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
    phoneVerified: false,
    smsConsent: false,
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

// TODO: There is weird behavior with buildUserRow, it's returning the same user data across test files.
//       Noticing this behavior with other build functions when calling `insertSingleRow`
export function buildUserRow(overrides: Partial<User> = {}): User {
  return {
    id: getDbUlid(),
    verified: true,
    emailVerified: true,
    phoneVerified: false,
    email: getEmail().toLowerCase(),
    phone: getPhoneNumber(),
    smsConsent: false,
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

export type SessionRow = {
  id: Ulid
  studentId: Ulid
  subjectId: number
  volunteerId?: Ulid
  hasWhiteboardDoc: boolean
  quillDoc?: string
  volunteerJoinedAt?: Date
  endedAt?: Date
  endedByRoleId?: number
  reviewed: boolean
  toReview: boolean
  studentBanned: boolean
  timeTutored: number
  createdAt: Date
  updatedAt: Date
  mongoId?: string
}

export async function buildSessionRow(
  overrides: Partial<SessionRow> & { studentId: Ulid },
  client?: Pool
): Promise<SessionRow> {
  return {
    id: getDbUlid(),
    subjectId: client ? await getSubjectIdByName('algebraOne', client) : 1,
    hasWhiteboardDoc: true,
    reviewed: false,
    toReview: false,
    studentBanned: false,
    timeTutored: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

export async function buildSession(
  overrides: Partial<Session> & { studentId: Ulid }
): Promise<Session> {
  return {
    id: getDbUlid(),
    hasWhiteboardDoc: true,
    reviewed: false,
    toReview: false,
    timeTutored: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    studentBanned: false,
    topic: 'math',
    subject: 'algebraOne',
    reported: false,
    flags: [],
    subjectDisplayName: 'Algebra 1',
    toolType: 'whiteboard',
    ...overrides,
  }
}

export const buildUserSession = (
  overrides: Partial<UserSessions> = {}
): UserSessions => {
  const session = {
    id: getDbUlid(),
    subjectName: 'algrebraOne',
    topicName: 'math',
    studentId: getDbUlid(),
    createdAt: new Date(),
    ...overrides,
  }
  return session
}

export const buildMessageForFrontend = (
  overrides: Partial<MessageForFrontend> = {}
): MessageForFrontend => {
  const message = {
    user: getDbUlid(),
    contents: faker.lorem.sentence(),
    createdAt: new Date(),
    ...overrides,
  }
  return message
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
    name: 'Approved School',
    state: 'NY',
    isAdminApproved: true,
    isPartner: false,
    city: 'Brooklyn',
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

export const buildProgressReportDetails = (
  overrides: Partial<ProgressReportDetail> = {}
): ProgressReportDetail => {
  const detail: ProgressReportDetail = {
    id: getUuid(),
    content: faker.lorem.sentence(),
    focusArea: 'practiceArea',
    infoType: 'recommendation',
    ...overrides,
  }
  return detail
}

export const buildProgressReportConcept = (
  overrides: Partial<ProgressReportConcept> = {}
): ProgressReportConcept => {
  const concept: ProgressReportConcept = {
    id: getUuid(),
    name: faker.lorem.word(),
    description: faker.lorem.sentence(),
    grade: 100,
    details: [],
    createdAt: new Date(),
    reportId: getUuid(),
    ...overrides,
  }
  return concept
}

export const buildProgressReportSummary = (
  overrides: Partial<ProgressReportSummary> = {}
): ProgressReportSummary => {
  const summary = {
    id: getUuid(),
    summary: faker.lorem.sentence(),
    overallGrade: 100,
    details: [],
    createdAt: new Date(),
    reportId: getUuid(),
    ...overrides,
  }
  return summary
}

export const buildProgressReportSummaryRow = (
  overrides: Partial<ProgressReportSummaryRow> = {}
): ProgressReportSummaryRow => {
  const summaryRow = {
    id: getUuid(),
    summary: faker.lorem.sentence(),
    overallGrade: 100,
    detailId: getUuid(),
    content: faker.lorem.sentence(),
    focusArea: 'strength',
    infoType: 'reason',
    createdAt: new Date(),
    reportId: getUuid(),
    ...overrides,
  }
  return summaryRow
}

export const buildProgressReportConceptRow = (
  overrides: Partial<ProgressReportConceptRow> = {}
): ProgressReportConceptRow => {
  const conceptRow = {
    id: getUuid(),
    name: faker.lorem.word(),
    description: faker.lorem.sentence(),
    grade: 100,
    detailId: getUuid(),
    content: faker.lorem.sentence(),
    focusArea: 'strength',
    infoType: 'reason',
    createdAt: new Date(),
    reportId: getUuid(),
    ...overrides,
  }
  return conceptRow
}

export const buildProgressReport = (
  overrides: Partial<ProgressReport> = {}
): ProgressReport => {
  const report = {
    id: getUuid(),
    status: 'complete' as ProgressReportStatuses,
    summary: buildProgressReportSummary(),
    concepts: [buildProgressReportConcept()],
    ...overrides,
  }
  return report
}
