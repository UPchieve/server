import moment from 'moment-timezone'
import faker from 'faker'
import { Test } from 'supertest'
import { Types } from 'mongoose'
import base64url from 'base64url'
import { merge } from 'lodash'
import {
  COLLEGE_CERTS,
  COLLEGE_SUBJECTS,
  MATH_CERTS,
  PHOTO_ID_STATUS,
  REFERENCE_STATUS,
  SAT_CERTS,
  SCIENCE_CERTS,
  READING_WRITING_CERTS,
  TRAINING
} from '../constants'
import { Message } from '../models/Message'
import { AvailabilitySnapshot } from '../models/Availability/Snapshot'
import { AvailabilityHistory } from '../models/Availability/History'
import { UserAction } from '../models/UserAction'
import {
  Availability,
  AvailabilityDay,
  DAYS,
  HOURS
} from '../models/Availability/types'
import {
  Certifications,
  Reference,
  TrainingCourses,
  Volunteer
} from '../models/Volunteer'
import { User } from '../models/User'
import { Student } from '../models/Student'
import { Session } from '../models/Session'
import { FeedbackVersionOne, FeedbackVersionTwo } from '../models/Feedback'
import {
  StudentRegData,
  PartnerStudentRegData,
  VolunteerRegData,
  PartnerVolunteerRegData
} from '../utils/auth-utils'
import { Notification } from '../models/Notification'
import { PushToken } from '../models/PushToken'
import { UserSessionMetrics } from '../models/UserSessionMetrics'
export const getEmail = faker.internet.email
export const getFirstName = faker.name.firstName
export const getLastName = faker.name.lastName
export const generateSentence = faker.lorem.sentence
export const getObjectId = Types.ObjectId
export const getStringObjectId = () => getObjectId().toString()
export const getUUID = faker.datatype.uuid
export const getId = faker.random.uuid
export const getIpAddress = faker.internet.ip
export const getUserAgent = faker.internet.userAgent

const generateReferralCode = (userId): string =>
  base64url(Buffer.from(userId, 'hex'))

export const getDayOfWeek = (): string => {
  return moment()
    .tz('America/New_York')
    .format('dddd')
}

export const getPhoneNumber = (): string => {
  const phoneNumber = faker.phone.phoneNumberFormat(0)
  const formattedPhoneNumber = phoneNumber.replace(/-/g, '')
  return `+1${formattedPhoneNumber}`
}

export function hugeText() {
  return faker.lorem.words(300)
}

// @todo: Figure out how to use with MATH_CERTS, SCIENCE_CERTS
export const buildCertifications = (overrides = {}): Certifications => {
  return {
    [MATH_CERTS.PREALGREBA]: { passed: false, tries: 0 },
    [MATH_CERTS.ALGEBRA]: { passed: false, tries: 0 },
    [MATH_CERTS.GEOMETRY]: { passed: false, tries: 0 },
    [MATH_CERTS.TRIGONOMETRY]: { passed: false, tries: 0 },
    [MATH_CERTS.PRECALCULUS]: { passed: false, tries: 0 },
    [MATH_CERTS.CALCULUS_AB]: { passed: false, tries: 0 },
    [MATH_CERTS.CALCULUS_BC]: { passed: false, tries: 0 },
    [MATH_CERTS.STATISTICS]: { passed: false, tries: 0 },
    [SCIENCE_CERTS.BIOLOGY]: { passed: false, tries: 0 },
    [SCIENCE_CERTS.CHEMISTRY]: { passed: false, tries: 0 },
    [SCIENCE_CERTS.PHYSICS_ONE]: { passed: false, tries: 0 },
    [SCIENCE_CERTS.PHYSICS_TWO]: { passed: false, tries: 0 },
    [SCIENCE_CERTS.ENVIRONMENTAL_SCIENCE]: { passed: false, tries: 0 },
    [COLLEGE_CERTS.ESSAYS]: { passed: false, tries: 0 },
    [COLLEGE_CERTS.FINANCIAL_AID]: { passed: false, tries: 0 },
    [COLLEGE_CERTS.SPORTS_RECRUITMENT_PLANNING]: { passed: false, tries: 0 },
    [COLLEGE_SUBJECTS.PLANNING]: { passed: false, tries: 0 },
    [COLLEGE_SUBJECTS.APPLICATIONS]: { passed: false, tries: 0 },
    [SAT_CERTS.SAT_MATH]: { passed: false, tries: 0 },
    [SAT_CERTS.SAT_READING]: { passed: false, tries: 0 },
    [TRAINING.UPCHIEVE_101]: { passed: false, tries: 0 },
    [TRAINING.TUTORING_SKILLS]: { passed: false, tries: 0 },
    [TRAINING.COLLEGE_COUNSELING]: { passed: false, tries: 0 },
    [TRAINING.COLLEGE_SKILLS]: { passed: false, tries: 0 },
    [TRAINING.SAT_STRATEGIES]: { passed: false, tries: 0 },
    [READING_WRITING_CERTS.HUMANITIES_ESSAYS]: { passed: false, tries: 0 },
    ...overrides
  }
}

