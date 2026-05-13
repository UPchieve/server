import './mocks'
import { faker } from '@faker-js/faker'
import { mocked } from 'jest-mock'
import * as UserRepo from '../../../models/User'
import * as StudentRepo from '../../../models/Student'
import * as StudentPartnerOrgRepo from '../../../models/StudentPartnerOrg'
import * as SignUpSourceRepo from '../../../models/SignUpSource'
import * as UPFRepo from '../../../models/UserProductFlags'
import * as UserActionRepo from '../../../models/UserAction'
import * as UsersSchoolsRepo from '../../../models/UsersSchools'
import * as UsersGradeLevelsRepo from '../../../models/UsersGradeLevels'
import * as MailService from '../../../services/MailService'
import * as AuthUtils from '../../../utils/auth-utils'
import type { RosterStudentPayload } from '../../../services/UserCreationService'

export const mockedUserRepo = mocked(UserRepo)
export const mockedStudentRepo = mocked(StudentRepo)
export const mockedStudentPartnerOrgRepo = mocked(StudentPartnerOrgRepo)
export const mockedSignUpSourceRepo = mocked(SignUpSourceRepo)
export const mockedUPFRepo = mocked(UPFRepo)
export const mockedUserActionRepo = mocked(UserActionRepo)
export const mockedUsersSchoolsRepo = mocked(UsersSchoolsRepo)
export const mockedUsersGradeLevelsRepo = mocked(UsersGradeLevelsRepo)
export const mockedMailService = mocked(MailService)
export const mockedAuthUtils = mocked(AuthUtils)

export const ROSTER_SIGNUP_SOURCE_ID = 7
export const HASHED_PASSWORD_RESOLVED = 'iamnowhashedhehe' // pragma: allowlist secret
export const DEFAULT_TEST_PASSWORD = 'Password123' // pragma: allowlist secret

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
