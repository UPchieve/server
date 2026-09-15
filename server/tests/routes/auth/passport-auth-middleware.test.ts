import { mocked } from 'jest-mock'
import { Request } from 'express'
import type { TCleverPassportProfile } from '../../../router/auth/clever-strategy'
import { handleSSOStrategy } from '../../../router/auth/passport-auth-middleware'
import * as FedCredService from '../../../services/FederatedCredentialService'
import * as UserCreationService from '../../../services/UserCreationService'
import * as UserRepo from '../../../models/User/queries'
import { SsoProviderNames } from '../../../utils/auth-utils'

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
