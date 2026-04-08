import { mocked } from 'jest-mock'
import request, { Response } from 'supertest'
import { mockApp, mockPassportMiddleware, mockRouter } from '../../mock-app'
import { buildStudent, buildUserReward } from '../../mocks/generate'
import { routeRewards } from '../../../router/api/rewards'
import * as RewardsService from '../../../services/RewardsService'

jest.mock('../../../services/RewardsService')

const mockedRewardsService = mocked(RewardsService)

let mockUser = buildStudent()

function mockGetUser() {
  return mockUser
}

const router = mockRouter()
routeRewards(router)

const app = mockApp()
app.use(mockPassportMiddleware(mockGetUser))
app.use('/api', router)

const agent = request.agent(app)

function sendGet(path: string): Promise<Response> {
  return agent.get(path).set('Accept', 'application/json')
}

describe('routeRewards', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    mockUser = buildStudent()
  })

  describe('GET /api/rewards', () => {
    test('returns rewards for the user', async () => {
      const rewards = [buildUserReward()]
      const userRewards = {
        rewards,
        total: rewards.length,
      }
      const offset = 1
      mockedRewardsService.getUserRewards.mockResolvedValueOnce(userRewards)

      const response = await sendGet(`/api/rewards?offset=${offset}`)
      expect(response.status).toBe(200)
      expect(mockedRewardsService.getUserRewards).toHaveBeenCalledWith(
        mockUser.id,
        offset
      )
      expect(response.body).toEqual({
        rewards: [
          {
            ...userRewards.rewards[0],
            createdAt: userRewards.rewards[0].createdAt.toISOString(),
          },
        ],
        total: userRewards.total,
      })
    })
  })
})
