import { mocked } from 'jest-mock'
import * as SafetyReviewService from '../../services/SafetyReviewService'
import * as SessionRepo from '../../models/Session'
import * as DirectMessageRepo from '../../models/DirectMessage'
import { ConversationNotFoundError } from '../../services/Errors'
import {
  buildDirectMessage,
  buildDirectMessageConversation,
} from '../mocks/generate'
import { getUuid } from '../../models/pgUtils'

jest.mock('../../models/Session')
jest.mock('../../models/DirectMessage')

const mockedSessionRepo = mocked(SessionRepo)
const mockedDirectMessageRepo = mocked(DirectMessageRepo)

beforeEach(() => {
  jest.resetAllMocks()
})

describe('SafetyReviewService', () => {
  test('combines pending session and DM conversation counts', async () => {
    mockedSessionRepo.getPendingReviewCount.mockResolvedValue(2)
    mockedDirectMessageRepo.getPendingReviewCount.mockResolvedValue(3)

    expect(await SafetyReviewService.getReviewCounts()).toEqual({
      sessions: 2,
      conversations: 3,
    })
  })

  test('does not return partial counts when a queue cannot be loaded', async () => {
    mockedSessionRepo.getPendingReviewCount.mockRejectedValue(
      new Error('Session query failed')
    )
    mockedDirectMessageRepo.getPendingReviewCount.mockResolvedValue(3)

    await expect(SafetyReviewService.getReviewCounts()).rejects.toThrow(
      'Session query failed'
    )
  })

  test('uses the extra conversation to determine whether another review page exists', async () => {
    const conversations = Array.from({ length: 26 }, () => ({
      id: getUuid(),
      studentId: getUuid(),
      volunteerId: getUuid(),
      studentName: 'Student',
      volunteerName: 'Coach',
      oldestFlagAt: new Date(),
      pendingFlags: 1,
      reasons: ['PII'],
    }))
    mockedDirectMessageRepo.getPendingReviewConversations.mockResolvedValue(
      conversations
    )

    const result = await SafetyReviewService.getPendingDirectMessageReviews(2)

    expect(
      mockedDirectMessageRepo.getPendingReviewConversations
    ).toHaveBeenCalledWith(26, 25)
    expect(result.conversations).toEqual(conversations.slice(0, 25))
    expect(result.isLastPage).toBe(false)
  })

  test('returns the newest message page in chronological order with an older-history cursor', async () => {
    const conversationId = getUuid()
    const beforeId = getUuid()
    const messages = Array.from({ length: 101 }, () =>
      buildDirectMessage({ conversationId })
    )
    mockedDirectMessageRepo.getMessagesForReview.mockResolvedValue(messages)

    const result = await SafetyReviewService.getDirectMessageReviewMessages(
      conversationId,
      beforeId
    )

    expect(mockedDirectMessageRepo.getMessagesForReview).toHaveBeenCalledWith(
      conversationId,
      101,
      beforeId
    )
    expect(result.messages).toEqual(messages.slice(0, 100).reverse())
    expect(result.hasMore).toBe(true)
  })

  test('loads a conversation with its evidence and chronological history', async () => {
    const conversation = {
      ...buildDirectMessageConversation(),
      studentName: 'Student',
      volunteerName: 'Coach',
    }
    const flags = [{ id: getUuid(), category: 'PII', createdAt: new Date() }]
    const newest = buildDirectMessage({ conversationId: conversation.id })
    const oldest = buildDirectMessage({ conversationId: conversation.id })
    mockedDirectMessageRepo.getConversationForReview.mockResolvedValue(
      conversation
    )
    mockedDirectMessageRepo.getPendingReviewFlags.mockResolvedValue(flags)
    mockedDirectMessageRepo.getMessagesForReview.mockResolvedValue([
      newest,
      oldest,
    ])

    const result = await SafetyReviewService.getDirectMessageReview(
      conversation.id
    )

    expect(result).toEqual({
      conversation,
      flags,
      messages: [oldest, newest],
      hasMore: false,
    })
    expect(mockedDirectMessageRepo.getPendingReviewFlags).toHaveBeenCalledWith(
      conversation.id
    )
    expect(mockedDirectMessageRepo.getMessagesForReview).toHaveBeenCalledWith(
      conversation.id,
      101,
      undefined
    )
  })

  test('rejects a missing conversation before loading its evidence or messages', async () => {
    mockedDirectMessageRepo.getConversationForReview.mockResolvedValue(
      undefined
    )

    await expect(
      SafetyReviewService.getDirectMessageReview(getUuid())
    ).rejects.toThrow(ConversationNotFoundError)
    expect(mockedDirectMessageRepo.getPendingReviewFlags).not.toHaveBeenCalled()
    expect(mockedDirectMessageRepo.getMessagesForReview).not.toHaveBeenCalled()
  })

  test('passes only the displayed flag IDs to the scoped review update', async () => {
    const conversationId = getUuid()
    const flagIds = [getUuid(), getUuid()]
    mockedDirectMessageRepo.markFlagsReviewed.mockResolvedValue(1)

    expect(
      await SafetyReviewService.markDirectMessageFlagsReviewed(
        conversationId,
        flagIds
      )
    ).toBe(1)
    expect(mockedDirectMessageRepo.markFlagsReviewed).toHaveBeenCalledWith(
      conversationId,
      flagIds
    )
  })
})