export const buildTrainingCourses = (overrides = {}): TrainingCourses => {
  return {
    [TRAINING.UPCHIEVE_101]: {
      isComplete: false,
      progress: 0,
      completedMaterials: []
    },
    [TRAINING.TUTORING_SKILLS]: {
      isComplete: false,
      progress: 0,
      completedMaterials: []
    },
    [TRAINING.COLLEGE_COUNSELING]: {
      isComplete: false,
      progress: 0,
      completedMaterials: []
    },
    [TRAINING.COLLEGE_SKILLS]: {
      isComplete: false,
      progress: 0,
      completedMaterials: []
    },
    [TRAINING.SAT_STRATEGIES]: {
      isComplete: false,
      progress: 0,
      completedMaterials: []
    },
    ...overrides
  }
}

export const buildAvailability = (overrides = {}): Availability => {
  const availability = {} as Availability
  for (const day in DAYS) {
    availability[DAYS[day]] = {}
    for (const hour in HOURS) {
      availability[DAYS[day]][HOURS[hour]] = false
    }
  }

  const mergedAvailability = merge(availability, overrides)

  return mergedAvailability
}

export const buildAvailabilitySnapshot = (
  overrides = {}
): AvailabilitySnapshot => {
  const currentDate = new Date()
  return {
    _id: Types.ObjectId(),
    onCallAvailability: buildAvailability(),
    modifiedAt: currentDate,
    createdAt: currentDate,
    timezone: 'America/New_York',
    volunteerId: Types.ObjectId(),
    ...overrides
  }
}

export const buildAvailabilityHistory = (
  overrides = {}
): AvailabilityHistory => {
  const currentDate = new Date()
  return {
    _id: Types.ObjectId(),
    availability: buildAvailability()[getDayOfWeek()],
    date: currentDate,
    modifiedAt: currentDate,
    createdAt: currentDate,
    timezone: 'America/New_York',
    volunteerId: Types.ObjectId(),
    ...overrides
  }
}
export function buildUser(overrides = {}) {
  const _id = getObjectId()
  return {
    _id,
    createdAt: new Date(),
    email: getEmail().toLowerCase(),
    password: 'Password123',
    verified: true,
    verifiedEmail: true,
    verifiedPhone: true,
    verificationToken: '',
    passwordResetToken: '',
    firstname: getFirstName(),
    lastname: getLastName(),
    phone: getPhoneNumber(),
    college: '',
    isVolunteer: false,
    isAdmin: false,
    isBanned: false,
    banReason: undefined,
    isTestUser: false,
    isFakeUser: false,
    isDeactivated: false,
    pastSessions: [],
    partnerUserId: null,
    lastActivityAt: new Date(),
    referralCode: generateReferralCode(_id.toString()),
    referredBy: null,
    ipAddresses: [],
    type: '',
    hashPassword: () => '',
    ...overrides
  }
}

export const buildStudent = (overrides = {}): Student => {
  const student = {
    ...buildUser({ type: 'Student', isVolunteer: false }),
    approvedHighschool: getObjectId(),
    zipCode: '11201',
    studentPartnerOrg: 'example',
    partnerSite: '',
    ...overrides
  }

  return student
}

