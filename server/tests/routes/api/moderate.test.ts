import { mocked } from 'jest-mock'
import request, { Response } from 'supertest'
import { mockApp, mockPassportMiddleware, mockRouter } from '../../mock-app'
import { buildVolunteer } from '../../mocks/generate'
import { routeModeration } from '../../../router/api/moderate'
import * as ModerationService from '../../../services/ModerationService'
import { getUuid } from '../../../models/pgUtils'

jest.mock('../../../services/ModerationService')

const mockedModerationService = mocked(ModerationService)

let mockUser = buildVolunteer()

function mockGetUser() {
  return mockUser
}

const router = mockRouter()
routeModeration(router)

const app = mockApp()
app.use(mockPassportMiddleware(mockGetUser))
app.use('/api', router)

const agent = request.agent(app)

function sendPost(path: string, payload: object): Promise<Response> {
  return agent.post(path).set('Accept', 'application/json').send(payload)
}

const sessionId = getUuid()

describe('routeModeration', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    mockUser = buildVolunteer()
  })

  describe('POST /api/moderate/message', () => {
    const source = 'text_chat'
    const payload = {
      message: 'hello world',
      sessionId,
      source,
    }

    test('should moderate a message using the current message shape', async () => {
      const source = 'text_chat'
      mockedModerationService.moderateMessage.mockResolvedValueOnce(true)

      const response = await sendPost('/api/moderate/message', payload)
      expect(response.status).toBe(200)
      expect(response.body).toEqual({ isClean: true })
      expect(mockedModerationService.moderateMessage).toHaveBeenCalledWith(
        {
          message: payload.message,
          senderId: mockUser.id,
          sessionId: payload.sessionId,
          userType: mockUser.roleContext.activeRole,
        },
        source
      )
    })

    test('should moderate a message using the legacy content shape', async () => {
      const payload = {
        content: 'legacy message',
        source,
      }
      mockedModerationService.moderateMessage.mockResolvedValueOnce(true)

      const response = await sendPost('/api/moderate/message', payload)
      expect(response.status).toBe(200)
      expect(response.body).toEqual({ isClean: true })
      expect(mockedModerationService.moderateMessage).toHaveBeenCalledWith(
        {
          message: payload.content,
          senderId: mockUser.id,
          userType: mockUser.roleContext.activeRole,
        },
        payload.source
      )
    })

    test('should return an error response when moderateMessage throws', async () => {
      mockedModerationService.moderateMessage.mockRejectedValueOnce(
        new Error('Error')
      )

      const response = await sendPost('/api/moderate/message', payload)
      expect(response.status).toBeGreaterThanOrEqual(400)
      expect(mockedModerationService.moderateMessage).toHaveBeenCalledWith(
        {
          message: payload.message,
          senderId: mockUser.id,
          sessionId: payload.sessionId,
          userType: mockUser.roleContext.activeRole,
        },
        source
      )
    })
  })

  describe('POST /api/moderate/image', () => {
    test('should return 400 when no image file is attached', async () => {
      const response = await agent
        .post('/api/moderate/image')
        .set('Accept', 'application/json')
        .field('sessionId', sessionId)
      expect(response.status).toBe(400)
      expect(response.body).toEqual({ err: 'No file was attached' })
      expect(mockedModerationService.moderateImage).not.toHaveBeenCalled()
    })

    test('should moderate an uploaded image', async () => {
      const moderationResult = {
        isClean: false,
        failures: ['explicit'],
      }
      mockedModerationService.moderateImage.mockResolvedValueOnce(
        moderationResult
      )

      const response = await agent
        .post('/api/moderate/image')
        .set('Accept', 'application/json')
        .field('sessionId', sessionId)
        .attach('image', Buffer.from('image-bytes'), 'image.png')
      expect(response.status).toBe(200)
      expect(response.body).toEqual(moderationResult)
      expect(mockedModerationService.moderateImage).toHaveBeenCalledTimes(1)
    })

    test('should return an error response when moderateImage throws', async () => {
      mockedModerationService.moderateImage.mockRejectedValueOnce(
        new Error('Unexpected failure')
      )

      const response = await agent
        .post('/api/moderate/image')
        .set('Accept', 'application/json')
        .field('sessionId', sessionId)
        .attach('image', Buffer.from('image-bytes'), 'image.png')
      expect(response.status).toBeGreaterThanOrEqual(400)
      expect(mockedModerationService.moderateImage).toHaveBeenCalledTimes(1)
    })
  })

  describe('POST /api/moderate/video-frame', () => {
    test('should return 400 when no frame file is attached', async () => {
      const response = await agent
        .post('/api/moderate/video-frame')
        .set('Accept', 'application/json')
        .field('sessionId', sessionId)
      expect(response.status).toBe(400)
      expect(response.body).toEqual({ err: 'No file was attached' })
      expect(mockedModerationService.moderateImage).not.toHaveBeenCalled()
    })

    test('should moderate an uploaded video frame and return 201', async () => {
      mockedModerationService.moderateImage.mockResolvedValueOnce({
        isClean: true,
        failures: [],
      })

      const response = await agent
        .post('/api/moderate/video-frame')
        .set('Accept', 'application/json')
        .field('sessionId', sessionId)
        .attach('frame', Buffer.from('frame-bytes'), 'frame.png')
      expect(response.status).toBe(201)
      expect(mockedModerationService.moderateImage).toHaveBeenCalledTimes(1)
    })

    test('should return an error response when moderateImage throws', async () => {
      mockedModerationService.moderateImage.mockImplementationOnce(() => {
        throw new Error('Error')
      })

      const response = await agent
        .post('/api/moderate/video-frame')
        .set('Accept', 'application/json')
        .field('sessionId', sessionId)
        .attach('frame', Buffer.from('frame-bytes'), 'frame.png')
      expect(response.status).toBeGreaterThanOrEqual(400)
      expect(mockedModerationService.moderateImage).toHaveBeenCalledTimes(1)
    })
  })
})
