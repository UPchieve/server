import './mocks'
import { faker } from '@faker-js/faker'
import { mocked } from 'jest-mock'
import * as UserRepo from '../../../models/User'
import * as StudentRepo from '../../../models/Student'
import * as TeacherRepo from '../../../models/Teacher'
import * as StudentPartnerOrgRepo from '../../../models/StudentPartnerOrg'
import * as SignUpSourceRepo from '../../../models/SignUpSource'
import * as UPFRepo from '../../../models/UserProductFlags'
import * as UserActionRepo from '../../../models/UserAction'
import * as FedCredRepo from '../../../models/FederatedCredential'
import * as UsersSchoolsRepo from '../../../models/UsersSchools'
import * as UsersGradeLevelsRepo from '../../../models/UsersGradeLevels'
import * as AuthService from '../../../services/AuthService'
import * as EligibilityService from '../../../services/EligibilityService'
import * as MailService from '../../../services/MailService'
import * as ReferralService from '../../../services/ReferralService'
import * as TeacherService from '../../../services/TeacherService'
import * as AuthUtils from '../../../utils/auth-utils'
import type { RosterStudentPayload } from '../../../services/UserCreationService'

export const mockedUserRepo = mocked(UserRepo)
export const mockedStudentRepo = mocked(StudentRepo)
export const mockedTeacherRepo = mocked(TeacherRepo)
export const mockedStudentPartnerOrgRepo = mocked(StudentPartnerOrgRepo)
export const mockedSignUpSourceRepo = mocked(SignUpSourceRepo)
export const mockedUPFRepo = mocked(UPFRepo)
export const mockedUserActionRepo = mocked(UserActionRepo)
export const mockedFedCredRepo = mocked(FedCredRepo)
export const mockedUsersSchoolsRepo = mocked(UsersSchoolsRepo)
export const mockedUsersGradeLevelsRepo = mocked(UsersGradeLevelsRepo)
export const mockedAuthService = mocked(AuthService)
export const mockedEligibilityService = mocked(EligibilityService)
export const mockedMailService = mocked(MailService)
export const mockedReferralService = mocked(ReferralService)
export const mockedTeacherService = mocked(TeacherService)
export const mockedAuthUtils = mocked(AuthUtils)

export const ROSTER_SIGNUP_SOURCE_ID = 7
export const OTHER_SIGNUP_SOURCE_ID = 6
export const HASHED_PASSWORD_RESOLVED = 'iamnowhashedhehe' // pragma: allowlist secret
export const DEFAULT_TEST_PASSWORD = 'Password123' // pragma: allowlist secret
export const RESET_TOKEN = 'resettoken' // pragma: allowlist secret

export function buildRosterStudent(
  overrides: Partial<RosterStudentPayload> = {}
): RosterStudentPayload {
  return {
    email: faker.internet.email(),
    firstName: faker.person.firstName(),
    gradeLevel: '8',
    lastName: faker.person.lastName(),
    password: DEFAULT_TEST_PASSWORD,
    ...overrides,
  }
}

export function mockUpsertedUser(
  student: RosterStudentPayload,
  { id, isCreated }: { id: string; isCreated: boolean }
) {
  mockedUserRepo.upsertUser.mockResolvedValue({
    id,
    email: student.email,
    firstName: student.firstName,
    proxyEmail: student.proxyEmail,
    isCreated,
  })
}

export function setupExistingRosterStudent(
  student: RosterStudentPayload,
  {
    userId,
    spo,
  }: {
    userId: string
    spo?: { partnerId: string; schoolId: string }
  }
) {
  mockedUserRepo.getUserIdByEmail.mockResolvedValue({
    id: userId,
    email: student.email,
  })
  mockUpsertedUser(student, { id: userId, isCreated: false })
  mockedStudentPartnerOrgRepo.getStudentPartnerOrgBySchoolId.mockResolvedValue(
    spo as unknown as Awaited<
      ReturnType<typeof StudentPartnerOrgRepo.getStudentPartnerOrgBySchoolId>
    >
  )
  mockedStudentPartnerOrgRepo.deactivateUserStudentPartnerOrgInstance.mockResolvedValue(
    true
  )
  return { userId }
}

type Identified = { email: string; firstName: string }

export function buildStudent<T extends Record<string, unknown>>(
  overrides: T = {} as T
) {
  return {
    email: faker.internet.email(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    password: DEFAULT_TEST_PASSWORD as string | undefined,
    ...overrides,
  }
}

export function buildTeacher<T extends Record<string, unknown>>(
  overrides: T = {} as T
) {
  return {
    email: faker.internet.email(),
    firstName: faker.person.firstName(),
    ip: faker.internet.ip(),
    lastName: faker.person.lastName(),
    password: DEFAULT_TEST_PASSWORD as string | undefined,
    ...overrides,
  }
}

export function mockCreatedUser(input: Identified, { id }: { id: string }) {
  mockedUserRepo.createUser.mockResolvedValue({
    id,
    email: input.email,
    firstName: input.firstName,
  })
}

export function installAuthAndSignupMocks(
  signupSourceName: 'Roster' | 'Other'
) {
  mockedAuthUtils.hashPassword.mockResolvedValue(HASHED_PASSWORD_RESOLVED)
  mockedSignUpSourceRepo.getSignUpSourceByName.mockResolvedValue({
    id:
      signupSourceName === 'Roster'
        ? ROSTER_SIGNUP_SOURCE_ID
        : OTHER_SIGNUP_SOURCE_ID,
    name: signupSourceName,
  })
}