export const buildVolunteer = (overrides = {}): Volunteer => {
  return {
    ...buildUser({ type: 'Volunteer', isVolunteer: true }),
    college: 'Columbia University',
    isApproved: false,
    isOnboarded: false,
    certifications: buildCertifications(),
    availability: buildAvailability(),
    subjects: [],
    trainingCourses: buildTrainingCourses(),
    sentReadyToCoachEmail: false,
    hoursTutored: Types.Decimal128.fromString('0'),
    timeTutored: 0,
    elapsedAvailability: 0,
    sentHourSummaryIntroEmail: false,
    volunteerPartnerOrg: undefined,
    isFailsafeVolunteer: false,
    favoriteAcademicSubject: '',
    timezone: 'America/New_York',
    availabilityLastModifiedAt: new Date(),
    photoIdS3Key: '',
    photoIdStatus: undefined,
    references: [],
    occupation: [],
    company: '',
    experience: {
      collegeCounseling: '',
      mentoring: '',
      tutoring: ''
    },
    languages: [],
    country: '',
    state: '',
    city: '',
    totalVolunteerHours: 0,
    linkedInUrl: '',
    sentInactiveThirtyDayEmail: false,
    sentInactiveSixtyDayEmail: false,
    sentInactiveNinetyDayEmail: false,
    ...overrides
  }
}

export const buildStudentRegistrationForm = (
  overrides: Partial<StudentRegData> = {}
): StudentRegData => {
  const student = buildStudent()
  const form = {
    ip: '0.0.0.0',
    firstName: student.firstname,
    lastName: student.lastname,
    email: student.email,
    password: student.password,
    terms: true,
    zipCode: '11201',
    highSchoolId: '111111111111',
    ...overrides
  } as StudentRegData

  return form
}

export const buildPartnerStudentRegistrationForm = (
  overrides: Partial<PartnerStudentRegData> = {}
): PartnerStudentRegData => {
  const student = buildStudent()
  const form = {
    ip: '0.0.0.0',
    firstName: student.firstname,
    lastName: student.lastname,
    email: student.email,
    password: student.password,
    terms: true,
    studentPartnerOrg: 'example',
    studentPartnerSite: 'example.org',
    partnerUserId: '123',
    college: 'UPchieve University',
    ...overrides
  } as PartnerStudentRegData

  return form
}

export const buildVolunteerRegistrationForm = (
  overrides: Partial<VolunteerRegData> = {}
): VolunteerRegData => {
  const volunteer = buildVolunteer()
  const form = {
    ip: '0.0.0.0',
    firstName: volunteer.firstname,
    lastName: volunteer.lastname,
    email: volunteer.email,
    password: volunteer.password,
    phone: volunteer.phone,
    terms: true,
    ...overrides
  } as VolunteerRegData

  return form
}

export const buildPartnerVolunteerRegistrationForm = (
  overrides: Partial<PartnerVolunteerRegData> = {}
): PartnerVolunteerRegData => {
  const volunteer = buildVolunteer()
  const form = {
    ip: '0.0.0.0',
    volunteerPartnerOrg: 'example',
    firstName: volunteer.firstname,
    lastName: volunteer.lastname,
    email: volunteer.email,
    password: volunteer.password,
    phone: volunteer.phone,
    terms: true,
    ...overrides
  } as PartnerVolunteerRegData

  return form
}

export const buildReference = (overrides = {}): Partial<Reference> => {
  const referenceFirstName = getFirstName()
  const referenceLastName = getLastName()
  const referenceEmail = getEmail()
  const reference = {
    _id: Types.ObjectId(),
    firstName: referenceFirstName,
    lastName: referenceLastName,
    email: referenceEmail,
    ...overrides
  }

  return reference
}

