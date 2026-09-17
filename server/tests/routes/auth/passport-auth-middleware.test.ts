import { mocked } from 'jest-mock'
import { Request } from 'express'
import type { Profile } from 'passport'
import type { TCleverPassportProfile } from '../../../router/auth/clever-strategy'
import {
  handleSSOStrategy,
  passportRegisterUser,
} from '../../../router/auth/passport-auth-middleware'
import * as FedCredService from '../../../services/FederatedCredentialService'
import * as UserCreationService from '../../../services/UserCreationService'
import * as UserRepo from '../../../models/User/queries'
import { SsoProviderNames } from '../../../utils/auth-utils'
import { buildRegisterUser } from '../../mocks/generate'

jest.mock('../../../models/User/queries')
jest.mock('../../../services/FederatedCredentialService')
jest.mock('../../../services/UserCreationService')
jest.mock('../../../logger')

const mockedFedCredService = mocked(FedCredService)
const mockedUserCreationService = mocked(UserCreationService)
const mockedUserRepo = mocked(UserRepo)

const TEACHER_ID = 'teacher-user-id'
const CLEVER_PROFILE = {
  id: 'clever-teacher-1',
  issuer: 'https://clever.com',
  name: { givenName: 'A', familyName: 'Teacher' },
  emails: [{ value: 'teacher@example.edu' }],
  provider: 'Clever',
  userType: 'teacher',
  schoolId: 'school-uuid',
  teacher: {
    classes: [{ id: 'cc-1', name: 'CleverClass1', subject: 'math' }],
    students: [{ id: 'cs-1' }],
  },
} as unknown as TCleverPassportProfile

const rosterTeacherFn = jest.fn()

async function signInWithClever() {
  const done = jest.fn()
  await handleSSOStrategy({ session: {} } as Request, CLEVER_PROFILE, done, {
    providerName: SsoProviderNames.CLEVER,
    isStudent: () => false,
    isTeacher: () => true,
    rosterTeacherFn,
  })
  return done
}

describe('Clever SSO teacher sign-in when rostering fails', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    // Rostering is a side effect of signing in; a teacher whose roster we
    // cannot process still owns their account.
    rosterTeacherFn.mockRejectedValue(
      new Error('Could not roster a student in the class.')
    )
  })

  test('signs in a teacher who has signed in with Clever before', async () => {
    mockedFedCredService.getFedCredForUser.mockResolvedValue({
      userId: TEACHER_ID,
      profileId: CLEVER_PROFILE.id,
      issuer: CLEVER_PROFILE.issuer,
    })

    const done = await signInWithClever()

    expect(rosterTeacherFn).toHaveBeenCalledWith(
      TEACHER_ID,
      CLEVER_PROFILE.teacher?.classes,
      CLEVER_PROFILE.teacher?.students
    )
    expect(done).toHaveBeenCalledWith(null, { id: TEACHER_ID })
  })

  test('links and signs in a teacher with a verified email', async () => {
    mockedFedCredService.getFedCredForUser.mockResolvedValue(undefined)
    mockedUserRepo.getUserVerificationByEmail.mockResolvedValue({
      id: TEACHER_ID,
      email: 'teacher@example.edu',
      emailVerified: true,
      phoneVerified: false,
      verified: true,
    })

    const done = await signInWithClever()

    expect(rosterTeacherFn).toHaveBeenCalled()
    expect(mockedFedCredService.linkAccount).toHaveBeenCalledWith(
      CLEVER_PROFILE.id,
      CLEVER_PROFILE.issuer,
      TEACHER_ID
    )
    expect(done).toHaveBeenCalledWith(null, { id: TEACHER_ID })
  })

  test('registers and signs in a brand new teacher', async () => {
    mockedFedCredService.getFedCredForUser.mockResolvedValue(undefined)
    mockedUserRepo.getUserVerificationByEmail.mockResolvedValue(undefined)
    mockedUserCreationService.registerTeacher.mockResolvedValue({
      id: TEACHER_ID,
      isAdmin: false,
      userType: 'teacher',
      firstName: 'A',
      proxyEmail: undefined,
      email: 'teacher@example.edu',
    })

    const done = await signInWithClever()

    expect(rosterTeacherFn).toHaveBeenCalled()
    expect(done).toHaveBeenCalledWith(
      null,
      expect.objectContaining({ id: TEACHER_ID })
    )
  })
})

