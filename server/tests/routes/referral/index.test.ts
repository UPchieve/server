import request, { Response } from 'supertest'
import { mocked } from 'jest-mock'
import { mockApp } from '../../mock-app'
import * as ReferralRouter from '../../../router/referral'
import * as UserService from '../../../services/UserService'
import { buildUser, serializeRoleContext } from '../../mocks/generate'
import { RoleContext } from '../../../services/UserRolesService'
import { getUuid } from '../../../models/pgUtils'

jest.mock('../../../services/UserService')
jest.mock('../../../logger')

const mockedUserService = mocked(UserService)

const app = mockApp()
ReferralRouter.routes(app)

const agent = request.agent(app)

function sendGet(path: string): Promise<Response> {
  return agent.get(path).set('Accept', 'application/json')
}

describe('routeReferral', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api-public/referral/:referralCode', () => {
    const referralCode = getUuid()
    test('returns user for referral code', async () => {
      const userType = 'student'
      const user = buildUser({
        referralCode,
        roleContext: new RoleContext(['student'], 'student', 'student'),
      })
      mockedUserService.getUserByReferralCode.mockResolvedValueOnce({
        ...user,
        userType,
      })

      const response = await sendGet(`/api-public/referral/${referralCode}`)
      expect(response.status).toBe(200)
      expect(mockedUserService.getUserByReferralCode).toHaveBeenCalledWith(
        referralCode
      )
      expect(response.body).toEqual({
        user: {
          ...user,
          userType,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
          roleContext: serializeRoleContext(user.roleContext),
        },
      })
    })

    test('returns undefined user when referral code is not found', async () => {
      mockedUserService.getUserByReferralCode.mockResolvedValueOnce(undefined)

      const response = await sendGet(`/api-public/referral/${referralCode}`)
      expect(response.status).toBe(200)
      expect(mockedUserService.getUserByReferralCode).toHaveBeenCalledWith(
        referralCode
      )
      expect(response.body).toEqual({
        user: undefined,
      })
    })

    test('returns 500 when service throws', async () => {
      const errorMessage = 'Error'
      mockedUserService.getUserByReferralCode.mockRejectedValueOnce(
        new Error(errorMessage)
      )

      const response = await sendGet(`/api-public/referral/${referralCode}`)
      expect(response.status).toBe(500)
      expect(mockedUserService.getUserByReferralCode).toHaveBeenCalledWith(
        referralCode
      )
      expect(response.body).toEqual({
        err: errorMessage,
      })
    })
  })
})
