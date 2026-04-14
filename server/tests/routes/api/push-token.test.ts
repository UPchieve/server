import { mocked } from 'jest-mock'
import request, { Response } from 'supertest'
import { mockApp, mockRouter } from '../../mock-app'
import { routePushToken } from '../../../router/api/push-token'
import * as PushTokenModel from '../../../models/PushToken'
import { buildVolunteer } from '../../mocks/generate'
import { getUuid } from '../../../models/pgUtils'
import { Response as ExpressResponse } from 'express'

let mockUser = buildVolunteer()

function isAuthenticated(
  req: { user?: typeof mockUser },
  _res: ExpressResponse,
  next: () => void
): void {
  req.user = mockUser
  next()
}

jest.mock('../../../utils/auth-utils', () => ({
  authPassport: {
    isAuthenticated,
  },
}))
jest.mock('../../../models/PushToken')

const mockedPushTokenModel = mocked(PushTokenModel)

const router = mockRouter()
routePushToken(router)

const app = mockApp()
app.use('/api', router)

const agent = request.agent(app)

function sendPost(path: string, payload?: object): Promise<Response> {
  return agent.post(path).set('Accept', 'application/json').send(payload)
}

describe('routePushToken', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    mockUser = buildVolunteer()
  })

  describe('POST /api/push-token/save', () => {
    test('saves a push token', async () => {
      const token = getUuid()
      mockedPushTokenModel.createPushTokenByUserId.mockResolvedValueOnce({
        id: getUuid(),
        user: mockUser.id,
        token,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const response = await sendPost('/api/push-token/save', { token })
      expect(response.status).toBe(200)
      expect(mockedPushTokenModel.createPushTokenByUserId).toHaveBeenCalledWith(
        mockUser.id,
        token
      )
    })

    test('returns 422 when saving the push token throws', async () => {
      const token = getUuid()
      mockedPushTokenModel.createPushTokenByUserId.mockRejectedValueOnce(
        new Error('Error')
      )

      const response = await sendPost('/api/push-token/save', {
        token,
      })
      expect(response.status).toBe(422)
      expect(mockedPushTokenModel.createPushTokenByUserId).toHaveBeenCalledWith(
        mockUser.id,
        token
      )
    })
  })
})
