import request, { Response } from 'supertest'
import { mocked } from 'jest-mock'
import { Request as ExpressRequest, Response as ExpressResponse } from 'express'
import { mockApp, mockPassportMiddleware, mockRouter } from '../../mock-app'
import { routeUser } from '../../../router/api/user'
import * as UserService from '../../../services/UserService'
import * as UserProfileService from '../../../services/UserProfileService'
import {
  buildLegacyUser,
  buildUser,
  getPhoneNumber,
  serializeRoleContext,
  buildUserForAdmin,
} from '../../mocks/generate'
import { getUuid } from '../../../models/pgUtils'
import { NotAllowedError } from '../../../models/Errors'
import * as AwsService from '../../../services/AwsService'
import * as VolunteerService from '../../../services/VolunteerService'
import * as UserRolesService from '../../../services/UserRolesService'
import * as PresenceService from '../../../services/PresenceService'
import * as UserModel from '../../../models/User'
import { RoleContext } from '../../../services/UserRolesService'

function isAdmin(
  _req: ExpressRequest<string, unknown>,
  _res: ExpressResponse,
  next: () => void
): void {
  next()
}

jest.mock('../../../services/UserService')
jest.mock('../../../services/UserProfileService')
jest.mock('../../../utils/auth-utils', () => {
  const actual = jest.requireActual('../../../utils/auth-utils')
  return {
    ...actual,
    authPassport: {
      ...actual.authPassport,
      isAdmin,
    },
  }
})
jest.mock('../../../services/AwsService')
jest.mock('../../../services/VolunteerService')
jest.mock('../../../services/UserRolesService')
jest.mock('../../../services/PresenceService')
jest.mock('../../../models/User')
jest.mock('../../../logger')

const mockedUserService = mocked(UserService)
const mockedUserProfileService = mocked(UserProfileService)
const mockedAwsService = mocked(AwsService)
const mockedVolunteerService = mocked(VolunteerService)
const mockedUserRolesService = mocked(UserRolesService)
const mockedPresenceService = mocked(PresenceService)
const mockedUserModel = mocked(UserModel)

let mockUser = buildUser()
const asyncLogout = jest.fn()

function mockGetUser() {
  return mockUser
}

const router = mockRouter()
routeUser(router)

const app = mockApp()
app.use(mockPassportMiddleware(mockGetUser))
app.use((req, _res, next) => {
  ;(req as ExpressRequest & { asyncLogout: () => Promise<void> }).asyncLogout =
    asyncLogout
  next()
})
app.use('/api', router)

const agent = request.agent(app)

function sendGet(path: string): Promise<Response> {
  return agent.get(path).set('Accept', 'application/json')
}

function sendPost(
  path: string,
  payload?: Record<string, unknown>
): Promise<Response> {
  return agent.post(path).set('Accept', 'application/json').send(payload)
}

function sendPut(
  path: string,
  payload?: Record<string, unknown>
): Promise<Response> {
  return agent.put(path).set('Accept', 'application/json').send(payload)
}

function sendDelete(path: string): Promise<Response> {
  return agent.delete(path).set('Accept', 'application/json')
}

