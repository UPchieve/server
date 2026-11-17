import request, { Response } from 'supertest'
import { mocked } from 'jest-mock'
import { mockApp, mockPassportMiddleware, mockRouter } from '../../mock-app'
import { routeAdmin } from '../../../router/api/admin'
import * as SafetyReviewService from '../../../services/SafetyReviewService'
import { ConversationNotFoundError } from '../../../services/Errors'
import { buildUserContactInfo } from '../../mocks/generate'
import { getUuid } from '../../../models/pgUtils'

jest.mock('../../../services/SafetyReviewService')
jest.mock('../../../logger')

const mockedSafetyReviewService = mocked(SafetyReviewService)

let user = { ...buildUserContactInfo(), isAdmin: true }
let verified = true

const app = mockApp()

app.use(mockPassportMiddleware(() => user))

app.use((req, _res, next) => {
  req.session.totpVerifiedAt = verified ? Date.now() : undefined
  next()
})

const router = mockRouter()
routeAdmin(router)

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

beforeEach(() => {
  jest.resetAllMocks()
  user = { ...buildUserContactInfo(), isAdmin: true }
  verified = true
})

describe('routeAdmin', () => {
  describe('admin access', () => {
    test('returns 403 if the user is not an admin', async () => {
      user.isAdmin = false
      const response = await sendGet('/api/admin/safety-reviews/counts')
      expect(response.status).toBe(403)
      expect(mockedSafetyReviewService.getReviewCounts).not.toHaveBeenCalled()
    })

    test('returns 403 if TOTP is not verified', async () => {
      verified = false
      const response = await sendPost(
        `/api/admin/direct-message-reviews/${getUuid()}/review`,
        { flagIds: [getUuid()] }
      )
      expect(response.status).toBe(403)
      expect(
        mockedSafetyReviewService.markDirectMessageFlagsReviewed
      ).not.toHaveBeenCalled()
    })
  })

  describe('GET /api/admin/safety-reviews/counts', () => {
    test('returns the session and DM review counts', async () => {
      mockedSafetyReviewService.getReviewCounts.mockResolvedValue({
        sessions: 2,
        conversations: 3,
      })
      const response = await sendGet('/api/admin/safety-reviews/counts')
      expect(response.status).toBe(200)
      expect(response.body).toEqual({ sessions: 2, conversations: 3 })
    })
  })

  describe('GET /api/admin/direct-message-reviews', () => {
    test('uses page 1 if no page is provided', async () => {
      mockedSafetyReviewService.getPendingDirectMessageReviews.mockResolvedValue(
        { conversations: [], isLastPage: true }
      )
      const response = await sendGet('/api/admin/direct-message-reviews')
      expect(response.status).toBe(200)
      expect(
        mockedSafetyReviewService.getPendingDirectMessageReviews
      ).toHaveBeenCalledWith(1)
      expect(response.body).toEqual({ conversations: [], isLastPage: true })
    })

    test('uses the page from the query', async () => {
      mockedSafetyReviewService.getPendingDirectMessageReviews.mockResolvedValue(
        { conversations: [], isLastPage: true }
      )
      const response = await sendGet('/api/admin/direct-message-reviews?page=2')
      expect(response.status).toBe(200)
      expect(
        mockedSafetyReviewService.getPendingDirectMessageReviews
      ).toHaveBeenCalledWith(2)
    })

    test('returns 422 if page is 0', async () => {
      const response = await sendGet('/api/admin/direct-message-reviews?page=0')
      expect(response.status).toBe(422)
      expect(
        mockedSafetyReviewService.getPendingDirectMessageReviews
      ).not.toHaveBeenCalled()
    })

    test('returns 422 if page is not a whole number', async () => {
      const response = await sendGet(
        '/api/admin/direct-message-reviews?page=1.5'
      )
      expect(response.status).toBe(422)
      expect(
        mockedSafetyReviewService.getPendingDirectMessageReviews
      ).not.toHaveBeenCalled()
    })

    test('returns 422 if page is not a number', async () => {
      const response = await sendGet(
        '/api/admin/direct-message-reviews?page=invalid'
      )
      expect(response.status).toBe(422)
      expect(
        mockedSafetyReviewService.getPendingDirectMessageReviews
      ).not.toHaveBeenCalled()
    })
  })

  describe('GET /api/admin/direct-message-reviews/:conversationId', () => {
    test('returns the conversation and its flags', async () => {
      const conversationId = getUuid()
      const conversation = {
        id: conversationId,
        studentId: getUuid(),
        volunteerId: getUuid(),
        studentName: 'Student',
        volunteerName: 'Coach',
      }
      const createdAt = new Date()
      const flags = [{ id: getUuid(), category: 'PII', createdAt }]
      mockedSafetyReviewService.getDirectMessageReview.mockResolvedValue({
        conversation,
        flags,
        messages: [],
        hasMore: false,
      })
      const response = await sendGet(
        `/api/admin/direct-message-reviews/${conversationId}`
      )
      expect(response.status).toBe(200)
      expect(
        mockedSafetyReviewService.getDirectMessageReview
      ).toHaveBeenCalledWith(conversationId)
      expect(response.body).toEqual({
        conversation,
        flags: [{ ...flags[0], createdAt: createdAt.toISOString() }],
        messages: [],
        hasMore: false,
      })
    })

    test('returns 404 if the conversation does not exist', async () => {
      mockedSafetyReviewService.getDirectMessageReview.mockRejectedValue(
        new ConversationNotFoundError()
      )
      const response = await sendGet(
        `/api/admin/direct-message-reviews/${getUuid()}`
      )
      expect(response.status).toBe(404)
    })

    test('returns 422 for an invalid conversation ID', async () => {
      const response = await sendGet(
        '/api/admin/direct-message-reviews/invalid'
      )
      expect(response.status).toBe(422)
      expect(
        mockedSafetyReviewService.getDirectMessageReview
      ).not.toHaveBeenCalled()
    })
  })

  describe('GET /api/admin/direct-message-reviews/:conversationId/messages', () => {
    test('gets messages before the given message ID', async () => {
      const conversationId = getUuid()
      const beforeId = getUuid()
      mockedSafetyReviewService.getDirectMessageReviewMessages.mockResolvedValue(
        { messages: [], hasMore: false }
      )
      const response = await sendGet(
        `/api/admin/direct-message-reviews/${conversationId}/messages?beforeId=${beforeId}`
      )
      expect(response.status).toBe(200)
      expect(response.body).toEqual({ messages: [], hasMore: false })
      expect(
        mockedSafetyReviewService.getDirectMessageReviewMessages
      ).toHaveBeenCalledWith(conversationId, beforeId)
    })

    test('returns 422 for an invalid beforeId', async () => {
      const response = await sendGet(
        `/api/admin/direct-message-reviews/${getUuid()}/messages?beforeId=invalid`
      )
      expect(response.status).toBe(422)
      expect(
        mockedSafetyReviewService.getDirectMessageReviewMessages
      ).not.toHaveBeenCalled()
    })
  })

  describe('POST /api/admin/direct-message-reviews/:conversationId/review', () => {
    test('marks the given flags as reviewed', async () => {
      const conversationId = getUuid()
      const flagIds = [getUuid(), getUuid()]
      mockedSafetyReviewService.markDirectMessageFlagsReviewed.mockResolvedValue(
        2
      )
      const response = await sendPost(
        `/api/admin/direct-message-reviews/${conversationId}/review`,
        { flagIds }
      )
      expect(response.status).toBe(200)
      expect(response.body).toEqual({ reviewedCount: 2 })
      expect(
        mockedSafetyReviewService.markDirectMessageFlagsReviewed
      ).toHaveBeenCalledWith(conversationId, flagIds)
    })

    test('returns 422 if no flag IDs are provided', async () => {
      const response = await sendPost(
        `/api/admin/direct-message-reviews/${getUuid()}/review`,
        { flagIds: [] }
      )
      expect(response.status).toBe(422)
      expect(
        mockedSafetyReviewService.markDirectMessageFlagsReviewed
      ).not.toHaveBeenCalled()
    })

    test('returns 422 for invalid flag IDs', async () => {
      const response = await sendPost(
        `/api/admin/direct-message-reviews/${getUuid()}/review`,
        { flagIds: ['invalid'] }
      )
      expect(response.status).toBe(422)
      expect(
        mockedSafetyReviewService.markDirectMessageFlagsReviewed
      ).not.toHaveBeenCalled()
    })
  })
})
