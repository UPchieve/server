import { mocked } from 'ts-jest/utils'
import request, { Test } from 'supertest'
import { mockApp, mockPassportMiddleware, mockRouter } from '../mock-app'
import * as UserRepo from '../../models/User/queries'
import { buildStudent } from '../mocks/generate'
import { routeUser } from '../../router/api/user'

jest.mock('../../models/User/queries')
const mockedUserRepo = mocked(UserRepo, true)
const router = mockRouter()
routeUser(router)
const app = mockApp()
const mockGetUser = () => buildStudent()
app.use(mockPassportMiddleware(mockGetUser))
app.use('/api', router)
const agent = request.agent(app)

describe('PUT /user', () => {
  const sendPut = async (payload: any): Promise<Test> => {
    return agent
      .put('/api/user')
      .set('Accept', 'application/json')
      .send(payload)
  }

  it('Should update required fields successfully when optional field smsConsent is not present', async () => {
    const request = {
      phone: '+18608854133',
      isDeactivated: false,
    }
    const response = await sendPut(request)

    expect(response.status).toEqual(200)
    expect(mockedUserRepo.updateUserProfileById).toHaveBeenCalledWith(
      expect.anything(), // user id is randomly generated
      {
        phone: request.phone,
        deactivated: request.isDeactivated,
      }
    )
  })

  it('Should update fields when all fields are provided', async () => {
    const request = {
      phone: '+18608854133',
      isDeactivated: false,
      smsConsent: true,
    }
    const response = await sendPut(request)

    expect(response.status).toEqual(200)
    expect(mockedUserRepo.updateUserProfileById).toHaveBeenCalledWith(
      expect.anything(), // user id is randomly generated
      {
        phone: request.phone,
        deactivated: request.isDeactivated,
        smsConsent: true,
      }
    )
  })
})