const PROVIDER_EMAIL = 'provider-owned@example.org'
const VICTIM_EMAIL = 'victim@example.org'
const NEW_STUDENT = buildRegisterUser()
const GOOGLE_ISSUER = 'https://accounts.google.com'
const GOOGLE_PROFILE: Profile = {
  provider: 'google',
  id: 'google-sub',
  displayName: 'Ada Lovelace',
  name: { givenName: 'Ada', familyName: 'Lovelace' },
  emails: [{ value: PROVIDER_EMAIL }],
}
const CLEVER_STUDENT_PROFILE = {
  id: 'clever-sub',
  issuer: 'https://clever.com',
  userType: 'student',
  name: { givenName: 'Ada', familyName: 'Lovelace' },
  emails: [{ value: PROVIDER_EMAIL }],
} as unknown as TCleverPassportProfile

// What the browser can put on the /auth/sso query: identity keys it must not control, and
// signup context the provider knows nothing about.
const SIGNUP_QUERY = {
  email: VICTIM_EMAIL,
  firstName: 'Mallory',
  lastName: 'Forged',
  issuer: 'https://forged.example',
  profileId: 'forged-sub',
  gradeLevel: '10th',
  studentPartnerOrgKey: 'partner-org',
}

async function signUpWithClever(profile: TCleverPassportProfile) {
  const done = jest.fn()
  await handleSSOStrategy(
    { session: { sso: { userData: SIGNUP_QUERY } } } as unknown as Request,
    profile,
    done,
    {
      providerName: SsoProviderNames.CLEVER,
      isStudent: () => true,
      isTeacher: () => false,
    }
  )
  return done
}

describe('SSO signup takes the account identity from the provider', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    mockedFedCredService.getFedCredForUser.mockResolvedValue(undefined)
    mockedUserCreationService.registerStudent.mockResolvedValue(NEW_STUDENT)
    // Only the query's email has an account, so a lookup by it would find and link that account.
    mockedUserRepo.getUserVerificationByEmail.mockImplementation(
      async (email: string) =>
        email === VICTIM_EMAIL
          ? {
              id: 'victim',
              email: VICTIM_EMAIL,
              emailVerified: true,
              phoneVerified: false,
              verified: true,
            }
          : undefined
    )
  })

  test('Clever: the provider owns the identity, the query only adds context', async () => {
    const done = await signUpWithClever(CLEVER_STUDENT_PROFILE)

    expect(mockedUserRepo.getUserVerificationByEmail.mock.calls).toEqual([
      [PROVIDER_EMAIL],
    ])
    expect(mockedUserCreationService.registerStudent).toHaveBeenCalledWith(
      expect.objectContaining({
        email: PROVIDER_EMAIL,
        firstName: 'Ada',
        lastName: 'Lovelace',
        gradeLevel: '10th',
        studentPartnerOrgKey: 'partner-org',
      }),
      {
        issuer: CLEVER_STUDENT_PROFILE.issuer,
        profileId: CLEVER_STUDENT_PROFILE.id,
      }
    )
    expect(done).toHaveBeenCalledWith(null, NEW_STUDENT)
  })

  test('Clever: with no provider email, collects one instead of using the query email', async () => {
    const done = await signUpWithClever({
      ...CLEVER_STUDENT_PROFILE,
      emails: [],
    } as unknown as TCleverPassportProfile)

    expect(mockedUserRepo.getUserVerificationByEmail).not.toHaveBeenCalled()
    expect(done).toHaveBeenCalledWith(null, false, {
      profileId: CLEVER_STUDENT_PROFILE.id,
      issuer: CLEVER_STUDENT_PROFILE.issuer,
      firstName: 'Ada',
      lastName: 'Lovelace',
    })
  })

  test('Google: the provider owns the identity, the query only adds context', async () => {
    const done = jest.fn()

    await passportRegisterUser(
      GOOGLE_PROFILE,
      GOOGLE_ISSUER,
      SsoProviderNames.GOOGLE,
      'student',
      SIGNUP_QUERY,
      done
    )

    expect(mockedUserRepo.getUserVerificationByEmail.mock.calls).toEqual([
      [PROVIDER_EMAIL],
    ])
    expect(mockedUserCreationService.registerStudent).toHaveBeenCalledWith(
      expect.objectContaining({
        email: PROVIDER_EMAIL,
        firstName: 'Ada',
        lastName: 'Lovelace',
        gradeLevel: '10th',
        studentPartnerOrgKey: 'partner-org',
      }),
      { issuer: GOOGLE_ISSUER, profileId: GOOGLE_PROFILE.id }
    )
    expect(done).toHaveBeenCalledWith(null, NEW_STUDENT)
  })
})
