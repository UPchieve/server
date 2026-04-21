import { getDbUlid, getUuid, Ulid, Uuid } from '../../models/pgUtils'
import {
  SessionReportRow,
  Student,
  StudentUserProfile,
  UsageReportRow,
} from '../../models/Student'
import { Availability } from '../../models/Availability'
import {
  User,
  UserContactInfo,
  UserForAdmin,
  UserRole,
} from '../../models/User'
import { faker } from '@faker-js/faker'
import _ from 'lodash'
import createNewAvailability from '../../utils/create-new-availability'
import { VolunteerPartnerOrg } from '../../models/VolunteerPartnerOrg'
import {
  StudentPartnerOrg,
  StudentPartnerOrgUpchieveInstance,
} from '../../models/StudentPartnerOrg'
import { DAYS, GRADES, HOURS, TRAINING_QUIZZES } from '../../constants'
import { AppStudent, AppUser, AppVolunteer } from '../types'
import {
  LegacySurvey,
  SurveyQuestionDefinition,
  PresessionSurveyResponseData,
  SimpleSurveyResponse,
  UserSurvey,
  UserSurveySubmission,
  PostsessionSurveyGoalResponse,
  PostsessionSurveyResponse,
} from '../../models/Survey'
import { Pool } from 'pg'
import { getSubjectIdByName } from '../db-utils'
import {
  AdminFilteredSessions,
  GetSessionByIdResult,
  LatestSession,
  SessionByIdWithStudentAndVolunteer,
  SessionForSessionHistory,
  SessionForSessionRecap,
  SessionMessage,
  SessionsToReview,
  SessionTranscriptItem,
  UserSessions,
  VoiceMessage,
} from '../../models/Session'
import {
  ProgressReport,
  ProgressReportDetail,
  ProgressReportSummary,
  ProgressReportConcept,
  ProgressReportOverviewSubjectStat,
} from '../../services/ProgressReportsService'
import {
  ProgressReportConceptRow,
  ProgressReportOverviewUnreadStat,
  ProgressReportSessionPaginated,
  ProgressReportStatuses,
  ProgressReportSummaryRow,
} from '../../models/ProgressReports/'
import {
  CreatedVolunteer,
  TextableVolunteer,
  UserQuiz,
  VolunteerContactInfo,
  VolunteersForAnalyticsReport,
  VolunteerWithReadyToCoachInfo,
} from '../../models/Volunteer'
import { SubjectAndTopic } from '../../models/Subjects'
import { UserProductFlags } from '../../models/UserProductFlags'
import { LegacyUserModel } from '../../models/User/legacy-user'
import { SessionAudio } from '../../models/SessionAudio'
import { ModerationInfraction } from '../../models/ModerationInfractions/types'
import { SessionAudioTranscriptMessage } from '../../models/SessionAudioTranscriptMessages/types'
import { RoleContext } from '../../services/UserRolesService'
import { UserSessionMetrics } from '../../models/UserSessionMetrics'
import {
  NTHSGroup,
  NTHSGroupMemberWithRole,
  NTHSGroupWithMemberInfo,
} from '../../models/NTHSGroups'
import type {
  CurrentSession,
  CurrentSessionUser,
  MessageForFrontend,
  SessionDetail,
} from '../../types/session'
import type { Assignment, StudentAssignment } from '../../models/Assignments'
import { SessionReport, UsageReport } from '../../services/ReportService'
import { TelecomRow } from '../../utils/reportUtils'
import { UserReward } from '../../services/RewardsService'
import {
  CurrentSessionPublic,
  SessionMessagePublic,
  SessionUserInfoPublic,
} from '../../contracts/sessions'
import type {
  TutorBotMessage,
  TutorBotTranscript,
  TutorBotGeneratedMessage,
} from '../../types/tutor-bot'
import { SessionNotification } from '../../models/Notification'
import { SessionSummary } from '../../models/SessionSummaries/types'
import type { HeatMap } from '../../utils/session-utils'
import type {
  TeacherClass,
  TeacherClassResult,
} from '../../models/TeacherClass'
import type {
  GetTopicsResult,
  SubjectWithTopic,
  TrainingView,
  TrainingRow,
  TrainingItemWithOrder,
} from '../../models/Subjects'
import type { SurveyQueryResponse } from '../../models/Survey'
import type { SaveSurveyAndSubmissions } from '../../services/SurveyService'
import { TeacherClassWithStudents } from '../../models/Teacher'
import { Question } from '../../models/Question'
import { MaterialType, TrainingCourse } from '../../utils/training-courses'
import type {
  TutorBotAddMessageResponsePublic,
  TutorBotGeneratedMessagePublic,
  TutorBotMessagePublic,
  TutorBotTranscriptPublic,
} from '../../contracts/tutor-bot'
import { IneligibleStudentsWithSchoolInfo } from '../../models/IneligibleStudent/queries'
import { ZipCode } from '../../models/ZipCode/types'

export function getEmail(): string {
  return faker.internet.email().toLowerCase()
}
export function getPhoneNumber(): string {
  const phoneNumber = faker.string.numeric(9)
  return `+1${phoneNumber}`
}
export const getFirstName = faker.person.firstName
export const getLastName = faker.person.lastName
export const getIpAddress = faker.internet.ip
export const getSentence = faker.lorem.sentence

export const buildAvailability = (overrides = {}): Availability => {
  const availability = createNewAvailability()

  const mergedAvailability = _.merge(availability, overrides)

  return mergedAvailability
}

export const buildFullAvailability = (): Availability => {
  const fullAvailabilityDay = {}
  for (let key of HOURS) {
    Object.assign(fullAvailabilityDay, { [key]: true })
  }
  const result = {}
  for (let key of DAYS) {
    Object.assign(result, { [key]: { ...fullAvailabilityDay } })
  }
  return result as Availability
}

export const buildNotification = (overrides = {}) => {
  return {
    id: getDbUlid(),
    userId: getDbUlid(),
    sentAt: new Date(),
    sessionId: getDbUlid(),
    typeId: 2,
    methodId: 1,
    priorityGroupId: 1,
    successful: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
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
    roles: ['student'],
    roleContext: new RoleContext(['student'], 'student', 'student'),
    isAdmin: false,
    volunteerPartnerOrg: undefined,
    studentPartnerOrg: undefined,
    lastActivityAt: new Date(),
    deactivated: false,
    referralCode: faker.string.uuid(),
    ...overrides,
  }
}

// TODO: There is weird behavior with buildUserRow, it's returning the same user data across test files.
//       Noticing this behavior with other build functions when calling `insertSingleRow`
export function buildUserRow(overrides: Partial<User> = {}): User {
  return {
    id: getUuid(),
    verified: true,
    emailVerified: true,
    phoneVerified: false,
    email: getEmail().toLowerCase(),
    phone: getPhoneNumber(),
    smsConsent: false,
    password: 'Password123',
    firstName: getFirstName(),
    lastName: getLastName(),
    testUser: false,
    deactivated: false,
    referralCode: faker.string.uuid(),
    createdAt: new Date(),
    updatedAt: new Date(),
    banType: undefined,
    preferredLanguage: '',
    ...overrides,
  }
}

