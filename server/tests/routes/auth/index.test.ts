import request, { Response } from 'supertest'
import { mocked } from 'jest-mock'
import { Request as ExpressRequest, Response as ExpressResponse } from 'express'
import passport from 'passport'
import * as AuthRouter from '../../../router/auth'
import * as AuthService from '../../../services/AuthService'
import * as UserCreationService from '../../../services/UserCreationService'
import * as StudentService from '../../../services/StudentService'
import * as FedCredService from '../../../services/FederatedCredentialService'
import * as UserRolesService from '../../../services/UserRolesService'
import * as UserAction from '../../../models/UserAction'
import * as UserQueries from '../../../models/User/queries'
import * as LegacyUser from '../../../models/User/legacy-user'
import {
  buildCreatedVolunteer,
  buildLegacyUser,
  buildRegisterUser,
  buildStudent,
  buildStudentPartnerOrg,
  buildUser,
  buildVolunteer,
  buildVolunteerPartnerOrg,
  getEmail,
  getLastName,
  getPhoneNumber,
  serializeRoleContext,
} from '../../mocks/generate'
import { mockApp, mockPassportMiddleware } from '../../mock-app'
import { ACCOUNT_USER_ACTIONS } from '../../../constants'
import { RoleContext } from '../../../services/UserRolesService'
import { AppUser } from '../../types'
import { getUuid } from '../../../models/pgUtils'

jest.mock('../../../services/AuthService')
jest.mock('../../../services/UserCreationService')
jest.mock('../../../services/StudentService')
jest.mock('../../../services/FederatedCredentialService')
jest.mock('../../../services/UserRolesService', () => {
  const actual = jest.requireActual('../../../services/UserRolesService')
  return {
    ...actual,
    switchActiveRole: jest.fn(),
  }
})
jest.mock('../../../models/UserAction')
jest.mock('../../../models/User/queries')
jest.mock('../../../models/User/legacy-user')
jest.mock('../../../router/auth/passport-auth-middleware')
jest.mock('../../../logger')
jest.mock('passport', () => ({
  authenticate: jest.fn(() => {
    return (_req: ExpressRequest, _res: ExpressResponse, next?: Function) => {
      if (next) return next()
    }
  }),
}))
jest.mock('../../../utils/auth-utils', () => {
  const actual = jest.requireActual('../../../utils/auth-utils')
  function isAdmin(
    _req: ExpressRequest,
    _res: ExpressResponse,
    next: () => void
  ) {
    next()
  }
  function checkRecaptcha(
    _req: ExpressRequest,
    _res: ExpressResponse,
    next: () => void
  ) {
    next()
  }

  return {
    ...actual,
    authPassport: {
      ...actual.authPassport,
      isAdmin,
      checkRecaptcha,
      isTotpSessionValid: jest.fn(),
    },
  }
})

const mockedAuthService = mocked(AuthService)
const mockedUserCreationService = mocked(UserCreationService)
const mockedStudentService = mocked(StudentService)
const mockedFedCredService = mocked(FedCredService)
const mockedUserRolesService = mocked(UserRolesService)
const mockedUserAction = mocked(UserAction)
const mockedUserQueries = mocked(UserQueries)
const mockedLegacyUser = mocked(LegacyUser)
const mockedPassport = mocked(passport)

const US_IP_ADDRESS = '161.185.160.93'
const AUTH_ROUTE = '/auth'

let mockUser = buildUser()
const asyncLogin = jest.fn()
const asyncLogout = jest.fn()

function mockGetUser() {
  return mockUser
}

const app = mockApp()
app.use(mockPassportMiddleware(mockGetUser, asyncLogin, asyncLogout, jest.fn()))
AuthRouter.routes(app)

const agent = request.agent(app)

function sendGet(path: string): Promise<Response> {
  return agent
    .get(AUTH_ROUTE + path)
    .set('X-Forwarded-For', US_IP_ADDRESS)
    .set('Accept', 'application/json')
}

function sendGetQuery(
  path: string,
  payload?: Record<string, unknown>
): Promise<Response> {
  return agent
    .get(AUTH_ROUTE + path)
    .set('X-Forwarded-For', US_IP_ADDRESS)
    .set('Accept', 'application/json')
    .query(payload ?? {})
}

function sendPost(
  path: string,
  payload?: Record<string, unknown>
): Promise<Response> {
  return agent
    .post(AUTH_ROUTE + path)
    .set('X-Forwarded-For', US_IP_ADDRESS)
    .set('Accept', 'application/json')
    .send(payload)
}

