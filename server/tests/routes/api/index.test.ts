import request, { Response } from 'supertest'
import { mockApp } from '../../mock-app'
import { routes } from '../../../router/api'
import * as UserModel from '../../../models/User'
import * as TwilioService from '../../../services/TwilioService'
import config from '../../../config'
import { buildVolunteer } from '../../mocks/generate'
import { AppVolunteer } from '../../types'

jest.mock('../../../router/api/volunteers', () => ({
  routeVolunteers: jest.fn(),
}))
jest.mock('../../../router/api/verify', () => ({
  routeVerify: jest.fn(),
}))
jest.mock('../../../router/api/session', () => ({
  routeSession: jest.fn(),
}))
jest.mock('../../../router/api/calendar', () => ({
  routeCalendar: jest.fn(),
}))
jest.mock('../../../router/api/sockets', () => ({
  routeSockets: jest.fn(),
}))
jest.mock('../../../router/api/moderate', () => ({
  routeModeration: jest.fn(),
}))
jest.mock('../../../router/api/push-token', () => ({
  routePushToken: jest.fn(),
}))
jest.mock('../../../router/api/reports', () => ({
  routeReports: jest.fn(),
}))
jest.mock('../../../router/api/survey', () => ({
  routeSurvey: jest.fn(),
}))
jest.mock('../../../router/api/stats', () => ({
  routes: jest.fn(),
}))
jest.mock('../../../router/api/training', () => ({
  routeTraining: jest.fn(),
}))
jest.mock('../../../router/api/user', () => ({
  routeUser: jest.fn(),
}))
jest.mock('../../../router/api/product-flags', () => ({
  routeProductFlags: jest.fn(),
}))
jest.mock('../../../router/api/students', () => ({
  routeStudents: jest.fn(),
}))
jest.mock('../../../router/api/subjects', () => ({
  routeSubjects: jest.fn(),
}))
jest.mock('../../../router/api/progress-reports', () => ({
  routeProgressReports: jest.fn(),
}))
jest.mock('../../../router/api/teachers', () => ({
  routeTeachers: jest.fn(),
}))
jest.mock('../../../router/api/admin', () => ({
  routeAdmin: jest.fn(),
}))
jest.mock('../../../router/api/voice-messages', () => ({
  routeVoiceMessages: jest.fn(),
}))
jest.mock('../../../router/api/tutor-bot', () => ({
  routeTutorBot: jest.fn(),
}))
jest.mock('../../../router/api/assignments', () => ({
  routeAssignments: jest.fn(),
}))
jest.mock('../../../router/api/rewards', () => ({
  routeRewards: jest.fn(),
}))
jest.mock('../../../router/api/nths-groups', () => ({
  routeNTHSGroups: jest.fn(),
}))

jest.mock('../../../middleware/add-last-activity', () => ({
  addLastActivity(req: unknown, res: unknown, next: () => void): void {
    next()
  },
}))

jest.mock('../../../middleware/add-user-action', () => ({
  addUserAction(req: unknown, res: unknown, next: () => void): void {
    next()
  },
}))

let mockUser: AppVolunteer | undefined = buildVolunteer()

jest.mock('../../../utils/auth-utils', () => ({
  authPassport: {
    isAuthenticated(
      req: { user?: { id: string } },
      _res: Response,
      next: () => void
    ): void {
      req.user = mockUser
      next()
    },
  },
}))
jest.mock('../../../models/User')
jest.mock('../../../services/MailService')
jest.mock('../../../services/TwilioService')

const mockedUserModel = jest.mocked(UserModel)
const mockedTwilioService = jest.mocked(TwilioService)

const app = mockApp()
routes(app, {} as never)
const agent = request.agent(app)

function sendPost(path: string, payload?: object): Promise<Response> {
  return agent.post(path).set('Accept', 'application/json').send(payload)
}

function buildReferralLink(referralCode: string) {
  return `https://${config.client.host}/referral/${referralCode}`
}

describe('routes defined in router/api/index', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    mockUser = buildVolunteer()
  })

  describe('POST /api/send-referral-text', () => {
    test('should return success false when req.user is missing', async () => {
      mockUser = undefined

      const response = await sendPost('/api/send-referral-text', {})
      expect(response.status).toBe(200)
      expect(response.body).toEqual({ success: false })
      expect(mockedUserModel.getUserReferralLink).not.toHaveBeenCalled()
      expect(mockedTwilioService.sendTextMessage).not.toHaveBeenCalled()
    })

    test('should return success false when no referral user is found', async () => {
      const volunteer = mockUser as AppVolunteer
      mockedUserModel.getUserReferralLink.mockResolvedValueOnce(undefined)

      const response = await sendPost('/api/send-referral-text', {
        phoneNumber: volunteer.phone,
      })
      expect(response.status).toBe(200)
      expect(response.body).toEqual({ success: false })
      expect(mockedUserModel.getUserReferralLink).toHaveBeenCalledWith(
        volunteer.id
      )
      expect(mockedTwilioService.sendTextMessage).not.toHaveBeenCalled()
    })

    test('should send referral text and return success true', async () => {
      const volunteer = mockUser as AppVolunteer
      mockedUserModel.getUserReferralLink.mockResolvedValueOnce({
        email: volunteer.email,
        firstName: volunteer.firstName,
        referralCode: volunteer.referralCode,
      })

      const response = await sendPost('/api/send-referral-text', {
        phoneNumber: volunteer.phone,
      })
      expect(response.status).toBe(200)
      expect(response.body).toEqual({ success: true })
      expect(mockedUserModel.getUserReferralLink).toHaveBeenCalledWith(
        volunteer.id
      )
      expect(mockedTwilioService.sendTextMessage).toHaveBeenCalledWith(
        volunteer.phone,
        `Hey! Want to change lives in your spare time? ✨
        ${volunteer.firstName} is volunteering online at UPchieve to tutor students at low-income schools and thought you'd enjoy it, too! 🍎
        💬 It's all chat & audio based and you can tutor as little or as much as you want. (Plus earn volunteer hours!)
        Sign up today to start making an impact! ${buildReferralLink(volunteer.referralCode)}`
      )
    })

    test('should return success false when sendTextMessage throws', async () => {
      const volunteer = mockUser as AppVolunteer
      mockedUserModel.getUserReferralLink.mockResolvedValueOnce({
        email: volunteer.email,
        firstName: volunteer.firstName,
        referralCode: volunteer.referralCode,
      })
      mockedTwilioService.sendTextMessage.mockRejectedValueOnce(
        new Error('Error')
      )

      const response = await sendPost('/api/send-referral-text', {
        phoneNumber: volunteer.phone,
      })
      expect(response.status).toBe(200)
      expect(response.body).toEqual({ success: false })
    })
  })
})
