import faker from 'faker'
import { ACTIVE_QUIZ_CATEGORIES } from '../../../server/constants'
import {
  IInsertIntoUserQuizzesParams,
  IInsertStudentProfileParams,
  IInsertStudentUserParams,
  IInsertUserCertificationParams,
  IInsertVolunteerProfileParams,
  IInsertVolunteerUserParams,
  IInsertSessionParams,
} from './testData/pg.queries'
import { getDbUlid, NameToId } from './utils'

export const getFirstName = faker.name.firstName
export const getEmail = faker.internet.email

export function buildUserIds(total: number) {
  const ids = []
  for (let i = 0; i < total; i++) {
    ids.push(getDbUlid())
  }
  return ids
}

export function buildStudent(
  overrides: Partial<IInsertStudentUserParams> = {}
) {
  return {
    id: getDbUlid(),
    email: getEmail(),
    password: '$2a$10$z.JMHnbX9IubnNZtqI.FOecTPVY1VTU1DJ6AJGIOT/x/OyAtdw3.y',
    firstName: getFirstName(),
    lastName: 'UPchieve',
    referralCode: getDbUlid(),
    verified: true,
    ...overrides,
  }
}

export function buildStudentProfile(
  userId: string,
  overrides: Partial<IInsertStudentProfileParams> = {}
) {
  return {
    userId: userId,
    studentPartnerOrgId: undefined,
    ...overrides,
  }
}

export function buildVolunteer(
  overrides: Partial<IInsertVolunteerUserParams> = {}
) {
  return {
    id: getDbUlid(),
    email: getEmail(),
    password: '$2a$10$z.JMHnbX9IubnNZtqI.FOecTPVY1VTU1DJ6AJGIOT/x/OyAtdw3.y',
    firstName: getFirstName(),
    lastName: 'UPchieve',
    referralCode: getDbUlid(),
    verified: true,
    // phone: '+12125551212',
    testUser: false,
    timeTutored: (7 * 60 * 60 * 1000).toString(),
    ...overrides,
  }
}

export function buildVolunteerProfile(
  userId: string,
  overrides: Partial<IInsertVolunteerProfileParams> = {}
) {
  return {
    id: userId,
    timezone: 'America/New_York',
    approved: true,
    onboarded: true,
    college: 'Volunteer College',
    volunteerPartnerOrgId: undefined,
    ...overrides,
  }
}

export function buildCerts(
  volunteerId: string,
  certIds: NameToId,
  cert: ACTIVE_QUIZ_CATEGORIES
): IInsertUserCertificationParams {
  return {
    userId: volunteerId,
    certificationId: certIds[cert] as number,
  }
}

export function buildQuizzes(
  volunteerId: string,
  quizIds: NameToId,
  quiz: ACTIVE_QUIZ_CATEGORIES
): IInsertIntoUserQuizzesParams {
  return {
    userId: volunteerId,
    quizId: quizIds[quiz] as number,
    // TODO: fix type
    // @ts-expect-error
    attempts: 1,
    passed: true,
  }
}

export function buildSession(
  studentId: string,
  volunteerId: string,
  subjectId: number,
  overrides: Partial<IInsertSessionParams> = {}
) {
  return {
    id: getDbUlid(),
    studentId,
    volunteerId,
    subjectId,
    ...overrides,
  }
}