const password = 'Password123'

describe('AuthRouter.routes', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    mockUser = buildUser()
    asyncLogin.mockReset()
    asyncLogout.mockReset()
    asyncLogin.mockResolvedValue(undefined)
    asyncLogout.mockResolvedValue(undefined)
  })

  describe('GET /auth/status', () => {
    test('returns unauthenticated when req.user does not exist', async () => {
      mockUser = undefined as unknown as AppUser

      const response = await sendGet('/status')
      expect(response.status).toBe(200)
      expect(response.body).toEqual({ authenticated: false })
    })

    test('returns authenticated for non-admin user', async () => {
      mockUser = buildUser({ isAdmin: false })

      const response = await sendGet('/status')
      expect(response.status).toBe(200)
      expect(response.body).toEqual({ authenticated: true })
    })

    test('returns authenticated admin status with totp state', async () => {
      const { authPassport } = jest.requireMock('../../../utils/auth-utils')
      authPassport.isTotpSessionValid.mockReturnValueOnce(true)
      mockUser = buildUser({ isAdmin: true })

      const response = await sendGet('/status')
      expect(response.status).toBe(200)
      expect(authPassport.isTotpSessionValid).toHaveBeenCalled()
      expect(response.body).toEqual({
        authenticated: true,
        isAdmin: true,
        totpVerified: true,
      })
    })
  })

  describe('GET /auth/logout', () => {
    test('logs out and tracks logout action when user exists', async () => {
      const response = await sendGet('/logout')

      expect(response.status).toBe(200)
      expect(asyncLogout).toHaveBeenCalledTimes(1)
      expect(response.body).toEqual({
        msg: 'You have been logged out!',
      })
      expect(mockedUserAction.createAccountAction).toHaveBeenCalledWith({
        userId: mockUser.id,
        action: ACCOUNT_USER_ACTIONS.LOGGED_OUT,
        ipAddress: expect.any(String),
      })
    })

    test('logs out and does not track action when user does not exist', async () => {
      mockUser = undefined as unknown as AppUser

      const response = await sendGet('/logout')
      expect(response.status).toBe(200)
      expect(asyncLogout).toHaveBeenCalledTimes(1)
      expect(mockedUserAction.createAccountAction).not.toHaveBeenCalled()
    })
  })

  describe('POST /auth/login', () => {
    test('returns legacy user and tracks login', async () => {
      const user = buildLegacyUser()
      mockedLegacyUser.getLegacyUserObject.mockResolvedValueOnce(user)

      const response = await sendPost('/login', {
        email: user.email,
        password,
      })
      expect(response.status).toBe(200)
      expect(mockedLegacyUser.getLegacyUserObject).toHaveBeenCalledWith(
        mockUser.id
      )
      expect(mockedUserAction.createAccountAction).toHaveBeenCalledWith({
        userId: user.id,
        action: ACCOUNT_USER_ACTIONS.LOGGED_IN,
        ipAddress: expect.any(String),
      })
      expect(response.body).toEqual({
        user: {
          ...user,
          roleContext: serializeRoleContext(user.roleContext),
          createdAt: user.createdAt.toISOString(),
        },
      })
    })

    test('switches active role when forceLoginWithRole is allowed', async () => {
      const user = buildLegacyUser({
        userType: 'student',
        roleContext: new RoleContext(
          ['student', 'volunteer'],
          'student',
          'student'
        ),
      })
      const newRoleContext = new RoleContext(
        ['student', 'volunteer'],
        'volunteer',
        'volunteer'
      )
      mockedLegacyUser.getLegacyUserObject.mockResolvedValueOnce(user)
      mockedUserRolesService.switchActiveRole.mockResolvedValueOnce({
        newRoleContext,
      })

      const response = await sendPost('/login', {
        email: getEmail(),
        password,
        forceLoginWithRole: 'volunteer',
      })
      expect(response.status).toBe(200)
      expect(mockedUserRolesService.switchActiveRole).toHaveBeenCalledWith(
        user.id,
        'volunteer'
      )
      expect(response.body).toEqual({
        user: {
          ...user,
          roleContext: serializeRoleContext(newRoleContext),
          userType: 'volunteer',
          createdAt: user.createdAt.toISOString(),
        },
      })
    })

    test('does not switch active role when requested role is not available', async () => {
      const user = buildLegacyUser({
        roleContext: new RoleContext(['student'], 'student', 'student'),
      })
      mockedLegacyUser.getLegacyUserObject.mockResolvedValueOnce(user)

      const response = await sendPost('/login', {
        email: user.email,
        password,
        forceLoginWithRole: 'volunteer',
      })
      expect(response.status).toBe(200)
      expect(mockedUserRolesService.switchActiveRole).not.toHaveBeenCalled()
      expect(response.body).toEqual({
        user: {
          ...user,
          roleContext: serializeRoleContext(user.roleContext),
          userType: 'student',
          createdAt: user.createdAt.toISOString(),
        },
      })
    })
  })

  describe('POST /auth/register/checkcred', () => {
    test('checks credentials', async () => {
      const email = getEmail()
      mockedAuthService.checkCredential.mockResolvedValueOnce(true)

      const response = await sendPost('/register/checkcred', {
        email,
        password,
      })
      expect(response.status).toBe(200)
      expect(mockedAuthService.checkCredential).toHaveBeenCalledWith({
        email,
        password,
      })
      expect(response.body).toEqual({ checked: true })
    })
  })

  describe('POST /auth/register/student', () => {
    test('registers a student and logs them in when password is present', async () => {
      const student = buildRegisterUser({ userType: 'student ' })
      mockedUserCreationService.registerStudent.mockResolvedValueOnce(student)

      const response = await sendPost('/register/student', {
        email: student.email,
        firstName: student.firstName,
        lastName: getLastName(),
        password,
      })
      expect(response.status).toBe(200)
      expect(mockedUserCreationService.registerStudent).toHaveBeenCalledTimes(1)
      expect(asyncLogin).toHaveBeenCalledWith(student)
      expect(response.body).toEqual({ user: student })
    })

    test.todo(
      'links fed cred to existing student and logs student in when validator matches'
    )

    test('registers a student without login when password is not present', async () => {
      const student = buildRegisterUser({ userType: 'student ' })
      mockedUserCreationService.registerStudent.mockResolvedValueOnce(student)

      const response = await sendPost('/register/student', {
        email: student.email,
        firstName: student.firstName,
        lastName: getLastName(),
      })
      expect(response.status).toBe(200)
      expect(mockedUserCreationService.registerStudent).toHaveBeenCalledTimes(1)
      expect(asyncLogin).not.toHaveBeenCalled()
      expect(response.body).toEqual({ user: student })
    })
  })

  describe('POST /auth/register/student/open', () => {
    test('registers legacy open student and logs them in', async () => {
      const student = buildRegisterUser({ userType: 'student ' })
      mockedUserCreationService.registerStudent.mockResolvedValueOnce(student)

      const response = await sendPost('/register/student/open', {
        email: student.email,
        firstName: student.firstName,
        lastName: getLastName(),
        currentGrade: '8th',
        highSchoolId: getUuid(),
        password,
      })
      expect(response.status).toBe(200)
      expect(mockedUserCreationService.registerStudent).toHaveBeenCalledTimes(1)
      expect(asyncLogin).toHaveBeenCalledWith(student)
      expect(response.body).toEqual({ user: student })
    })
  })

  describe('POST /auth/register/student/partner', () => {
    test('registers legacy partner student and logs them in', async () => {
      const student = buildRegisterUser({ userType: 'student ' })
      mockedUserCreationService.registerStudent.mockResolvedValueOnce(student)

      const response = await sendPost('/register/student/partner', {
        email: student.email,
        firstName: student.firstName,
        lastName: getLastName(),
        currentGrade: '8th',
        highSchoolId: getUuid(),
        studentPartnerOrg: 'partner-org',
        partnerSite: 'Site A',
        password,
      })

      expect(response.status).toBe(200)
      expect(mockedUserCreationService.registerStudent).toHaveBeenCalledTimes(1)
      expect(asyncLogin).toHaveBeenCalledWith(student)
      expect(response.body).toEqual({ user: student })
    })
  })

  describe('POST /auth/register/teacher', () => {
    test('registers teacher and logs them in', async () => {
      const teacher = buildRegisterUser({
        userType: 'teacher',
      })
      mockedUserCreationService.registerTeacher.mockResolvedValueOnce(teacher)

      const response = await sendPost('/register/teacher', {
        email: teacher.email,
        firstName: teacher.firstName,
        lastName: getLastName(),
        password,
      })
      expect(response.status).toBe(200)
      expect(mockedUserCreationService.registerTeacher).toHaveBeenCalledTimes(1)
      expect(asyncLogin).toHaveBeenCalledWith(teacher)
      expect(response.body).toEqual({
        user: teacher,
      })
    })
  })

  describe('POST /auth/register/volunteer/open', () => {
    test('registers volunteer, logs them in, and tracks login', async () => {
      const volunteer = buildCreatedVolunteer()
      mockedAuthService.registerVolunteer.mockResolvedValueOnce(volunteer)

      const response = await sendPost('/register/volunteer/open', {
        email: volunteer.email,
        firstName: volunteer.firstName,
        lastName: volunteer.lastName,
        phone: volunteer.phone,
        password,
        terms: true,
      })
      expect(response.status).toBe(200)
      expect(mockedAuthService.registerVolunteer).toHaveBeenCalledTimes(1)
      expect(asyncLogin).toHaveBeenCalledWith(volunteer)
      expect(mockedUserAction.createAccountAction).toHaveBeenCalledWith({
        userId: volunteer.id,
        action: ACCOUNT_USER_ACTIONS.LOGGED_IN,
        ipAddress: expect.any(String),
      })
      expect(response.body).toEqual({
        user: {
          ...volunteer,
          createdAt: volunteer.createdAt.toISOString(),
        },
      })
    })
  })

  describe('POST /auth/register/volunteer/partner', () => {
    test('registers partner volunteer, logs them in, and tracks login', async () => {
      const volunteerPartnerOrg = 'test-org'
      const volunteer = buildCreatedVolunteer({ volunteerPartnerOrg })
      mockedAuthService.registerPartnerVolunteer.mockResolvedValueOnce(
        volunteer
      )

      const response = await sendPost('/register/volunteer/partner', {
        email: volunteer.email,
        firstName: volunteer.firstName,
        lastName: volunteer.lastName,
        phone: volunteer.phone,
        password,
        volunteerPartnerOrg,
        terms: true,
      })
      expect(response.status).toBe(200)
      expect(mockedAuthService.registerPartnerVolunteer).toHaveBeenCalledTimes(
        1
      )
      expect(asyncLogin).toHaveBeenCalledWith(volunteer)
      expect(mockedUserAction.createAccountAction).toHaveBeenCalledWith({
        userId: volunteer.id,
        action: ACCOUNT_USER_ACTIONS.LOGGED_IN,
        ipAddress: expect.any(String),
      })
      expect(response.body).toEqual({
        user: {
          ...volunteer,
          createdAt: volunteer.createdAt.toISOString(),
        },
      })
    })
  })

  describe('GET /auth/partner/volunteer', () => {
    test('returns volunteer partner', async () => {
      const partner = buildVolunteerPartnerOrg()
      mockedAuthService.lookupPartnerVolunteer.mockResolvedValueOnce(partner)

      const response = await sendGetQuery('/partner/volunteer', {
        partnerId: partner.key,
      })
      expect(response.status).toBe(200)
      expect(mockedAuthService.lookupPartnerVolunteer).toHaveBeenCalledWith(
        partner.key
      )
      expect(response.body).toEqual({ volunteerPartner: partner })
    })

    test('returns 422 when partnerId is missing', async () => {
      const response = await sendGetQuery('/partner/volunteer')
      expect(response.status).toBe(422)
      expect(response.body.err).toBe('Missing volunteerPartnerId query string')
      expect(mockedAuthService.lookupPartnerVolunteer).not.toHaveBeenCalled()
    })
  })

  describe('GET /auth/partner/student', () => {
    test('returns student partner', async () => {
      const partner = buildStudentPartnerOrg()
      mockedAuthService.lookupPartnerStudent.mockResolvedValueOnce(partner)

      const response = await sendGetQuery('/partner/student', {
        partnerId: partner.key,
      })
      expect(response.status).toBe(200)
      expect(mockedAuthService.lookupPartnerStudent).toHaveBeenCalledWith(
        partner.key
      )
      expect(response.body).toEqual({
        studentPartner: { ...partner, isManuallyApproved: false },
      })
    })

    test('returns 422 when partnerId is missing', async () => {
      const response = await sendGetQuery('/partner/student')
      expect(response.status).toBe(422)
      expect(response.body.err).toBe('Missing studentPartnerId query string')
      expect(mockedAuthService.lookupPartnerStudent).not.toHaveBeenCalled()
    })
  })

  describe('GET /auth/partner/student/code', () => {
    test('returns student partner key', async () => {
      const partner = buildStudentPartnerOrg()
      mockedAuthService.lookupPartnerStudentCode.mockResolvedValueOnce(
        partner.key
      )

      const response = await sendGetQuery('/partner/student/code', {
        partnerSignupCode: partner.signupCode,
      })
      expect(response.status).toBe(200)
      expect(mockedAuthService.lookupPartnerStudentCode).toHaveBeenCalledWith(
        partner.signupCode
      )
      expect(response.body).toEqual({ studentPartnerKey: partner.key })
    })

    test('returns 422 when partnerSignupCode is missing', async () => {
      const response = await sendGetQuery('/partner/student/code')
      expect(response.status).toBe(422)
      expect(response.body.err).toBe('Missing partnerSignupCode query string')
      expect(mockedAuthService.lookupPartnerStudentCode).not.toHaveBeenCalled()
    })
  })

  describe('GET /auth/partner/student-partners', () => {
    test('returns student partners', async () => {
      const partnerOrgs = [buildStudentPartnerOrg(), buildStudentPartnerOrg()]
      mockedAuthService.lookupStudentPartners.mockResolvedValueOnce(partnerOrgs)

      const response = await sendGet('/partner/student-partners')
      expect(response.status).toBe(200)
      expect(mockedAuthService.lookupStudentPartners).toHaveBeenCalledTimes(1)
      expect(response.body).toEqual({ partnerOrgs })
    })
  })

  describe('GET /auth/partner/volunteer-partners', () => {
    test('returns volunteer partners', async () => {
      const partnerOrgs = [
        buildVolunteerPartnerOrg(),
        buildVolunteerPartnerOrg(),
      ]
      mockedAuthService.lookupVolunteerPartners.mockResolvedValueOnce(
        partnerOrgs
      )

      const response = await sendGet('/partner/volunteer-partners')
      expect(response.status).toBe(200)
      expect(mockedAuthService.lookupVolunteerPartners).toHaveBeenCalledTimes(1)
      expect(response.body).toEqual({ partnerOrgs })
    })
  })

  describe('GET /auth/partner/sponsor-orgs', () => {
    test('returns sponsor orgs', async () => {
      const sponsorOrgs = [{ key: 'sponsor-1', name: 'Sponsor 1' }]
      mockedAuthService.lookupSponsorOrgs.mockResolvedValueOnce(sponsorOrgs)

      const response = await sendGet('/partner/sponsor-orgs')
      expect(response.status).toBe(200)
      expect(mockedAuthService.lookupSponsorOrgs).toHaveBeenCalledTimes(1)
      expect(response.body).toEqual({ sponsorOrgs })
    })
  })

  describe('POST /auth/reset/send', () => {
    test('sends reset and logs out current session', async () => {
      const email = getEmail()
      mockedAuthService.sendReset.mockResolvedValueOnce()

      const response = await sendPost('/reset/send', {
        email,
      })
      expect(response.status).toBe(200)
      expect(mockedAuthService.sendReset).toHaveBeenCalledWith(email)
      expect(asyncLogout).toHaveBeenCalledTimes(1)
      expect(response.body).toEqual({
        msg: 'If an account with this email address exists then we will send a password reset email',
      })
    })

    test('returns 422 when email is missing', async () => {
      const response = await sendPost('/reset/send', {})
      expect(response.status).toBe(422)
      expect(mockedAuthService.sendReset).not.toHaveBeenCalled()
    })
  })

  describe('POST /auth/reset/confirm', () => {
    test('confirms reset, deletes sessions, logs user in, and redirects', async () => {
      const user = buildUser()
      const email = user.email
      const userId = user.id
      mockedAuthService.confirmReset.mockResolvedValueOnce()
      mockedUserQueries.getUserIdByEmail.mockResolvedValueOnce({
        id: userId,
        email,
      })
      mockedAuthService.deleteAllUserSessions.mockResolvedValueOnce()
      const password = 'newPassword123!'
      const payload = {
        email,
        password,
        newpassword: password,
        token: getUuid(),
      }

      const response = await sendPost('/reset/confirm', payload)
      expect(mockedAuthService.confirmReset).toHaveBeenCalledWith(payload)
      expect(mockedUserQueries.getUserIdByEmail).toHaveBeenCalledWith(email)
      expect(mockedAuthService.deleteAllUserSessions).toHaveBeenCalledWith(
        userId
      )
      expect(asyncLogin).toHaveBeenCalledWith({
        id: userId,
        isAdmin: false,
      })
      expect(response.status).toBe(302)
      expect(response.header.location).toBe('/')
    })
  })
})