export function buildUser(overrides: Partial<AppUser> = {}): AppUser {
  const userRow = buildUserRow()
  return {
    ...userRow,
    firstName: userRow.firstName,
    lastName: userRow.lastName,
    isDeactivated: userRow.deactivated,
    isTestUser: userRow.testUser,
    isAdmin: false,
    isVolunteer: false,
    roles: ['student'] as UserRole[],
    roleContext: new RoleContext(
      overrides?.roles ?? ['student'],
      overrides?.isVolunteer ? 'volunteer' : 'student',
      overrides?.isVolunteer ? 'volunteer' : 'student'
    ),
    ...overrides,
  }
}

export function buildUserRole(userId: Ulid, role: UserRole) {
  let roleId
  switch (role) {
    case 'student':
      roleId = 1
      break
    case 'volunteer':
      roleId = 2
      break
    case 'admin':
      roleId = 3
      break
    case 'teacher':
      roleId = 4
      break
    default:
      roleId = 1
      break
  }

  return {
    userId,
    roleId,
  }
}

export function buildUserForAdmin(
  overrides: Partial<UserForAdmin> = {}
): UserForAdmin {
  return {
    id: getUuid(),
    firstName: getFirstName(),
    lastName: getLastName(),
    email: getEmail(),
    userType: 'student',
    createdAt: new Date(),
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

export function buildStudentUserProfile(
  overrides: Partial<StudentUserProfile> = {}
): StudentUserProfile {
  const student = buildStudent()
  return {
    id: student.id,
    email: student.email,
    firstName: student.firstName,
    lastName: student.lastName,
    gradeLevel: student.currentGrade,
    schoolId: student.schoolId,
    createdAt: student.createdAt,
    updatedAt: student.updatedAt,
    ...overrides,
  }
}

export function buildStudent(overrides: Partial<AppStudent> = {}): AppStudent {
  const student = {
    ...buildUser({ isVolunteer: false }),
    zipCode: '11201',
    schoolId: getUuid(),
    currentGrade: GRADES.EIGHTH,
    gradeLevel: GRADES.EIGHTH,
    signupSourceId: 1,
    studentPartnerOrg: '',
    studentPartnerSite: '',
    partnerUserId: '',
    college: 'UPchieve University',
    roles: ['student'] as UserRole[],
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
    roles: ['volunteer'] as UserRole[],
    smsConsent: true,
    ...overrides,
  }
}

export function buildTextableVolunteer(
  overrides: Partial<TextableVolunteer & { priorityGroupName?: string }> = {}
): TextableVolunteer {
  return {
    id: getDbUlid(),
    phone: faker.phone.number(),
    firstName: faker.person.firstName(),
    mutedSubjects: [],
    unlockedSubjects: ['prealgebra', 'algebraOne'],
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

export function buildLegacyUser(
  overrides: Partial<LegacyUserModel> = {}
): LegacyUserModel {
  const { updatedAt, ...userRow } = buildUserRow()
  return {
    ...userRow,
    _id: userRow.id,
    firstname: userRow.firstName,
    proxyEmail: '',
    isBanned: false,
    banReason: undefined,
    isTestUser: false,
    isFakeUser: false,
    isDeactivated: false,
    pastSessions: [],
    lastActivityAt: undefined,
    referredBy: undefined,
    userType: 'student',
    roleContext: new RoleContext(['student'], 'student', 'student'),
    sessionStats: {},
    ...overrides,
  }
}

export function buildParsedStudentUser(
  overrides: Partial<LegacyUserModel> = {}
): LegacyUserModel {
  return buildLegacyStudent(overrides)
}

export function buildParsedVolunteerUser(
  overrides: Partial<LegacyUserModel> = {}
): LegacyUserModel {
  return buildLegacyVolunteer(overrides)
}

export function buildLegacyStudent(
  overrides: Partial<LegacyUserModel> = {}
): LegacyUserModel {
  const legacyUser = buildLegacyUser()
  return {
    ...legacyUser,
    userType: 'student',
    gradeLevel: GRADES.NINTH,
    schoolName: '',
    latestRequestedSubjects: [],
    numberOfStudentClasses: 1,
    issuers: [],
    studentPartnerOrg: undefined,
    isSchoolPartner: false,
    usesClever: false,
    usesGoogle: false,
    ...overrides,
  }
}

export function buildLegacyVolunteer(
  overrides: Partial<LegacyUserModel> = {}
): LegacyUserModel {
  const legacyUser = buildLegacyUser()
  return {
    ...legacyUser,
    userType: 'volunteer',
    volunteerPartnerOrg: undefined,
    subjects: [],
    activeSubjects: [],
    mutedSubjectAlerts: [],
    totalActiveCertifications: 0,
    availability: buildAvailability(),
    certifications: {},
    availabilityLastModifiedAt: undefined,
    trainingCourses: undefined,
    occupation: [],
    country: undefined,
    timezone: undefined,
    totalVolunteerHours: 0,
    hoursTutored: 0,
    elapsedAvailability: 0,
    references: [],
    photoIdStatus: '',
    ...overrides,
  }
}

export type SessionRow = {
  id: Ulid
  studentId: Ulid
  subjectId: number
  hasWhiteboardDoc: boolean
  reviewed: boolean
  toReview: boolean
  shadowbanned: boolean
  timeTutored: number
  createdAt: Date
  updatedAt: Date
  volunteerId?: Ulid
  quillDoc?: string
  volunteerJoinedAt?: Date
  endedAt?: Date
  mongoId?: string
  endedByRoleId?: string
  endedByUserId?: string
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
    shadowbanned: false,
    timeTutored: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

export function buildSession(
  overrides: Partial<GetSessionByIdResult> & { studentId: Uuid }
): GetSessionByIdResult {
  return {
    id: getUuid(),
    hasWhiteboardDoc: true,
    reviewed: false,
    toReview: false,
    timeTutored: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    shadowbanned: false,
    subjectId: 1,
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
    toolType: 'whiteboard',
    ...overrides,
  }
  return session
}

export const buildSessionAudioRow = (
  sessionId: string,
  overrides: Partial<SessionAudio> = {}
): SessionAudio => {
  return {
    id: getDbUlid(),
    sessionId,
    updatedAt: new Date(),
    createdAt: new Date(),
    ...overrides,
  }
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
    id: getUuid(),
    key: getUuid(),
    name: faker.word.noun(),
    highSchoolSignup: false,
    schoolSignupRequired: false,
    collegeSignup: false,
    signupCode: getUuid(),
    sites: [],
    isSchool: true,
    deactivated: false,
    schoolId: getUuid(),
    ...overrides,
  }
}

export function buildStudentPartnerOrgInsert(
  overrides: Partial<StudentPartnerOrg> = {}
): Partial<StudentPartnerOrg> {
  const partner = buildStudentPartnerOrg()
  return {
    id: partner.id as Uuid,
    key: partner.key,
    name: partner.name,
    highSchoolSignup: partner.highSchoolSignup,
    schoolSignupRequired: partner.schoolSignupRequired,
    collegeSignup: partner.collegeSignup,
    signupCode: partner.signupCode,
    ...overrides,
  }
}

export function buildStudentPartnerOrgUpchieveInstance(
  overrides: Partial<StudentPartnerOrgUpchieveInstance> & {
    studentPartnerOrgId: string
  }
): StudentPartnerOrgUpchieveInstance {
  return {
    id: getDbUlid(),
    studentPartnerOrgId: overrides?.studentPartnerOrgId,
    deactivatedOn: overrides?.deactivatedOn ?? null,
  } as StudentPartnerOrgUpchieveInstance
}

export function buildSchool(
  overrides: Partial<{ name: string; cityId: number }> = {}
) {
  return {
    id: getDbUlid(),
    name: 'Approved School',
    cityId: 1,
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

export const buildSimpleSurveyLegacy = (
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

export const buildSimpleSurvey = (
  overrides: Partial<SurveyQuestionDefinition> = {}
): SurveyQuestionDefinition => {
  const survey = {
    questionId: 1,
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

export const buildSimpleSurveyResponse = (
  overrides: Partial<SimpleSurveyResponse> = {}
): SimpleSurveyResponse => {
  const survey = {
    displayLabel: 'Their goal:',
    response: 'Complete a homework assignment',
    score: 1,
    displayOrder: 10,
    questionId: 1,
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

export const buildPostsessionSurveyGoalResponse = (
  overrides: Partial<PostsessionSurveyGoalResponse> = {}
): PostsessionSurveyGoalResponse => {
  return {
    sessionId: getDbUlid(),
    roleInSession: 'student',
    submitterUserId: getDbUlid(),
    createdAt: new Date(),
    surveyResponseChoiceId: 1,
    score: 1,
    choiceText: 'choice',
    ...overrides,
  }
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
    sessionCreatedAt: new Date(),
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
    sessionCreatedAt: new Date(),
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
    createdAt: new Date(),
    ...overrides,
  }
  return report
}

export function buildProgressReportSession(
  overrides: Partial<ProgressReportSessionPaginated> = {}
): ProgressReportSessionPaginated {
  return {
    id: getUuid(),
    topic: 'math',
    topicIconLink: '',
    subject: 'algebraOne',
    createdAt: new Date(),
    ...overrides,
  }
}

export function buildProgressReportsPaginatedResult(
  overrides: Partial<{
    sessions: ProgressReportSessionPaginated[]
    isLastPage: boolean
    page: number
  }> = {}
) {
  return {
    sessions: [buildProgressReportSession()],
    isLastPage: true,
    page: 1,
    ...overrides,
  }
}

export function buildProgressReportOveriewUnreadStats(
  overrides: Partial<ProgressReportOverviewUnreadStat> = {}
): ProgressReportOverviewUnreadStat {
  return {
    subject: 'algebraOne',
    totalUnreadReports: 1,
    ...overrides,
  }
}

export function buildProgressReportOverviewSubjectStats(
  overrides: Partial<ProgressReportOverviewSubjectStat> = {}
): ProgressReportOverviewSubjectStat {
  return {
    ...buildProgressReportOveriewUnreadStats(),
    overallGrade: 100,
    latestReportCreatedAt: new Date(),
    ...overrides,
  }
}

export const buildTestVolunteerForAnalyticsReport = (overrides = {}) => {
  return {
    userId: 'abc-123',
    firstName: 'Louise',
    lastName: 'Belcher',
    email: '1@test.co',
    isOnboarded: true,
    createdAt: new Date(),
    dateOnboarded: new Date(),
    totalQuizzesPassed: 10,
    totalNotifications: 10,
    totalNotificationsWithinRange: 5,
    totalPartnerSessions: 10,
    totalPartnerSessionsWithinRange: 5,
    totalPartnerTimeTutored: 10,
    totalPartnerTimeTutoredWithinRange: 5,
    totalSessions: 10,
    totalSessionsWithinRange: 5,
    totalUniquePartnerStudentsHelped: 10,
    totalUniquePartnerStudentsHelpedWithinRange: 5,
    totalUniqueStudentsHelped: 10,
    totalUniqueStudentsHelpedWithinRange: 5,
    ...overrides,
  } as VolunteersForAnalyticsReport
}

export function buildProgressReportOverviewUnreadStat(
  overrides: Partial<ProgressReportOverviewUnreadStat> = {}
): ProgressReportOverviewUnreadStat {
  return {
    subject: 'algebraOne',
    totalUnreadReports: 1,
    ...overrides,
  }
}

export function buildProgressReportOverviewSubjectStat(
  overrides: Partial<ProgressReportOverviewSubjectStat> = {}
): ProgressReportOverviewSubjectStat {
  return {
    ...buildProgressReportOverviewUnreadStat(),
    overallGrade: 80,
    latestReportCreatedAt: new Date(),
    ...overrides,
  }
}

export const buildSubjectAndTopic = (
  overrides: Partial<SubjectAndTopic> = {}
): SubjectAndTopic => {
  const subject = {
    subjectName: 'algebraOne',
    subjectDisplayName: 'Algebra 1',
    topicName: 'math',
    topicDisplayName: 'Math',
    toolType: 'whiteboard',
    ...overrides,
  }
  return subject
}

export const buildUserProductFlags = (
  overrides: Partial<UserProductFlags> = {}
): UserProductFlags => {
  return {
    userId: getUuid(),
    sentReadyToCoachEmail: false,
    sentHourSummaryIntroEmail: false,
    sentInactiveThirtyDayEmail: false,
    sentInactiveSixtyDayEmail: false,
    sentInactiveNinetyDayEmail: false,
    gatesQualified: false,
    fallIncentiveEnrollmentAt: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

export function buildPublicProductFlags(
  overrides: Partial<UserProductFlags> = {}
) {
  const flags = buildUserProductFlags(overrides)
  return {
    userId: flags.userId,
    gatesQualified: flags.gatesQualified,
    fallIncentiveEnrollmentAt: flags.fallIncentiveEnrollmentAt,
    impactStudyEnrollmentAt: flags.impactStudyEnrollmentAt,
    impactStudyCampaigns: flags.impactStudyCampaigns,
  }
}

export const buildModerationInfractionRow = (
  userId: string,
  sessionId: string,
  overrides: Partial<ModerationInfraction> = {}
): ModerationInfraction => {
  return {
    id: getDbUlid(),
    userId,
    sessionId,
    active: true,
    reason: { profanity: ['test_profanity'] },
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

export const buildSessionMessageRow = (
  senderId: string,
  sessionId: string,
  overrides: Partial<SessionMessage> = {}
): SessionMessage => {
  return {
    id: getDbUlid(),
    senderId,
    sessionId,
    contents: 'Test message',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

export const buildSessionAudioTranscriptMessageRow = (
  senderId: string,
  sessionId: string,
  overrides: Partial<SessionAudioTranscriptMessage> = {}
): SessionAudioTranscriptMessage => {
  return {
    id: getDbUlid(),
    userId: senderId,
    sessionId,
    message: 'Test message',
    saidAt: new Date(),
    ...overrides,
  }
}

export const buildSessionTranscriptItem = (
  userId: string,
  overrides = {}
): SessionTranscriptItem => {
  return {
    messageId: getDbUlid(),
    userId,
    createdAt: new Date(),
    message: 'Test message',
    messageType: 'session_chat',
    role: 'student',
    ...overrides,
  }
}

export const buildSessionVoiceMessage = (
  senderId: string,
  sessionId: string,
  overrides: Partial<VoiceMessage> = {}
): VoiceMessage => {
  return {
    id: getDbUlid(),
    sessionId,
    senderId,
    createdAt: new Date(),
    updatedAt: new Date(),
    transcript: 'test transcript',
    ...overrides,
  }
}

export function buildUserSessionMetrics(
  overrides: Partial<UserSessionMetrics> & { userId: Uuid }
): UserSessionMetrics {
  return {
    absentStudent: 0,
    absentVolunteer: 0,
    lowCoachRatingFromStudent: 0,
    lowSessionRatingFromStudent: 0,
    lowSessionRatingFromCoach: 0,
    reported: 0,
    onlyLookingForAnswers: 0,
    rudeOrInappropriate: 0,
    commentFromStudent: 0,
    commentFromVolunteer: 0,
    hasBeenUnmatched: 0,
    hasHadTechnicalIssues: 0,
    personalIdentifyingInfo: 0,
    gradedAssignment: 0,
    coachUncomfortable: 0,
    studentCrisis: 0,
    createdAt: new Date(),
    ...overrides,
  }
}

export function buildSurveyResponse(
  overrides?: Partial<PostsessionSurveyResponse>
): PostsessionSurveyResponse {
  return {
    userRole: '',
    questionText: '',
    response: '',
    displayLabel: '',
    displayOrder: 1,
    score: 1,
    ...overrides,
  }
}

export function buildUserTrainingCourse(
  userId: string,
  overrides = {}
): {
  userId: Ulid
  trainingCourseId: number
  complete: boolean
  progress: number
  createdAt: Date
  updatedAt: Date
  completedMaterials: string[]
} {
  return {
    userId,
    trainingCourseId: 1,
    completedMaterials: ['a', 'b', 'c', 'd', 'e'],
    complete: true,
    progress: 100,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

export function buildUserQuiz(
  userId: string,
  overrides: Partial<UserQuiz> = {}
): UserQuiz {
  return {
    userId,
    quizId: 1,
    attempts: 1,
    passed: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

export function buildNTHSGroupMemberWithRole(
  overrides: Partial<NTHSGroupMemberWithRole> = {}
): NTHSGroupMemberWithRole {
  return {
    nthsGroupId: getDbUlid(),
    userId: getDbUlid(),
    title: 'Member',
    joinedAt: new Date(),
    updatedAt: new Date(),
    firstName: faker.person.firstName(),
    lastInitial: faker.person.lastName().charAt(0),
    roleName: 'member',
    ...overrides,
  }
}

export function buildVolunteerWithReadyToCoachInfo(
  overrides: Partial<VolunteerWithReadyToCoachInfo> = {}
): VolunteerWithReadyToCoachInfo {
  return {
    id: getDbUlid(),
    isApproved: true,
    isOnboarded: true,
    isReadyToCoach: true,
    banType: undefined,
    ...overrides,
  }
}

export function buildNTHSGroup(overrides: Partial<NTHSGroup> = {}): NTHSGroup {
  return {
    id: getDbUlid(),
    name: 'NTHS Test Chapter',
    key: 'nths-test-chapter',
    createdAt: new Date(),
    inviteCode: faker.string.alpha({ length: 6 }),
    ...overrides,
  }
}

export function buildNTHSGroupWithMemberInfo(
  overrides: Partial<NTHSGroupWithMemberInfo> = {}
): NTHSGroupWithMemberInfo {
  const groupId = getDbUlid()
  const groupName = 'NTHS Chapter'
  const groupKey = 'nths-chapter'
  const inviteCode = faker.string.hexadecimal({ length: 6 })
  return {
    groupInfo: {
      id: groupId,
      name: groupName,
      key: groupKey,
      createdAt: new Date(),
      inviteCode,
    },
    memberInfo: {
      title: 'Member',
      joinedAt: new Date(),
      roleName: 'member',
    },
    memberTitle: 'Member',
    joinedAt: new Date(),
    groupId,
    groupName,
    groupKey,
    inviteCode,
    roleName: 'member',
    schoolAffiliationStatus: null,
    ...overrides,
  }
}

export function buildVolunteerContactInfo(
  overrides: Partial<VolunteerContactInfo> = {}
): VolunteerContactInfo {
  return {
    id: getDbUlid(),
    email: faker.internet.email(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    ...overrides,
  }
}

export function buildAssignment(
  overrides: Partial<Assignment> = {}
): Assignment {
  return {
    id: getUuid(),
    classId: getUuid(),
    description: 'Read chapter 1',
    dueDate: new Date(),
    isRequired: true,
    minDurationInMinutes: 15,
    numberOfSessions: 2,
    startDate: new Date(),
    subjectId: 1,
    title: 'Homework 1',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

export function buildAssignmentPayload(
  overrides: Partial<{
    classId: string
    description?: string
    dueDate?: Date
    isRequired: boolean
    minDurationInMinutes?: number
    numberOfSessions?: number
    startDate?: Date
    subjectId?: number
    title?: string
    studentIds: string[]
  }> = {}
) {
  return {
    classId: getUuid(),
    description: 'Practice problems',
    dueDate: new Date(),
    isRequired: true,
    minDurationInMinutes: 15,
    numberOfSessions: 2,
    startDate: new Date(),
    subjectId: 1,
    title: 'Homework 1',
    studentIds: [getUuid()],
    ...overrides,
  }
}

export function buildEditedAssignmentPayload(
  overrides: Partial<{
    id: string
    description?: string
    dueDate?: Date
    isRequired?: boolean
    minDurationInMinutes?: number
    numberOfSessions?: number
    startDate?: Date
    subjectId?: number
    title?: string
    studentsToRemove?: string[]
    studentsToAdd?: string[]
  }> = {}
) {
  return {
    id: getUuid(),
    description: 'Updated practice problems',
    dueDate: new Date(),
    isRequired: true,
    minDurationInMinutes: 20,
    numberOfSessions: 3,
    startDate: new Date(),
    subjectId: 2,
    title: 'Homework 1 Updated',
    studentsToRemove: [getUuid()],
    studentsToAdd: [getUuid()],
    ...overrides,
  }
}

export function buildStudentAssignment(
  overrides: Partial<StudentAssignment> = {}
): StudentAssignment {
  return {
    id: getUuid(),
    classId: getUuid(),
    className: 'Algebra',
    assignedAt: new Date(),
    title: 'Homework 1',
    description: 'Read chapter 1',
    numberOfSessions: 2,
    dueDate: new Date(),
    isRequired: true,
    minDurationInMinutes: 15,
    startDate: new Date(),
    subjectId: 1,
    subjectName: 'Algebra One',
    submittedAt: new Date(),
    ...overrides,
  }
}

export function buildSessionReportRow(
  overrides: Partial<SessionReportRow> = {}
): SessionReportRow {
  const student = buildStudent()
  return {
    sessionId: getUuid(),
    topic: 'math',
    subject: 'algebraOne',
    createdAt: new Date(),
    endedAt: new Date(),
    firstName: student.firstName,
    lastName: student.lastName,
    email: student.email,
    partnerSite: student.studentPartnerSite,
    waitTimeMins: 10,
    totalMessages: 100,
    volunteerJoined: 'YES',
    volunteerJoinedAt: new Date(),
    sessionRating: 5,
    sponsorOrg: undefined,
    ...overrides,
  }
}

export function buildSessionReportFormattedRow(
  overrides: Partial<SessionReportRow> = {}
): SessionReport {
  const row = buildSessionReportRow(overrides)
  return {
    Topic: row.topic,
    Subtopic: row.subject,
    'Created at': row.createdAt.toISOString(),
    Messages: '10',
    'First name': row.firstName,
    'Last name': row.lastName,
    Email: row.email,
    Volunteer: row.volunteerJoined,
    'Volunteer join date': row.volunteerJoinedAt
      ? String(row.volunteerJoinedAt)
      : new Date().toISOString(),
    'Ended at': row.endedAt.toISOString(),
    'Wait time': row.waitTimeMins ? String(row.waitTimeMins) : undefined,
    'Session rating': row.sessionRating ? String(row.sessionRating) : undefined,
  }
}

export function buildUsageReportRow(
  overrides: Partial<UsageReportRow> = {}
): UsageReportRow {
  const student = buildStudent()
  return {
    userId: getUuid(),
    firstName: student.firstName,
    lastName: student.lastName,
    email: student.email,
    joinDate: student.createdAt,
    studentPartnerOrg: student.studentPartnerOrg,
    partnerSite: student.studentPartnerSite,
    sponsorOrg: undefined,
    school: student.schoolId,
    totalSessions: 10,
    totalSessionLengthMins: 100,
    rangeTotalSessions: 5,
    rangeSessionLengthMins: 10,
    ...overrides,
  }
}

export function buildUsageReportFormattedRow(
  overrides: Partial<UsageReportRow> = {}
): UsageReport {
  const row = buildUsageReportRow(overrides)
  return {
    'First name': row.firstName,
    'Last name': row.lastName,
    Email: row.email,
    'Minutes over date range': row.rangeSessionLengthMins,
    'Total minutes': row.totalSessionLengthMins,
    'Join date': row.joinDate.toISOString(),
    'Total sessions': row.totalSessions,
    'Sessions over date range': row.rangeTotalSessions,
    'High school name': row.school ?? '',
    'Partner site': row.partnerSite ?? '-',
    'HS/College': row.school ? 'High school' : 'College',
    'Sponsor Org': row.sponsorOrg ?? undefined,
    'Partner Org': row.studentPartnerOrg ?? '-',
  }
}

export function buildTelecomReportRow(
  overrides: Partial<TelecomRow> = {}
): TelecomRow {
  const user = buildUser()
  return {
    name: user.firstName,
    email: user.email,
    eventId: 1000,
    date: new Date().toISOString(),
    hours: 2,
    ...overrides,
  }
}

export function buildUserReward(
  overrides: Partial<UserReward> = {}
): UserReward {
  return {
    id: getUuid(),
    amount: 25,
    campaignId: getUuid(),
    campaignName: 'Fall Incentive',
    createdAt: new Date(),
    rewardLink: 'https://example.com/reward-link',
    ...overrides,
  }
}

export function buildCurrentSessionUser(
  overrides: Partial<CurrentSessionUser> = {}
): CurrentSessionUser {
  const id = getUuid()
  const user = buildUser()
  return {
    _id: id,
    id,
    firstname: user.firstName,
    firstName: user.firstName,
    pastSessions: [],
    createdAt: new Date(),
    ...overrides,
  }
}

export function buildCurrentSessionUserPublic(
  overrides: Partial<SessionUserInfoPublic> = {}
): SessionUserInfoPublic {
  const sessionUser = buildCurrentSessionUser(overrides)
  return {
    _id: sessionUser.id,
    id: sessionUser.id,
    firstname: sessionUser.firstName,
    firstName: sessionUser.firstName,
  }
}

export function buildSessionMessage(
  overrides: Partial<MessageForFrontend> = {}
): MessageForFrontend {
  return {
    user: getUuid(),
    contents: faker.lorem.sentence(),
    createdAt: new Date(),
    ...overrides,
  }
}

export function buildSessionMessagePublic(
  overrides: Partial<MessageForFrontend> = {}
): SessionMessagePublic {
  const message = buildSessionMessage(overrides)
  return {
    user: message.user,
    contents: message.contents,
    createdAt: message.createdAt.toISOString(),
  }
}

export function buildCurrentSession(
  overrides: Partial<CurrentSession> = {}
): CurrentSession {
  const student = buildCurrentSessionUser()
  const volunteer = buildCurrentSessionUser()

  return {
    _id: getUuid(),
    id: getUuid(),
    studentId: student.id,
    volunteerId: volunteer.id,
    subTopic: 'linear equations',
    subject: 'algebraOne',
    subjectDisplayName: 'Algebra 1',
    type: 'math',
    topic: 'math',
    student,
    volunteer,
    volunteerJoinedAt: new Date(),
    messages: [buildSessionMessage({ user: student.id })],
    toolType: 'whiteboard',
    createdAt: new Date(),
    endedAt: undefined,
    endedBy: undefined,
    docEditorVersion: undefined,
    studentBannedFromLiveMedia: false,
    volunteerBannedFromLiveMedia: false,
    volunteerLanguages: undefined,
    shadowbanned: undefined,
    ...overrides,
  }
}

export function buildCurrentSessionPublic(
  overrides: Partial<CurrentSession> = {}
): CurrentSessionPublic {
  const session = buildCurrentSession(overrides)
  return {
    _id: session.id,
    id: session.id,
    studentId: session.student.id,
    volunteerId: session.volunteer?.id,
    student: buildCurrentSessionUserPublic(session.student),
    volunteer: session.volunteer
      ? buildCurrentSessionUserPublic(session.volunteer)
      : undefined,
    volunteerJoinedAt: session.volunteerJoinedAt?.toISOString(),
    messages: session.messages.map(buildSessionMessagePublic),
    toolType: session.toolType,
    docEditorVersion: session.docEditorVersion,
    studentBannedFromLiveMedia: session.studentBannedFromLiveMedia,
    volunteerBannedFromLiveMedia: session.volunteerBannedFromLiveMedia,
    volunteerLanguages: session.volunteerLanguages,
    type: session.type,
    subTopic: session.subject,
    createdAt: session.createdAt.toISOString(),
    endedAt: session.endedAt?.toISOString(),
    endedBy: session.endedBy,
  }
}

export function buildLatestSession(
  overrides: Partial<LatestSession> = {}
): LatestSession {
  return {
    id: getUuid(),
    createdAt: new Date(),
    studentId: getUuid(),
    volunteerId: getUuid(),
    endedByUserId: getUuid(),
    timeTutored: 1000,
    endedAt: new Date(),
    ...overrides,
  }
}

export function buildSessionToReview(
  overrides: Partial<SessionsToReview> = {}
): SessionsToReview {
  const student = buildStudent()
  const volunteer = buildVolunteer()
  const id = getUuid()

  return {
    id,
    _id: id,
    volunteer: volunteer.id,
    type: 'math',
    subTopic: 'algebraOne',
    studentFirstName: student.firstName,
    volunteerFirstName: volunteer.firstName,
    totalMessages: 100,
    isReported: false,
    flags: [],
    reviewReasons: [],
    toReview: false,
    studentRating: 5,
    createdAt: new Date(),
    endedAt: new Date(),
    ...overrides,
  }
}

export function buildAdminFilteredSession(
  overrides: Partial<AdminFilteredSessions> = {}
): AdminFilteredSessions {
  const student = buildStudent()
  const volunteer = buildVolunteer()
  const id = getUuid()

  return {
    id,
    _id: id,
    volunteer: {
      firstname: volunteer.firstName,
      isBanned: false,
      isTestUser: false,
      totalPastSessions: 10,
    },
    student: {
      firstname: student.firstName,
      isBanned: false,
      isTestUser: false,
      totalPastSessions: 10,
    },
    type: 'math',
    subTopic: 'algebraOne',
    studentFirstName: student.firstName,
    totalMessages: 100,
    reviewReasons: [],
    studentRating: 5,
    createdAt: new Date(),
    endedAt: new Date(),
    ...overrides,
  }
}

export function buildAdminSessionView(
  overrides: Partial<SessionByIdWithStudentAndVolunteer> = {}
): SessionByIdWithStudentAndVolunteer {
  const currentSession = buildCurrentSession()
  const id = currentSession.id

  return {
    id,
    _id: id,
    volunteerjoinedAt: currentSession.volunteerJoinedAt,
    endedBy: currentSession.student.id,
    feedbacks: undefined,
    surveyResponses: {
      presessionSurvey: [buildSimpleSurveyResponse()],
      studentPostsessionSurvey: [buildSurveyResponse()],
      volunteerPostsessionSurvey: [buildSurveyResponse()],
    },
    userAgent: undefined,
    type: currentSession.type,
    subTopic: currentSession.subject,
    quillDoc: undefined,
    reviewReasons: [],
    reportReason: undefined,
    reportMessage: undefined,
    timeTutored: 1000,
    notifications: [],
    photos: [],
    student: currentSession.student,
    volunteer: currentSession.volunteer,
    messages: currentSession.messages,
    toReview: false,
    toolType: currentSession.toolType,
    createdAt: new Date(),
    endedAt: new Date(),
    ...overrides,
  }
}

export type PublicSessionUser = {
  _id: Ulid
  firstName: string
}

export type PublicSession = {
  _id: Ulid
  createdAt: Date
  endedAt: Date
  type: string
  subTopic: string
  student: PublicSessionUser
  volunteer: PublicSessionUser
}

export function buildPublicSession(
  overrides: Partial<PublicSession> = {}
): PublicSession {
  const student = buildUser()
  const volunteer = buildUser()
  return {
    _id: getUuid(),
    createdAt: new Date(),
    endedAt: new Date(),
    type: 'math',
    subTopic: 'algebraOne',
    student: {
      _id: student.id,
      firstName: student.firstName,
    },
    volunteer: {
      _id: volunteer.id,
      firstName: volunteer.firstName,
    },
    ...overrides,
  }
}

export function buildSessionNotification(
  overrides: Partial<SessionNotification> = {}
): SessionNotification {
  const volunteer = buildVolunteer()
  return {
    id: getUuid(),
    volunteer: {
      firstname: volunteer.firstName,
      volunteerPartnerOrg: volunteer.volunteerPartnerOrg,
    },
    type: 'initial',
    method: 'sms',
    wasSuccessful: true,
    messageId: 'message-123',
    priorityGroup: 'Regular Volunteer',
    sessionId: getUuid(),
    ...overrides,
  }
}

export function buildTutorBotMessage(
  overrides: Partial<TutorBotMessage> = {}
): TutorBotMessage {
  return {
    tutorBotConversationId: getUuid(),
    userId: getUuid(),
    senderUserType: 'student',
    message: faker.lorem.sentence(),
    createdAt: new Date(),
    ...overrides,
  }
}

export function buildTutorBotMessagePublic(
  overrides: Partial<TutorBotMessage> = {}
): TutorBotMessagePublic {
  const message = buildTutorBotMessage(overrides)
  return {
    ...message,
    createdAt: message.createdAt.toISOString(),
  }
}

export function buildTutorBotGeneratedMessage(
  overrides: Partial<TutorBotGeneratedMessage> = {}
): TutorBotGeneratedMessage {
  return {
    ...buildTutorBotMessage({
      senderUserType: 'bot',
    }),
    traceId: getUuid(),
    observationId: null,
    status: 'completed',
    ...overrides,
  }
}

export function buildTutorBotGeneratedMessagePublic(
  overrides: Partial<TutorBotGeneratedMessage> = {}
): TutorBotGeneratedMessagePublic {
  const message = buildTutorBotGeneratedMessage(overrides)
  return {
    ...message,
    createdAt: message.createdAt.toISOString(),
  }
}

export function buildTutorBotTranscript(
  overrides: Partial<TutorBotTranscript> = {}
): TutorBotTranscript {
  return {
    conversationId: getUuid(),
    subjectId: 1,
    messages: [buildTutorBotMessage()],
    sessionId: getUuid(),
    ...overrides,
  }
}

export function buildTutorBotTranscriptPublic(
  overrides: Partial<TutorBotTranscriptPublic> = {}
): TutorBotTranscriptPublic {
  return {
    conversationId: getUuid(),
    subjectId: 1,
    sessionId: getUuid(),
    messages: [buildTutorBotMessagePublic()],
    ...overrides,
  }
}

export function buildTutorBotAddMessageResponse(
  overrides: Partial<{
    userMessage: TutorBotMessage
    botResponse: TutorBotGeneratedMessage
  }> = {}
) {
  return {
    userMessage: buildTutorBotMessage(),
    botResponse: buildTutorBotGeneratedMessage(),
    ...overrides,
  }
}

export function buildTutorBotAddMessageResponsePublic(
  overrides: Partial<{
    userMessage: TutorBotMessage
    botResponse: TutorBotGeneratedMessage
  }> = {}
): TutorBotAddMessageResponsePublic {
  const response = buildTutorBotAddMessageResponse(overrides)
  return {
    userMessage: buildTutorBotMessagePublic(response.userMessage),
    botResponse: buildTutorBotGeneratedMessagePublic(response.botResponse),
  }
}

// TODO: Add typing
export function buildPresessionSurveyResponses() {
  return {
    surveyId: 1,
    surveyTypeId: 2,
    submissions: [
      {
        questionId: 1,
        responseChoiceId: 1,
        openResponse: '',
      },
    ],
  }
}

export function buildSessionHistorySession(
  overrides: Partial<SessionForSessionHistory> = {}
): SessionForSessionHistory {
  const student = buildUser()
  const volunteer = buildUser()

  return {
    id: getUuid(),
    topic: 'math',
    topicIconLink: '',
    subject: 'algebraOne',
    createdAt: new Date(),
    timeTutored: 1000,
    isFavorited: false,
    studentId: student.id,
    studentFirstName: student.firstName,
    volunteerId: volunteer.id,
    volunteerFirstName: volunteer.firstName,
    ...overrides,
  }
}

export function buildRecapSession(
  overrides: Partial<SessionForSessionRecap> = {}
): SessionForSessionRecap {
  const student = buildUser()
  const volunteer = buildUser()
  return {
    id: getUuid(),
    topic: 'math',
    topicIconLink: '',
    subject: 'algebraOne',
    subjectKey: 'algebra-one',
    createdAt: new Date(),
    endedAt: new Date(),
    timeTutored: 1000,
    isFavorited: false,
    studentId: student.id,
    studentFirstName: student.firstName,
    volunteerId: volunteer.id,
    volunteerFirstName: volunteer.firstName,
    quillDoc: undefined,
    hasWhiteboardDoc: true,
    messages: [buildMessageForFrontend({ user: student.id })],
    feedbackFromStudent: {
      howMuchDidYourCoachPushYouToDoYourBestWorkToday: 5,
      howSupportiveWasYourCoachToday: 5,
    },
    ...overrides,
  }
}

export function buildSessionSummary(
  overrides: Partial<SessionSummary> = {}
): SessionSummary {
  return {
    id: getUuid(),
    sessionId: getUuid(),
    userType: 'student',
    summary: faker.lorem.sentence(),
    createdAt: new Date(),
    ...overrides,
  }
}

export function buildSessionDetail(
  overrides: Partial<SessionDetail> = {}
): SessionDetail {
  const student = buildUser()
  const volunteer = buildUser()

  return {
    id: getUuid(),
    firstName: student.firstName,
    lastName: student.lastName,
    name: 'algebraOne',
    messageCount: '100',
    volunteerId: volunteer.id,
    createdAt: new Date(),
    endedAt: new Date(),
    ...overrides,
  }
}

export function buildHeatMap(overrides: Partial<HeatMap> = {}): HeatMap {
  const heatMap = {} as HeatMap

  for (const day of DAYS) {
    const dayMap = {} as HeatMap[typeof day]
    for (const hour of HOURS) {
      dayMap[hour] = 0
    }
    heatMap[day] = dayMap
  }

  return {
    ...heatMap,
    ...overrides,
  }
}

export function buildTeacherClassResult(
  overrides: Partial<TeacherClassResult> = {}
): TeacherClassResult {
  return {
    id: getUuid(),
    name: 'Teacher Class',
    active: true,
    topicId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

export function buildGetTopicsResult(
  overrides: Partial<GetTopicsResult> = {}
): GetTopicsResult {
  return {
    id: faker.number.int({ min: 1, max: 1000 }),
    name: faker.helpers.arrayElement(['math', 'science', 'college']),
    displayName: faker.lorem.words(2),
    iconLink: faker.internet.url(),
    dashboardOrder: faker.number.int({ min: 1, max: 20 }),
    trainingOrder: faker.number.int({ min: 1, max: 20 }),
    ...overrides,
  }
}

export function buildSubjectWithTopic(
  overrides: Partial<SubjectWithTopic> = {}
): SubjectWithTopic {
  return {
    name: faker.lorem.word(),
    id: faker.number.int({ min: 1, max: 1000 }),
    displayOrder: faker.number.int({ min: 1, max: 20 }),
    displayName: faker.lorem.words(2),
    active: true,
    topicId: faker.number.int({ min: 1, max: 20 }),
    topicName: faker.helpers.arrayElement(['math', 'science', 'college']),
    topicDisplayName: faker.lorem.words(2),
    topicDashboardOrder: faker.number.int({ min: 1, max: 20 }),
    isComputedUnlock: false,
    topicIconLink: faker.internet.url(),
    topicColor: faker.color.rgb(),
    ...overrides,
  }
}

export function buildTrainingItemWithOrder(
  overrides: Partial<TrainingItemWithOrder> = {}
): TrainingItemWithOrder {
  return {
    key: faker.lorem.word(),
    displayName: faker.lorem.words(2),
    order: faker.number.int({ min: 1, max: 20 }),
    active: true,
    ...overrides,
  }
}

export function buildTrainingRow(
  overrides: Partial<TrainingRow> = {}
): TrainingRow {
  return {
    key: faker.lorem.word(),
    displayName: faker.lorem.words(2),
    order: faker.number.int({ min: 1, max: 20 }),
    active: true,
    subjectsIncluded: [
      buildTrainingItemWithOrder(),
      buildTrainingItemWithOrder(),
    ],
    ...overrides,
  }
}

// TODO: Fix this type
export function buildTrainingView(
  overrides: Partial<TrainingView> = {}
): TrainingView {
  const value = {
    subjectTypes: [
      buildTrainingItemWithOrder({
        key: 'math',
        displayName: 'Math',
        order: 1,
      }),
    ],
    math: {
      training: [
        {
          key: 'upchieve101',
          displayName: 'UPchieve 101',
        },
      ],
      certifications: [
        buildTrainingRow({
          key: 'algebraOne',
          displayName: 'Algebra 1',
        }),
      ],
      additionalSubjects: [],
      computedSubjects: [],
    },
    ...overrides,
  }

  return value
}

export const buildSurveyQueryResponse = (
  overrides: Partial<SurveyQueryResponse> = {}
): SurveyQueryResponse => {
  return {
    surveyId: 1,
    surveyTypeId: 1,
    survey: [buildSimpleSurvey()],
    rewardAmount: 0,
    ...overrides,
  }
}

export const buildUserSurveySavePayload = (
  overrides: Partial<SaveSurveyAndSubmissions> = {}
): SaveSurveyAndSubmissions => {
  return {
    surveyId: 1,
    sessionId: getUuid(),
    progressReportId: undefined,
    surveyTypeId: 1,
    submissions: [
      {
        questionId: 1,
        responseChoiceId: 1,
        openResponse: '',
      },
    ],
    volunteerFeedbackForStudent: undefined,
    ...overrides,
  }
}

export const buildVolunteerContextSurveyResponse = (
  overrides: Partial<{
    totalStudentSessions: number
    responses: SimpleSurveyResponse[]
  }> = {}
) => {
  return {
    totalStudentSessions: 3,
    responses: [buildSimpleSurveyResponse()],
    ...overrides,
  }
}

export function buildTeacherClass(
  overrides: Partial<TeacherClass> = {}
): TeacherClass {
  return {
    id: getUuid(),
    userId: getUuid(),
    name: 'Algebra 1',
    code: getUuid(),
    topicId: 1,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

export function buildTeacherClassByClassCode(
  overrides: Partial<{
    id: string
    userId?: string | undefined
    name: string
    active: boolean
    cleverId?: string
    code: string
    topicId?: number
    createdAt: Date
    updatedAt: Date
    deactivatedOn?: Date
  }> = {}
): {
  id: string
  userId: string
  name: string
  active: boolean
  code: string
  cleverId: string
  topicId: number
  createdAt: Date
  updatedAt: Date
  deactivatedOn: Date
} {
  return {
    id: getUuid(),
    userId: getUuid(),
    name: 'Algebra 1',
    active: true,
    code: getUuid(),
    topicId: 1,
    cleverId: getUuid(),
    createdAt: new Date(),
    updatedAt: new Date(),
    deactivatedOn: new Date(),
    ...overrides,
  }
}

export function buildTeacherClassWithStudents(
  overrides: Partial<TeacherClassWithStudents> = {}
): TeacherClassWithStudents {
  return {
    ...buildTeacherClass(),
    students: [buildStudentUserProfile(), buildStudentUserProfile()],
    ...overrides,
  }
}

export function buildTrainingCourse(
  overrides: Partial<
    TrainingCourse & {
      isComplete: boolean
      progress: number
      completedMaterials: string[]
    }
  > = {}
): TrainingCourse & {
  isComplete: boolean
  progress: number
  completedMaterials: string[]
} {
  return {
    name: 'UPchieve 101',
    courseKey: 'upchieve101',
    description: 'Intro course',
    modules: [
      {
        name: 'Intro to UPchieve',
        materials: [
          {
            name: 'Welcome to UPchieve!',
            materialKey: '31rgp3',
            isRequired: true,
            type: MaterialType.VIDEO,
            resourceId: '459021055',
          },
        ],
      },
    ],
    requiredCertifications: [TRAINING_QUIZZES.ACADEMIC_INTEGRITY],
    quizKey: 'upchieve101',
    quizName: 'UPchieve 101 Quiz',
    isComplete: false,
    progress: 0,
    completedMaterials: [],
    ...overrides,
  }
}

export function buildTrainingCourseProgress(
  overrides: Partial<{
    progress: number
    isComplete: boolean
    completedMaterialKeys: string[]
  }> = {}
) {
  return {
    progress: 25,
    isComplete: false,
    completedMaterialKeys: ['31rgp3'],
    ...overrides,
  }
}

export function buildQuizScoreResult(
  overrides: Partial<{
    tries: number
    passed: boolean
    score: number
    idCorrectAnswerMap: Record<string, string | number>
    isTrainingSubject: boolean
  }> = {}
) {
  return {
    tries: 1,
    passed: true,
    score: 100,
    idCorrectAnswerMap: {
      '1': '2',
    },
    isTrainingSubject: true,
    ...overrides,
  }
}

export function buildTrainingQuestion(
  overrides: Partial<Question> = {}
): Question {
  const id = 1
  return {
    _id: id,
    id,
    questionText: faker.lorem.sentence(),
    possibleAnswers: [
      {
        txt: faker.lorem.sentence(),
        val: 'a',
      },
      {
        txt: faker.lorem.sentence(),
        val: 'b',
      },
      {
        txt: faker.lorem.sentence(),
        val: 'c',
      },
      {
        txt: faker.lorem.sentence(),
        val: 'd',
      },
    ],
    correctAnswer: 'a',
    category: 'test-category',
    subcategory: 'test-subcategory',
    imageSrc: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

export function serializeRoleContext(roleContext: RoleContext) {
  return {
    roles: roleContext.roles,
    activeRole: roleContext.activeRole,
    legacyRole: roleContext.legacyRole,
  }
}

export function buildRegisterUser(
  overrides: Partial<{
    id: Uuid
    firstName: string
    email: string
    userType: string
    isAdmin: boolean
    proxyEmail?: string | undefined
  }> = {}
) {
  const user = buildUser()
  return {
    id: user.id,
    firstName: user.firstName,
    email: user.email,
    userType: 'student',
    proxyEmail: user.proxyEmail,
    isAdmin: false,
    ...overrides,
  }
}

export function buildCreatedVolunteer(
  overrides: Partial<CreatedVolunteer> = {}
): CreatedVolunteer {
  const volunteer = buildVolunteer()
  return {
    id: volunteer.id,
    email: volunteer.email,
    phone: volunteer.phone,
    firstName: volunteer.firstName,
    lastName: volunteer.lastName,
    volunteerPartnerOrg: volunteer.volunteerPartnerOrg,
    deactivated: volunteer.deactivated,
    testUser: volunteer.isTestUser,
    isAdmin: volunteer.isAdmin,
    smsConsent: true,
    userType: 'volunteer',
    banType: volunteer.banType,
    signupSourceId: volunteer.signupSourceId,
    createdAt: volunteer.createdAt,
    ...overrides,
  }
}

export function buildIneligibleStudent(
  overrides: Partial<IneligibleStudentsWithSchoolInfo> = {}
): IneligibleStudentsWithSchoolInfo {
  return {
    createdAt: new Date(),
    updatedAt: new Date(),
    email: getEmail(),
    zipCode: '11201',
    medianIncome: 40000,
    schoolId: getUuid(),
    schoolName: 'Some School',
    schoolState: 'NY',
    schoolCity: 'Brooklyn',
    schoolZipCode: '11201',
    isApproved: false,
    ipAddress: '',
    ...overrides,
  }
}

export function buildZipCode(overrides: Partial<ZipCode> = {}): ZipCode {
  return {
    zipCode: '11201',
    medianIncome: 40000,
    cbsaIncome: 42000,
    stateIncome: 45000,
    isEligible: true,
    ...overrides,
  }
}