export const buildReferenceForm = (overrides = {}): Partial<Reference> => {
  const randomNumToSix = (): number => Math.floor(Math.random() * 6) + 1
  const randomNumToFive = (): number => Math.floor(Math.random() * 5) + 1
  const form = {
    affiliation: faker.lorem.word(),
    relationshipLength: faker.lorem.word(),
    rejectionReason: faker.lorem.word(),
    additionalInfo: faker.lorem.sentence(),
    patient: randomNumToSix(),
    positiveRoleModel: randomNumToSix(),
    agreeableAndApproachable: randomNumToSix(),
    communicatesEffectively: randomNumToSix(),
    trustworthyWithChildren: randomNumToFive(),
    status: REFERENCE_STATUS.SUBMITTED,
    ...overrides
  }

  return form
}

export const buildReferenceWithForm = (overrides = {}): Partial<Reference> => {
  const data = {
    ...buildReferenceForm(),
    ...buildReference(),
    ...overrides
  }

  return data
}

export const buildPhotoIdData = (overrides = {}): Partial<Volunteer> => {
  const data = {
    photoIdS3Key: getUUID(),
    photoIdStatus: PHOTO_ID_STATUS.SUBMITTED,
    ...overrides
  }

  return data
}

export const buildBackgroundInfo = (overrides = {}): Partial<Volunteer> => {
  const data = {
    occupation: ['An undergraduate student'],
    experience: {
      collegeCounseling: 'No prior experience',
      mentoring: '1-2 years',
      tutoring: '0-1 years'
    },
    languages: ['Spanish'],
    country: 'United States of America',
    state: 'New York',
    city: 'New York City',
    ...overrides
  }

  return data
}

export const buildSession = (overrides = {}): Session => {
  const _id = Types.ObjectId()
  const session = {
    _id,
    student: null,
    volunteer: null,
    type: 'math',
    subTopic: 'algebra',
    messages: [],
    hasWhiteboardDoc: false,
    whiteboardDoc: '',
    quillDoc: '',
    createdAt: new Date(),
    volunteerJoinedAt: null,
    endedAt: null,
    endedBy: null,
    failedJoins: [],
    notifications: [],
    photos: [],
    isReported: false,
    reportReason: null,
    reportMessage: null,
    flags: [],
    reviewed: false,
    toReview: false,
    reviewReasons: [],
    timeTutored: 0,
    ...overrides
  }

  return session
}

export const buildMessage = (overrides = {}): Message => {
  const _id = Types.ObjectId()
  const message = {
    _id,
    user: null,
    contents: faker.lorem.sentence(),
    createdAt: new Date(),
    ...overrides
  }

  return message
}

export const buildPastSessions = (): Types.ObjectId[] => {
  const pastSession = buildSession()
  const pastSessions = [pastSession._id]

  return pastSessions
}

/**
 *
 * @todo: use Partial<Notification> instead of Partial<any>
 * Enums NotificationMethod & NotificationType do not exists at runtime, so
 * a type error like "Cannot read property 'SMS' of undefined" is thrown
 *
 **/
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const buildNotification = (overrides = {}): Notification => {
  const _id = Types.ObjectId()

  const notification = {
    _id,
    sentAt: new Date(),
    // @todo:  use NotificationMethod from models/Notification
    method: 'SMS',
    volunteer: null,
    // @todo:  use NotificationType from models/Notification
    type: 'REGULAR',
    wasSuccessful: true,
    messageId: 'message123',
    ...overrides
  }

  return notification as Notification
}

export const buildUserAction = (
  overrides: Partial<UserAction> = {}
): Partial<UserAction> => {
  const userAction = {
    _id: Types.ObjectId(),
    user: null,
    session: null,
    createdAt: new Date(),
    actionType: null,
    action: null,
    quizCategory: null,
    quizSubcategory: null,
    device: null,
    browser: null,
    browserVersion: null,
    operatingSystem: null,
    operatingSystemVersion: null,
    ipAddress: null,
    referenceEmail: null,
    banReason: null,
    ...overrides
  }

  return userAction
}

