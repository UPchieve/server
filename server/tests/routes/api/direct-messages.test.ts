import request, { Response } from 'supertest'
import { mocked } from 'jest-mock'
import { mockApp, mockPassportMiddleware, mockRouter } from '../../mock-app'
import { routeDirectMessages } from '../../../router/api/direct-messages'
import * as DirectMessageService from '../../../services/DirectMessageService'
import { ConversationNotFoundError } from '../../../services/Errors'
import { getUuid } from '../../../models/pgUtils'
import { buildUserContactInfo } from '../../mocks/generate'

jest.mock('../../../services/DirectMessageService')
jest.mock('../../../logger')

const mockedDirectMessageService = mocked(DirectMessageService)

const mockUser = buildUserContactInfo()

const router = mockRouter()
routeDirectMessages(router)

const app = mockApp()
app.use(mockPassportMiddleware(() => mockUser))
app.use('/api', router)

const agent = request.agent(app)

function sendPost(
  path: string,
  payload?: Record<string, unknown>
): Promise<Response> {
  return agent.post(path).set('Accept', 'application/json').send(payload)
}

describe('routeDirectMessages', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('POST /api/conversations', () => {
    test("returns the conversation's id", async () => {
      const partnerId = getUuid()
      const conversationId = getUuid()
      mockedDirectMessageService.getOrCreateConversation.mockResolvedValueOnce({
        id: conversationId,
        studentId: mockUser.id,
        volunteerId: partnerId,
        createdAt: new Date(),
      })

      const response = await sendPost('/api/conversations', { partnerId })

      expect(response.status).toBe(200)
      expect(
        mockedDirectMessageService.getOrCreateConversation
      ).toHaveBeenCalledWith(mockUser, partnerId)
      expect(response.body).toEqual({ conversationId })
    })

    test('returns 404 if the pair has not had a session together', async () => {
      mockedDirectMessageService.getOrCreateConversation.mockRejectedValueOnce(
        new ConversationNotFoundError()
      )

      const response = await sendPost('/api/conversations', {
        partnerId: getUuid(),
      })

      expect(response.status).toBe(404)
    })

    test('returns 422 for a missing or malformed partnerId', async () => {
      const missing = await sendPost('/api/conversations', {})
      const malformed = await sendPost('/api/conversations', {
        partnerId: 'not-an-id',
      })

      expect(missing.status).toBe(422)
      expect(malformed.status).toBe(422)
      expect(
        mockedDirectMessageService.getOrCreateConversation
      ).not.toHaveBeenCalled()
    })
  })
})
