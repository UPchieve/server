import { mocked } from 'jest-mock'
import request, { Response } from 'supertest'
import { mockApp, mockPassportMiddleware, mockRouter } from '../../mock-app'
import { buildPublicProductFlags, buildVolunteer } from '../../mocks/generate'
import { routeProductFlags } from '../../../router/api/product-flags'
import * as UserProductFlagsRepo from '../../../models/UserProductFlags/queries'
import * as UserProductFlagsService from '../../../services/UserProductFlagsService'
import * as IncentiveProgramService from '../../../services/IncentiveProgramService'
import { getUuid } from '../../../models/pgUtils'

jest.mock('../../../models/UserProductFlags/queries')
jest.mock('../../../services/UserProductFlagsService')
jest.mock('../../../services/IncentiveProgramService')

const mockedRepo = mocked(UserProductFlagsRepo)
const mockedService = mocked(UserProductFlagsService)
const mockedIncentiveService = mocked(IncentiveProgramService)

let mockUser = buildVolunteer()
function mockGetUser() {
  return mockUser
}

const router = mockRouter()
routeProductFlags(router)

const app = mockApp()
app.use(mockPassportMiddleware(mockGetUser))
app.use('/api', router)

const agent = request.agent(app)

function sendGet(path: string): Promise<Response> {
  return agent.get(path).set('Accept', 'application/json')
}

function sendPost(path: string, payload?: object): Promise<Response> {
  return agent.post(path).set('Accept', 'application/json').send(payload)
}

describe('routeProductFlags', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    mockUser = buildVolunteer()
  })

  describe('GET /api/product-flags', () => {
    test('returns product flags', async () => {
      const flags = buildPublicProductFlags()
      mockedRepo.getPublicUPFByUserId.mockResolvedValueOnce(flags)

      const response = await sendGet('/api/product-flags')
      expect(response.status).toBe(200)
      expect(mockedRepo.getPublicUPFByUserId).toHaveBeenCalledWith(mockUser.id)
      expect(response.body).toEqual({
        flags: {
          ...flags,
          fallIncentiveEnrollmentAt:
            flags.fallIncentiveEnrollmentAt?.toISOString(),
          impactStudyEnrollmentAt: flags.impactStudyEnrollmentAt?.toISOString(),
        },
      })
    })
  })

  describe('POST /api/product-flags/fall-incentive-enrollment/enroll', () => {
    test('enrolls user to fall incentive program and returns enrollment date', async () => {
      const enrollmentDate = new Date()
      const proxyEmail = mockUser.proxyEmail
      mockedService.incentiveProgramEnrollmentEnroll.mockResolvedValueOnce(
        enrollmentDate
      )

      const response = await sendPost(
        '/api/product-flags/fall-incentive-enrollment/enroll',
        { proxyEmail }
      )
      expect(response.status).toBe(200)
      expect(
        mockedService.incentiveProgramEnrollmentEnroll
      ).toHaveBeenCalledWith(mockUser.id, proxyEmail)
      expect(response.body).toEqual({
        fallIncentiveEnrollmentAt: enrollmentDate.toISOString(),
      })
    })
  })

  describe('POST /api/product-flags/fall-incentive-enrollment/denied', () => {
    test('queues fall incentive invited to enroll reminder job', async () => {
      mockedIncentiveService.queueIncentiveInvitedToEnrollReminderJob.mockResolvedValueOnce()

      const response = await sendPost(
        '/api/product-flags/fall-incentive-enrollment/denied'
      )
      expect(response.status).toBe(200)
      expect(
        mockedIncentiveService.queueIncentiveInvitedToEnrollReminderJob
      ).toHaveBeenCalledWith(mockUser.id)
    })
  })

  describe('POST /api/product-flags/impact-study-campaigns', () => {
    test('saves impact study campaign', async () => {
      const enrollmentDate = new Date()
      const campaign = {
        id: getUuid(),
        surveyId: 1,
        viewCount: 1,
        maxViewCount: 5,
        createdAt: new Date(),
      }
      mockedService.asImpactStudyCampaignData.mockReturnValueOnce(campaign)
      mockedService.saveImpactStudyCampaign.mockResolvedValueOnce(
        enrollmentDate
      )

      const response = await sendPost(
        '/api/product-flags/impact-study-campaigns',
        { campaign }
      )
      expect(response.status).toBe(200)
      expect(mockedService.asImpactStudyCampaignData).toHaveBeenCalledWith({
        ...campaign,
        createdAt: campaign.createdAt.toISOString(),
      })
      expect(mockedService.saveImpactStudyCampaign).toHaveBeenCalledWith(
        mockUser.id,
        campaign
      )
      expect(response.body).toEqual({
        impactStudyEnrollmentAt: enrollmentDate.toISOString(),
      })
    })
  })
})
