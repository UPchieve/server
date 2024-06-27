import { mocked } from 'jest-mock'
import request, { Test } from 'supertest'
import { mockApp, mockPassportMiddleware, mockRouter } from '../mock-app'
import { buildStudent } from '../mocks/generate'
import { routeUser } from '../../router/api/user'
import * as UserService from '../../services/UserService'
import { InputError } from '../../models/Errors'

jest.mock('../../services/UserService')

const mockedUserService = mocked(UserService)
const mockGetUser = () => buildStudent()
const router = mockRouter()
routeUser(router)
const app = mockApp()
app.use(mockPassportMiddleware(mockGetUser))
app.use('/api', router)
const agent = request.agent(app)

describe('PUT /user', () => {
  beforeEach(async () => {
    jest.resetAllMocks()
  })

  const sendPut = async (payload: any): Promise<Test> => {
    return agent
      .put('/api/user')
      .set('Accept', 'application/json')
      .send(payload)
  }

  it('Should update required fields successfully when optional field smsConsent is not present', async () => {
    const request = {
      userId: '123',
      phone: '+18608854133',
      isDeactivated: false,
    }
    const response = await sendPut(request)

    expect(response.status).toEqual(200)
    expect(mockedUserService.updateUserProfile).toHaveBeenCalledWith(
      expect.anything(), // user id is randomly generated
      {
        phone: request.phone,
        deactivated: request.isDeactivated,
      }
    )
  })

  it('Should update required fields successfully when optional field phone is not present', async () => {
    const request = {
      userId: '123',
      isDeactivated: false,
      smsConsent: false,
    }
    const response = await sendPut(request)

    expect(response.status).toEqual(200)
    expect(mockedUserService.updateUserProfile).toHaveBeenCalledWith(
      expect.anything(), // user id is randomly generated
      {
        deactivated: request.isDeactivated,
        smsConsent: request.smsConsent,
      }
    )
  })

  it('Should update fields when all fields are provided', async () => {
    const request = {
      userId: '123',
      phone: '+18608854133',
      isDeactivated: false,
      smsConsent: true,
    }
    const response = await sendPut(request)

    expect(response.status).toEqual(200)
    expect(mockedUserService.updateUserProfile).toHaveBeenCalledWith(
      expect.anything(), // user id is randomly generated
      {
        phone: request.phone,
        deactivated: request.isDeactivated,
        smsConsent: request.smsConsent,
      }
    )
  })

  it.each(['', false, null])(
    'Should throw an error when phone is invalid (phone = %s)',
    async phone => {
      const request = {
        userId: '123',
        phone,
        isDeactivated: false,
      }
      const res = await sendPut(request)
      expect(res.status).toEqual(422)
      expect(mockedUserService.updateUserProfile).not.toHaveBeenCalled()
    }
  )
})
