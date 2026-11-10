import request, { Response } from 'supertest'
import { mocked } from 'jest-mock'
import { mockApp, mockPassportMiddleware, mockRouter } from '../../mock-app'
import { routeDirectMessages } from '../../../router/api/direct-messages'
import * as DirectMessageService from '../../../services/DirectMessageService'
import * as DirectMessageReportService from '../../../services/DirectMessageReportService'
import { SESSION_REPORT_REASON } from '../../../constants'
import { InputError } from '../../../models/Errors'
import { ConversationNotFoundError } from '../../../services/Errors'
import { getUuid } from '../../../models/pgUtils'
import { buildUserContactInfo } from '../../mocks/generate'

jest.mock('../../../services/DirectMessageService')
jest.mock('../../../services/DirectMessageReportService')
jest.mock('../../../logger')

const mockedDirectMessageService = mocked(DirectMessageService)

const mockUser = buildUserContactInfo()

const router = mockRouter()
routeDirectMessages(router)

const app = mockApp()
app.use(mockPassportMiddleware(() => mockUser))
app.use('/api', router)

const agent = request.agent(app)

function sendGet(path: string): Promise<Response> {
  return agent.get(path).set('Accept', 'application/json')
}

function sendPost(
  path: string,
  payload?: Record<string, unknown>
): Promise<Response> {
  return agent.post(path).set('Accept', 'application/json').send(payload)
}

function buildMessage(conversationId: string) {
  return {
    id: getUuid(),
    conversationId,
    senderId: mockUser.id,
    contents: 'Hi!',
    createdAt: new Date('2026-10-01T12:00:00.000Z'),
  }
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

  describe('GET /api/conversations/:conversationId/messages', () => {
    test("returns the conversation's messages", async () => {
      const conversationId = getUuid()
      const message = buildMessage(conversationId)
      mockedDirectMessageService.getMessages.mockResolvedValueOnce([message])

      const response = await sendGet(
        `/api/conversations/${conversationId}/messages`
      )

      expect(response.status).toBe(200)
      expect(mockedDirectMessageService.getMessages).toHaveBeenCalledWith(
        conversationId,
        mockUser
      )
      expect(response.body).toEqual({
        messages: [{ ...message, createdAt: '2026-10-01T12:00:00.000Z' }],
      })
    })

    test('returns 404 if the user is not in the conversation', async () => {
      mockedDirectMessageService.getMessages.mockRejectedValueOnce(
        new ConversationNotFoundError()
      )

      const response = await sendGet(`/api/conversations/${getUuid()}/messages`)

      expect(response.status).toBe(404)
    })

    test('returns 404 for a malformed conversation id', async () => {
      const response = await sendGet('/api/conversations/not-an-id/messages')

      expect(response.status).toBe(404)
      expect(mockedDirectMessageService.getMessages).not.toHaveBeenCalled()
    })
  })

  describe('POST /api/conversations/:conversationId/last-seen', () => {
    test('marks the conversation as seen', async () => {
      const conversationId = getUuid()
      mockedDirectMessageService.markConversationSeen.mockResolvedValueOnce()

      const response = await sendPost(
        `/api/conversations/${conversationId}/last-seen`
      )

      expect(response.status).toBe(204)
      expect(
        mockedDirectMessageService.markConversationSeen
      ).toHaveBeenCalledWith(conversationId, mockUser)
    })

    test('returns 404 if the user is not in the conversation', async () => {
      mockedDirectMessageService.markConversationSeen.mockRejectedValueOnce(
        new ConversationNotFoundError()
      )

      const response = await sendPost(
        `/api/conversations/${getUuid()}/last-seen`
      )

      expect(response.status).toBe(404)
    })

    test('returns 404 for a malformed conversation id', async () => {
      const response = await sendPost('/api/conversations/not-an-id/last-seen')

      expect(response.status).toBe(404)
      expect(
        mockedDirectMessageService.markConversationSeen
      ).not.toHaveBeenCalled()
    })
  })

  describe('GET /api/conversations/unread', () => {
    test('returns the ids of users who sent the user unread messages', async () => {
      const senderIds = [getUuid(), getUuid()]
      mockedDirectMessageService.getUnreadMessageSenderIds.mockResolvedValueOnce(
        senderIds
      )

      const response = await sendGet('/api/conversations/unread')

      expect(response.status).toBe(200)
      expect(
        mockedDirectMessageService.getUnreadMessageSenderIds
      ).toHaveBeenCalledWith(mockUser)
      expect(response.body).toEqual({ senderIds })
    })

    test('returns an empty list when there are no unread messages', async () => {
      mockedDirectMessageService.getUnreadMessageSenderIds.mockResolvedValueOnce(
        []
      )

      const response = await sendGet('/api/conversations/unread')

      expect(response.status).toBe(200)
      expect(response.body).toEqual({ senderIds: [] })
    })
  })

  describe('POST /api/conversations/:conversationId/report', () => {
    test('returns the report ID and uses the authenticated reporter', async () => {
      const conversationId = getUuid()
      const reportId = getUuid()
      mocked(DirectMessageReportService.reportConversation).mockResolvedValue(
        reportId
      )
      const payload = {
        reportReason: SESSION_REPORT_REASON.COACH_DM_TO_STUDENT_CONNECT_OFFLINE,
        reportMessage: 'Report message',
      }
      const response = await sendPost(
        `/api/conversations/${conversationId}/report`,
        payload
      )
      expect(response.status).toBe(200)
      expect(response.body).toEqual({ reportId })
      expect(
        DirectMessageReportService.reportConversation
      ).toHaveBeenCalledWith(conversationId, mockUser, {
        ...payload,
      })
    })

    test('returns 404 for a conversation the user cannot access', async () => {
      mocked(DirectMessageReportService.reportConversation).mockRejectedValue(
        new ConversationNotFoundError()
      )
      const response = await sendPost(
        `/api/conversations/${getUuid()}/report`,
        { reportReason: 'reason' }
      )
      expect(response.status).toBe(404)
    })

    test('returns 422 for an unsupported report reason', async () => {
      mocked(DirectMessageReportService.reportConversation).mockRejectedValue(
        new InputError('Invalid report reason')
      )
      const response = await sendPost(
        `/api/conversations/${getUuid()}/report`,
        { reportReason: 'invalid' }
      )
      expect(response.status).toBe(422)
    })
  })
})
