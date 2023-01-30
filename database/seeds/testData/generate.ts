import faker from 'faker'
import {
  IInsertIntoUserQuizzesParams,
  IInsertStudentProfileParams,
  IInsertStudentUserParams,
  IInsertUserCertificationParams,
  IInsertVolunteerProfileParams,
  IInsertVolunteerUserParams,
  IInsertSessionParams,
} from './pg.queries'
import { getDbUlid, NameToId } from '../utils'

export const getFirstName = faker.name.firstName
export const getEmail = faker.internet.email
export const getPhone = faker.phone.phoneNumber

export function buildUserIds(total: number) {
  const ids = []
  for (let i = 0; i < total; i++) {
    ids.push(getDbUlid())
  }
  return ids
}

export function buildStudent(
  overrides: Partial<IInsertStudentUserParams> = {}
): IInsertStudentUserParams {
  return Object.assign(
    {
      id: getDbUlid(),
      email: getEmail(),
      password: '$2a$10$z.JMHnbX9IubnNZtqI.FOecTPVY1VTU1DJ6AJGIOT/x/OyAtdw3.y',
      firstName: getFirstName(),
      lastName: 'UPchieve',
      referralCode: getDbUlid(),
      verified: true,
    },
    overrides
  )
}

type StudentProfileOverrides = {
  userId: string
  studentPartnerOrgId?: string
  schoolId?: string
} & Partial<IInsertStudentProfileParams>

export function buildStudentProfile(
  overrides: StudentProfileOverrides
): IInsertStudentProfileParams {
  return Object.assign(
    {
      userId: overrides.userId,
      studentPartnerOrgId: undefined,
      schoolId: undefined,
    },
    overrides
  )
}

export function buildVolunteer(
  overrides: Partial<IInsertVolunteerUserParams> = {}
): IInsertVolunteerUserParams {
  return Object.assign(
    {
      id: getDbUlid(),
      email: getEmail(),
      password: '$2a$10$z.JMHnbX9IubnNZtqI.FOecTPVY1VTU1DJ6AJGIOT/x/OyAtdw3.y',
      firstName: getFirstName(),
      lastName: 'UPchieve',
      referralCode: getDbUlid(),
      verified: true,
      phone: getPhone(),
      testUser: false,
      timeTutored: (7 * 60 * 60 * 1000).toString(),
    },
    overrides
  )
}

type VolunteerProfileOverrides = {
  userId: string
} & Partial<IInsertVolunteerProfileParams>

export function buildVolunteerProfile(
  overrides: VolunteerProfileOverrides
): IInsertVolunteerProfileParams {
  return Object.assign(
    {
      id: overrides.userId,
      timezone: 'America/New_York',
      approved: true,
      onboarded: true,
      college: 'Volunteer College',
      volunteerPartnerOrgId: undefined,
    },
    overrides
  )
}

type CertOverrides = {
  volunteerId: string
  certIds: NameToId
  cert: string
} & Partial<IInsertUserCertificationParams>

export function buildCerts(
  overrides: CertOverrides
): IInsertUserCertificationParams {
  return Object.assign(
    {
      userId: overrides.volunteerId,
      certificationId: overrides.certIds[overrides.cert] as number,
    },
    overrides
  )
}

type QuizOverrides = {
  volunteerId: string
  quizIds: NameToId
  quiz: string
} & Partial<IInsertIntoUserQuizzesParams>

export function buildQuizzes(
  overrides: QuizOverrides
): IInsertIntoUserQuizzesParams {
  return Object.assign(
    {
      userId: overrides.volunteerId,
      quizId: overrides.quizIds[overrides.quiz] as number,
      attempts: 1,
      passed: true,
    },
    overrides
  )
}

type SessionOverrides = {
  studentId: string
  volunteerId: string
  subjectId: number
} & Partial<IInsertSessionParams>

export function buildSession(overrides: SessionOverrides) {
  return Object.assign({ id: getDbUlid() }, overrides)
}
