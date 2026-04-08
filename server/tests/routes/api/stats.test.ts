import { mocked } from 'jest-mock'
import request, { Response } from 'supertest'
import { mockApp, mockPassportMiddleware, mockRouter } from '../../mock-app'
import {
  buildHeatMap,
  buildUser,
  buildUserContactInfo,
} from '../../mocks/generate'
import { routes as routeStats } from '../../../router/api/stats'
import * as SessionService from '../../../services/SessionService'

jest.mock('../../../services/SessionService')
const mockedSessionService = mocked(SessionService)

let mockUser = buildUserContactInfo()

function mockGetUser() {
  return mockUser
}

const router = mockRouter()
routeStats(router)

const app = mockApp()
app.use(mockPassportMiddleware(mockGetUser))
app.use('/api', router)

const agent = request.agent(app)

function sendGet(path: string): Promise<Response> {
  return agent.get(path).set('Accept', 'application/json')
}

describe('routeStats', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    mockUser = buildUser()
  })

  describe('GET /api/stats/volunteer/heatmap', () => {
    test('returns volunteer heat map', async () => {
      const heatMap = buildHeatMap({
        Sunday: {
          '12a': 80000000,
          '1a': 0,
          '2a': 0,
          '3a': 0,
          '4a': 0,
          '5a': 0,
          '6a': 0,
          '7a': 0,
          '8a': 0,
          '9a': 0,
          '10a': 0,
          '11a': 0,
          '12p': 0,
          '1p': 0,
          '2p': 0,
          '3p': 0,
          '4p': 0,
          '5p': 0,
          '6p': 0,
          '7p': 0,
          '8p': 0,
          '9p': 0,
          '10p': 0,
          '11p': 0,
        },
      })
      mockedSessionService.getWaitTimeHeatMap.mockResolvedValueOnce(heatMap)

      const response = await sendGet('/api/stats/volunteer/heatmap')
      expect(response.status).toBe(200)
      expect(mockedSessionService.getWaitTimeHeatMap).toHaveBeenCalledWith(
        mockUser
      )
      expect(response.body).toEqual({ heatMap })
    })

    test('returns 500 when service throws', async () => {
      mockedSessionService.getWaitTimeHeatMap.mockRejectedValueOnce(
        new Error('Error')
      )

      const response = await sendGet('/api/stats/volunteer/heatmap')
      expect(response.status).toBe(500)
      expect(mockedSessionService.getWaitTimeHeatMap).toHaveBeenCalledWith(
        mockUser
      )
    })
  })
})