export const buildAvailabilityDay = (overrides = {}): AvailabilityDay => {
  const availabilityDay = {
    '12a': false,
    '1a': false,
    '2a': false,
    '3a': false,
    '4a': false,
    '5a': false,
    '6a': false,
    '7a': false,
    '8a': false,
    '9a': false,
    '10a': false,
    '11a': false,
    '12p': false,
    '1p': false,
    '2p': false,
    '3p': false,
    '4p': false,
    '5p': false,
    '6p': false,
    '7p': false,
    '8p': false,
    '9p': false,
    '10p': false,
    '11p': false,
    ...overrides
  }

  return availabilityDay
}

export const buildFeedback = (
  overrides: Partial<FeedbackVersionOne | FeedbackVersionTwo> = {}
): Partial<FeedbackVersionOne | FeedbackVersionTwo> => {
  const feedback = {
    _id: Types.ObjectId(),
    createdAt: new Date(),
    sessionId: null,
    userType: null,
    type: null,
    subTopic: null,
    responseData: {
      'rate-session': { rating: null },
      'session-experience': {
        'easy-to-answer-questions': null,
        'feel-like-helped-student': null,
        'feel-more-fulfilled': null,
        'good-use-of-time': null,
        'plan-on-volunteering-again': null
      },
      'other-feedback': null,
      'rate-upchieve': {
        'achieve-goal': null,
        'easy-to-use': null,
        'get-help-faster': null,
        'use-next-time': null
      },
      'rate-coach': {
        'achieve-goal': null,
        'find-help': null,
        knowledgeable: null,
        nice: null,
        'want-him/her-again': null
      },
      'technical-difficulties': null,
      'asked-unprepared-questions': null,
      'app-features-needed': null
    },
    studentTutoringFeedback: {
      'session-goal': null,
      'subject-understanding': null,
      'coach-rating': null,
      'coach-feedback': null,
      'other-feedback': null
    },
    studentCounselingFeedback: {
      'rate-session': { rating: null },
      'session-goal': null,
      'coach-ratings': {
        'coach-knowedgable': null,
        'coach-friendly': null,
        'coach-help-again': null
      },
      'other-feedback': null
    },
    volunteerFeedback: {
      'session-enjoyable': null,
      'session-improvements': null,
      'student-understanding': null,
      'session-obstacles': [],
      'other-feedback': null
    },
    volunteerId: null,
    studentId: null,
    versionNumber: null,
    ...overrides
  }

  return feedback
}

export function buildUserAgent(overrides = {}) {
  return {
    device: '',
    browser: '',
    browserVersion: '',
    operatingSystem: '',
    operatingSystemVersion: '',
    ...overrides
  }
}

// @todo: return PartialSocket or use a mocked socket
export function buildSocket(overrides = {}) {
  return {
    id: getStringObjectId(),
    connected: true,
    disconnected: false,
    request: {
      headers: {
        'user-agent': ''
      }
    },
    handshake: {
      address: ''
    },
    ...overrides
  }
}

export function buildPushToken(overrides = {}): PushToken {
  return {
    _id: getObjectId(),
    user: getObjectId(),
    createdAt: new Date(),
    token: '123',
    ...overrides
  }
}

export const authLogin = (agent, { email, password }: Partial<User>): Test =>
  agent
    .post('/auth/login')
    .set('Accept', 'application/json')
    .send({ email, password })

export function buildUSM(
  userId: Types.ObjectId,
  counterOverrides: any = {} // TODO: type this better
): UserSessionMetrics {
  return {
    _id: Types.ObjectId(),
    user: userId,
    counters: {
      absentStudent: 0,
      absentVolunteer: 0,
      lowSessionRatingFromCoach: 0,
      lowSessionRatingFromStudent: 0,
      lowCoachRatingFromStudent: 0,
      reported: 0,
      onlyLookingForAnswers: 0,
      rudeOrInappropriate: 0,
      commentFromStudent: 0,
      commentFromVolunteer: 0,
      hasBeenUnmatched: 0,
      hasHadTechnicalIssues: 0,
      ...counterOverrides
    }
  }
}

export function startSession(student: Student): Session {
  const session = buildSession()
  session.student = student._id
  return session
}

export function joinSession(session: Session, volunteer: Volunteer): void {
  session.volunteerJoinedAt = new Date()
  session.volunteer = volunteer._id
}