describe('routeUser', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    mockUser = buildUser()
    asyncLogout.mockReset()
    asyncLogout.mockResolvedValue(undefined)
  })

  describe('GET /api/user', () => {
    test('returns parsed user', async () => {
      const parsedUser = buildLegacyUser({
        id: mockUser.id,
      })
      mockedUserService.parseUser.mockResolvedValueOnce(parsedUser)

      const response = await sendGet('/api/user')
      expect(response.status).toBe(200)
      expect(mockedUserService.parseUser).toHaveBeenCalledWith(mockUser.id)
      expect(response.body).toEqual({
        user: {
          ...parsedUser,
          createdAt: parsedUser.createdAt.toISOString(),
          lastActivityAt: parsedUser.lastActivityAt?.toISOString(),
          roleContext: serializeRoleContext(parsedUser.roleContext),
        },
      })
    })
  })

  describe('PUT /api/user', () => {
    test('updates user profile with optional fields', async () => {
      const schoolId = getUuid()
      const phone = getPhoneNumber()
      const payload = {
        isDeactivated: true,
        schoolId,
        smsConsent: true,
        mutedSubjectAlerts: ['algebraOne', 'biology'],
        phone,
        preferredLanguage: 'en',
      }
      mockedUserProfileService.updateUserProfile.mockResolvedValueOnce()

      const response = await sendPut('/api/user', payload)
      const { isDeactivated, ...rest } = payload
      expect(response.status).toBe(200)
      expect(mockedUserProfileService.updateUserProfile).toHaveBeenCalledWith(
        mockUser,
        expect.any(String),
        {
          ...rest,
          deactivated: isDeactivated,
        }
      )
    })

    test('defaults deactivated to false when not provided', async () => {
      mockedUserProfileService.updateUserProfile.mockResolvedValueOnce()

      const response = await sendPut('/api/user', {
        smsConsent: false,
      })
      expect(response.status).toBe(200)
      expect(mockedUserProfileService.updateUserProfile).toHaveBeenCalledWith(
        mockUser,
        expect.any(String),
        {
          deactivated: false,
          smsConsent: false,
        }
      )
    })

    test('returns 422 when phone is empty', async () => {
      const response = await sendPut('/api/user', {
        phone: '',
      })

      expect(response.status).toBe(422)
      expect(mockedUserProfileService.updateUserProfile).not.toHaveBeenCalled()
    })
  })

  describe('DELETE /api/user/phone', () => {
    test('deletes phone from account', async () => {
      mockedUserService.deletePhoneFromAccount.mockResolvedValueOnce()

      const response = await sendDelete('/api/user/phone')
      expect(response.status).toBe(200)
      expect(mockedUserService.deletePhoneFromAccount).toHaveBeenCalledWith(
        mockUser.id
      )
    })
  })

  describe('DELETE /api/user', () => {
    test('deletes user and logs out', async () => {
      mockedUserService.deleteUser.mockResolvedValueOnce()

      const response = await sendDelete('/api/user')
      expect(response.status).toBe(200)
      expect(mockedUserService.deleteUser).toHaveBeenCalledWith(mockUser)
      expect(asyncLogout).toHaveBeenCalled()
    })
  })

  describe('PUT /api/user/:userId', () => {
    test('admin updates user', async () => {
      const user = buildUser()
      const userId = user.id
      const payload = {
        email: user.email,
        isVerified: true,
        isDeactivated: false,
        firstName: user.firstName,
        lastName: user.lastName,
      }
      mockedUserService.adminUpdateUser.mockResolvedValueOnce()

      const response = await sendPut(`/api/user/${userId}`, payload)
      expect(response.status).toBe(200)
      expect(mockedUserService.adminUpdateUser).toHaveBeenCalledWith({
        userId,
        ...payload,
      })
    })
  })

  describe('POST /api/user/volunteer-approval/reference', () => {
    test('adds a volunteer reference', async () => {
      const user = buildUser()
      const reference = {
        referenceFirstName: user.firstName,
        referenceLastName: user.lastName,
        referenceEmail: user.email,
      }
      mockedUserService.addReference.mockResolvedValueOnce()

      const response = await sendPost(
        '/api/user/volunteer-approval/reference',
        reference
      )
      expect(response.status).toBe(200)
      expect(mockedUserService.addReference).toHaveBeenCalledWith({
        userId: mockUser.id,
        userEmail: mockUser.email,
        ip: expect.any(String),
        ...reference,
      })
    })

    test('returns success false for not allowed error', async () => {
      const user = buildUser()
      const reference = {
        referenceFirstName: user.firstName,
        referenceLastName: user.lastName,
        referenceEmail: user.email,
      }
      const errorMessage = 'Error'
      mockedUserService.addReference.mockRejectedValueOnce(
        new NotAllowedError(errorMessage)
      )

      const response = await sendPost(
        '/api/user/volunteer-approval/reference',
        reference
      )
      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        success: false,
        message: errorMessage,
      })
    })
  })

  describe('GET /api/user/volunteer-approval/photo-url', () => {
    test('returns photo upload url', async () => {
      const uploadUrl = 'https://example.com/upload'
      const photoKey = getUuid()
      mockedUserService.addPhotoId.mockResolvedValueOnce(photoKey)
      mockedAwsService.getPhotoIdUploadUrl.mockResolvedValueOnce(uploadUrl)

      const response = await sendGet('/api/user/volunteer-approval/photo-url')
      expect(response.status).toBe(200)
      expect(mockedUserService.addPhotoId).toHaveBeenCalledWith(
        mockUser.id,
        expect.any(String)
      )
      expect(mockedAwsService.getPhotoIdUploadUrl).toHaveBeenCalledWith(
        photoKey
      )
      expect(response.body).toEqual({
        success: true,
        message: 'AWS SDK S3 pre-signed URL generated successfully',
        uploadUrl,
      })
    })

    test('returns success false when upload url is empty', async () => {
      const photoKey = getUuid()
      mockedUserService.addPhotoId.mockResolvedValueOnce(photoKey)
      mockedAwsService.getPhotoIdUploadUrl.mockResolvedValueOnce('')

      const response = await sendGet('/api/user/volunteer-approval/photo-url')
      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        success: false,
        message: 'Pre-signed URL error',
      })
    })
  })

  describe('POST /api/user/volunteer-approval/background-information', () => {
    test('adds background information', async () => {
      const wasRemovedFromNTHS = true
      const payload = {
        occupation: ['Working full-time'],
        experience: '2 years',
        company: 'ACME',
        college: 'UPchieve University',
        linkedInUrl: 'https://linkedin.com/in/test',
        languages: ['en'],
        country: 'US',
        state: 'NY',
        city: 'New York',
        phoneNumber: getPhoneNumber(),
        signupSourceId: 1,
        otherSignupSource: 'Friend',
        highSchoolId: getUuid(),
      }
      mockedVolunteerService.submitVolunteerBackgroundInfo.mockResolvedValueOnce(
        {
          wasRemovedFromNTHS,
        }
      )

      const response = await sendPost(
        '/api/user/volunteer-approval/background-information',
        payload
      )
      expect(response.status).toBe(200)
      const payloadWithCorrectedOccupationField = {
        // client sends occupations array as key 'occupation', but service function takes 'occupationS'
        ...payload,
      }
      delete payloadWithCorrectedOccupationField.occupation
      expect(
        mockedVolunteerService.submitVolunteerBackgroundInfo
      ).toHaveBeenCalledWith(
        mockUser.id,
        {
          ...payloadWithCorrectedOccupationField,
          occupations: payload.occupation,
        },
        expect.any(String)
      )
      expect(response.body).toEqual({ wasRemovedFromNTHS })
    })
  })

  describe('GET /api/user/referred-friends', () => {
    test('returns referred friends array sized by count', async () => {
      mockedUserService.countReferredUsers.mockResolvedValueOnce(3)

      const response = await sendGet('/api/user/referred-friends')
      expect(response.status).toBe(200)
      expect(mockedUserService.countReferredUsers).toHaveBeenCalledWith(
        mockUser.id,
        { withPhoneOrEmailVerifiedAs: true }
      )
      expect(response.body.referredFriendsArr).toHaveLength(3)
    })
  })

  describe('GET /api/user/email/:userEmail', () => {
    test('returns user id for admin email lookup', async () => {
      const user = buildUser()
      mockedUserModel.getUserIdByEmail.mockResolvedValueOnce({
        id: user.id,
        email: user.email,
      })

      const response = await sendGet(`/api/user/email/${user.email}`)
      expect(response.status).toBe(200)
      expect(mockedUserModel.getUserIdByEmail).toHaveBeenCalledWith(user.email)
      expect(response.body).toEqual({ userId: user.id })
    })
  })

  describe('GET /api/user/:userId', () => {
    test('returns admin user detail with userType and roles', async () => {
      const user = buildLegacyUser()
      const userId = user.id
      mockedUserService.getUserForAdminDetail.mockResolvedValueOnce(user)

      const response = await sendGet(`/api/user/${userId}?page=1`)
      expect(response.status).toBe(200)
      expect(mockedUserService.getUserForAdminDetail).toHaveBeenCalledWith(
        userId,
        10,
        0
      )
      expect(response.body).toEqual({
        ...user,
        createdAt: user.createdAt.toISOString(),
        lastActivityAt: user.lastActivityAt?.toISOString(),
        userType: user.roleContext.activeRole,
        roles: user.roleContext.roles,
        roleContext: serializeRoleContext(user.roleContext),
      })
    })
  })

  describe('GET /api/users', () => {
    test('returns users and isLastPage', async () => {
      const search = 'UPdog'
      const page = 1
      const users = [buildUserForAdmin(), buildUserForAdmin()]
      mockedUserService.getUsers.mockResolvedValueOnce({
        users,
        isLastPage: false,
      })

      const response = await sendGet(`/api/users?page=${page}&search=${search}`)
      expect(response.status).toBe(200)
      expect(mockedUserService.getUsers).toHaveBeenCalledWith({
        page: String(page),
        search,
      })
      expect(response.body).toEqual({
        users: users.map((user) => ({
          ...user,
          createdAt: user.createdAt.toISOString(),
        })),
        isLastPage: false,
      })
    })

    test('defaults page to 1 when query page is missing', async () => {
      mockedUserService.getUsers.mockResolvedValueOnce({
        users: [],
        isLastPage: true,
      })

      const response = await sendGet('/api/users')
      expect(response.status).toBe(200)
      expect(mockedUserService.getUsers).toHaveBeenCalledWith({
        page: 1,
      })
    })
  })

  describe('PUT /api/user/roles/active', () => {
    test('switches active role for user', async () => {
      const switchedUser = buildUser({
        id: mockUser.id,
        roleContext: new RoleContext(
          ['student', 'volunteer'],
          'volunteer',
          'student'
        ),
      })
      mockedUserService.switchActiveRoleForUser.mockResolvedValueOnce({
        activeRole: 'volunteer',
        user: switchedUser,
      })

      const response = await sendPut('/api/user/roles/active', {
        activeRole: 'volunteer',
      })
      expect(response.status).toBe(200)
      expect(mockedUserService.switchActiveRoleForUser).toHaveBeenCalledWith(
        mockUser.id,
        'volunteer'
      )
      expect(response.body).toEqual({
        activeRole: 'volunteer',
        user: {
          ...switchedUser,
          createdAt: switchedUser.createdAt.toISOString(),
          updatedAt: switchedUser.updatedAt.toISOString(),
          lastActivityAt: switchedUser.lastActivityAt?.toISOString(),
          roleContext: serializeRoleContext(switchedUser.roleContext),
        },
      })
    })
  })

  describe('POST /api/user/roles/volunteer', () => {
    test('adds volunteer role to user', async () => {
      mockedUserRolesService.addVolunteerRoleToUser.mockResolvedValueOnce()

      const response = await sendPost('/api/user/roles/volunteer')
      expect(response.status).toBe(201)
      expect(
        mockedUserRolesService.addVolunteerRoleToUser
      ).toHaveBeenCalledWith(mockUser.id)
    })
  })

  describe('POST /api/user/preferred-language', () => {
    test('updates preferred language', async () => {
      const preferredLanguage = 'es'
      mockedUserService.updatePreferredLanguage.mockResolvedValueOnce()

      const response = await sendPost('/api/user/preferred-language', {
        preferredLanguage,
      })
      expect(response.status).toBe(200)
      expect(mockedUserService.updatePreferredLanguage).toHaveBeenCalledWith(
        mockUser.id,
        preferredLanguage
      )
    })
  })

  describe('POST /api/user/track-presence/active', () => {
    test('tracks user activity', async () => {
      const clientUUID = getUuid()
      mockedPresenceService.trackActivity.mockResolvedValueOnce()

      const response = await sendPost('/api/user/track-presence/active', {
        clientUUID,
      })
      expect(response.status).toBe(200)
      expect(mockedPresenceService.trackActivity).toHaveBeenCalledWith({
        userId: mockUser.id,
        ipAddress: expect.any(String),
        clientUUID,
      })
    })
  })

  describe('POST /api/user/track-presence/passive', () => {
    test('tracks user passivity', async () => {
      const clientUUID = getUuid()
      mockedPresenceService.trackPassivity.mockResolvedValueOnce()

      const response = await sendPost('/api/user/track-presence/passive', {
        clientUUID,
      })
      expect(response.status).toBe(200)
      expect(mockedPresenceService.trackPassivity).toHaveBeenCalledWith({
        userId: mockUser.id,
        ipAddress: expect.any(String),
        clientUUID,
      })
    })
  })

  describe('POST /api/user/track-presence/check-for-inactivity', () => {
    test('sets inactivity countdown when user id and clientUUID are present', async () => {
      const clientUUID = getUuid()
      mockedPresenceService.setInactivityCountdown.mockResolvedValueOnce()

      const response = await sendPost(
        '/api/user/track-presence/check-for-inactivity',
        {
          clientUUID,
        }
      )
      expect(response.status).toBe(200)
      expect(mockedPresenceService.setInactivityCountdown).toHaveBeenCalledWith(
        {
          userId: mockUser.id,
          clientUUID,
        }
      )
    })

    test('does not set inactivity countdown when clientUUID is not a string', async () => {
      const clientUUID = undefined
      const response = await sendPost(
        '/api/user/track-presence/check-for-inactivity',
        {
          clientUUID,
        }
      )

      expect(response.status).toBe(200)
      expect(
        mockedPresenceService.setInactivityCountdown
      ).not.toHaveBeenCalled()
    })
  })

  describe('PUT /api/user/volunteer/complete-sso-signup', () => {
    test('completes volunteer sso signup', async () => {
      const payload = {
        phone: getPhoneNumber(),
        signupSourceId: 1,
        otherSignupSource: 'Friend',
      }
      mockedUserProfileService.updateUserProfile.mockResolvedValueOnce()

      const response = await sendPut(
        '/api/user/volunteer/complete-sso-signup',
        payload
      )
      expect(response.status).toBe(201)
      expect(mockedUserProfileService.updateUserProfile).toHaveBeenCalledWith(
        mockUser,
        expect.any(String),
        {
          deactivated: false,
          phone: payload.phone,
          signupSourceId: payload.signupSourceId,
          otherSignupSource: payload.otherSignupSource,
        }
      )
    })

    test('returns 422 when phone is missing', async () => {
      const response = await sendPut(
        '/api/user/volunteer/complete-sso-signup',
        {
          signupSourceId: 1,
        }
      )
      expect(response.status).toBe(422)
      expect(mockedUserProfileService.updateUserProfile).not.toHaveBeenCalled()
    })

    test('returns 422 when signup source is missing', async () => {
      const response = await sendPut(
        '/api/user/volunteer/complete-sso-signup',
        {
          phone: getPhoneNumber(),
        }
      )
      expect(response.status).toBe(422)
      expect(mockedUserProfileService.updateUserProfile).not.toHaveBeenCalled()
    })
  })
})
