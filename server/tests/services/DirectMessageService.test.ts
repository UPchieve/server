import { mocked } from 'jest-mock'
import { Pool } from 'pg'
import * as DirectMessageService from '../../services/DirectMessageService'
import * as DirectMessageRepo from '../../models/DirectMessage'
import { ConversationNotFoundError } from '../../services/Errors'
import {
  DirectMessageModerationError,
  InputError,
  NotAllowedError,
} from '../../models/Errors'
import { RoleContext } from '../../services/UserRolesService'
import { getDbUlid } from '../../models/pgUtils'
import {
  buildUserContactInfo,
  buildDirectMessageConversation,
  buildDirectMessage,
} from '../mocks/generate'
import * as DirectMessageModerationService from '../../services/DirectMessageModerationService'
import * as DirectMessageModerationRepo from '../../models/DirectMessageModeration/queries'
import * as Db from '../../db'

jest.mock('../../models/DirectMessage')
jest.mock('../../services/DirectMessageModerationService')
jest.mock('../../models/DirectMessageModeration/queries')
jest.mock('../../db')

const mockedDirectMessageRepo = mocked(DirectMessageRepo)
const mockedDirectMessageModerationService = mocked(
  DirectMessageModerationService
)
const mockedDirectMessageModerationRepo = mocked(DirectMessageModerationRepo)
const mockedDb = mocked(Db)
const transactionClient = new Pool()

afterAll(async () => {
  await transactionClient.end()
})

describe('DirectMessageService', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    mockedDirectMessageModerationService.moderateMessage.mockResolvedValue({
      blocked: false,
      reasons: [],
    })
    mockedDb.runInTransaction.mockImplementation(async (cb) =>
      cb(transactionClient)
    )
  })

  describe('getOrCreateConversation', () => {
    test('uses the user as the student when they are acting as a student', async () => {
      const student = buildUserContactInfo()
      const volunteerId = getDbUlid()
      const conversation = buildDirectMessageConversation({
        studentId: student.id,
        volunteerId,
      })
      mockedDirectMessageRepo.getOrCreateConversation.mockResolvedValue(
        conversation
      )

      const result = await DirectMessageService.getOrCreateConversation(
        student,
        volunteerId
      )

      expect(
        mockedDirectMessageRepo.getOrCreateConversation
      ).toHaveBeenCalledWith(student.id, volunteerId)
      expect(result).toEqual(conversation)
    })

    test('uses the user as the volunteer when they are acting as a coach', async () => {
      const volunteer = buildUserContactInfo({
        roles: ['volunteer'],
        roleContext: new RoleContext(['volunteer'], 'volunteer', 'volunteer'),
      })
      const studentId = getDbUlid()
      mockedDirectMessageRepo.getOrCreateConversation.mockResolvedValue(
        buildDirectMessageConversation({ studentId, volunteerId: volunteer.id })
      )

      await DirectMessageService.getOrCreateConversation(volunteer, studentId)

      expect(
        mockedDirectMessageRepo.getOrCreateConversation
      ).toHaveBeenCalledWith(studentId, volunteer.id)
    })

    test('throws if the pair has not had a session together', async () => {
      const student = buildUserContactInfo()
      mockedDirectMessageRepo.getOrCreateConversation.mockResolvedValue(
        undefined
      )

      await expect(
        DirectMessageService.getOrCreateConversation(student, getDbUlid())
      ).rejects.toThrow(ConversationNotFoundError)
    })

    test('does not allow users who are not acting as a student or coach', async () => {
      const teacher = buildUserContactInfo({
        roles: ['teacher'],
        roleContext: new RoleContext(['teacher'], 'teacher', 'teacher'),
      })

      await expect(
        DirectMessageService.getOrCreateConversation(teacher, getDbUlid())
      ).rejects.toThrow(NotAllowedError)
      expect(
        mockedDirectMessageRepo.getOrCreateConversation
      ).not.toHaveBeenCalled()
    })
  })

  describe('getMessages', () => {
    test("returns the conversation's messages for a participant", async () => {
      const user = buildUserContactInfo()
      const conversation = buildDirectMessageConversation({
        studentId: user.id,
      })
      const messages = [buildDirectMessage({ conversationId: conversation.id })]
      mockedDirectMessageRepo.getConversationForParticipant.mockResolvedValue(
        conversation
      )
      mockedDirectMessageRepo.getDirectMessagesForConversation.mockResolvedValue(
        messages
      )

      const result = await DirectMessageService.getMessages(
        conversation.id,
        user
      )

      expect(
        mockedDirectMessageRepo.getConversationForParticipant
      ).toHaveBeenCalledWith(conversation.id, user.id)
      expect(
        mockedDirectMessageRepo.getDirectMessagesForConversation
      ).toHaveBeenCalledWith(conversation.id)
      expect(result).toEqual(messages)
    })

    test('throws if the user is not in the conversation', async () => {
      const user = buildUserContactInfo()
      mockedDirectMessageRepo.getConversationForParticipant.mockResolvedValue(
        undefined
      )

      await expect(
        DirectMessageService.getMessages(getDbUlid(), user)
      ).rejects.toThrow(ConversationNotFoundError)
      expect(
        mockedDirectMessageRepo.getDirectMessagesForConversation
      ).not.toHaveBeenCalled()
    })
  })

  describe('sendMessage', () => {
    test('saves the trimmed message from the user', async () => {
      const user = buildUserContactInfo()
      const conversation = buildDirectMessageConversation({
        studentId: user.id,
      })
      const message = buildDirectMessage()
      mockedDirectMessageRepo.getConversationForParticipant.mockResolvedValue(
        conversation
      )
      mockedDirectMessageRepo.createDirectMessage.mockResolvedValue(message)

      const result = await DirectMessageService.sendMessage(
        conversation.id,
        user,
        '  Hi!  '
      )

      expect(mockedDirectMessageRepo.createDirectMessage).toHaveBeenCalledWith(
        {
          conversationId: conversation.id,
          senderId: user.id,
          contents: 'Hi!',
        },
        transactionClient
      )
      expect(result).toEqual({ conversation, message })
    })

    test('logs the blocked message and queues review without delivering it', async () => {
      const user = buildUserContactInfo()
      const conversation = buildDirectMessageConversation({
        studentId: user.id,
      })
      mockedDirectMessageRepo.getConversationForParticipant.mockResolvedValue(
        conversation
      )
      mockedDirectMessageModerationService.moderateMessage.mockResolvedValue({
        blocked: true,
        censoredBy: 'regex',
        reasons: ['EMAIL'],
      })
      await expect(
        DirectMessageService.sendMessage(conversation.id, user, 'email')
      ).rejects.toThrow(DirectMessageModerationError)
      expect(
        DirectMessageModerationRepo.createCensoredDirectMessage
      ).toHaveBeenCalledWith(
        expect.objectContaining({ blocked: true, reasons: ['EMAIL'] }),
        expect.anything()
      )
      expect(mockedDirectMessageRepo.createDirectMessage).not.toHaveBeenCalled()
      expect(
        DirectMessageModerationRepo.createDirectMessageFlag
      ).toHaveBeenCalledTimes(1)
    })

    test('logs regex evidence even when AI allows delivery', async () => {
      const user = buildUserContactInfo()
      mockedDirectMessageRepo.getConversationForParticipant.mockResolvedValue(
        buildDirectMessageConversation({ studentId: user.id })
      )
      mockedDirectMessageModerationService.moderateMessage.mockResolvedValue({
        blocked: false,
        censoredBy: 'regex',
        reasons: ['PROFANITY'],
      })
      mockedDirectMessageRepo.createDirectMessage.mockResolvedValue(
        buildDirectMessage()
      )
      await DirectMessageService.sendMessage(getDbUlid(), user, 'allowed')
      expect(
        DirectMessageModerationRepo.createCensoredDirectMessage
      ).toHaveBeenCalledWith(
        expect.objectContaining({ blocked: false }),
        expect.anything()
      )
      expect(mockedDirectMessageRepo.createDirectMessage).toHaveBeenCalledTimes(
        1
      )
      expect(
        DirectMessageModerationRepo.createDirectMessageFlag
      ).not.toHaveBeenCalled()
    })

    test('creates one review flag per category', async () => {
      const user = buildUserContactInfo()
      const conversation = buildDirectMessageConversation({
        studentId: user.id,
      })
      mockedDirectMessageRepo.getConversationForParticipant.mockResolvedValue(
        conversation
      )
      const evidenceId = getDbUlid()
      mockedDirectMessageModerationRepo.createCensoredDirectMessage.mockResolvedValue(
        evidenceId
      )
      mockedDirectMessageModerationService.moderateMessage.mockResolvedValue({
        blocked: true,
        censoredBy: 'regex',
        reasons: ['EMAIL', 'PHONE'],
      })
      await expect(
        DirectMessageService.sendMessage(conversation.id, user, 'blocked')
      ).rejects.toThrow(DirectMessageModerationError)
      expect(
        DirectMessageModerationRepo.createDirectMessageFlag
      ).toHaveBeenCalledTimes(1)
      expect(
        DirectMessageModerationRepo.createDirectMessageFlag
      ).toHaveBeenCalledWith(
        {
          conversationId: conversation.id,
          censoredMessageId: evidenceId,
          flagName: 'Personally identifiable information',
        },
        expect.anything()
      )
    })

    test('does not deliver or create a violation flag on evaluation failure', async () => {
      const user = buildUserContactInfo()
      mockedDirectMessageRepo.getConversationForParticipant.mockResolvedValue(
        buildDirectMessageConversation({ studentId: user.id })
      )
      mockedDirectMessageModerationService.moderateMessage.mockRejectedValue(
        new Error('provider failure')
      )
      await expect(
        DirectMessageService.sendMessage(getDbUlid(), user, 'hello')
      ).rejects.toMatchObject({ unavailable: true })
      expect(mockedDirectMessageRepo.createDirectMessage).not.toHaveBeenCalled()
      expect(
        DirectMessageModerationRepo.createCensoredDirectMessage
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          reasons: ['MODERATION_UNAVAILABLE'],
          blocked: true,
        }),
        expect.anything()
      )
      expect(
        DirectMessageModerationRepo.createDirectMessageFlag
      ).not.toHaveBeenCalled()
    })

    test('does not deliver if evidence cannot be saved', async () => {
      const user = buildUserContactInfo()
      mockedDirectMessageRepo.getConversationForParticipant.mockResolvedValue(
        buildDirectMessageConversation({ studentId: user.id })
      )
      mockedDirectMessageModerationService.moderateMessage.mockResolvedValue({
        blocked: false,
        censoredBy: 'regex',
        reasons: ['PROFANITY'],
      })
      mockedDirectMessageModerationRepo.createCensoredDirectMessage.mockRejectedValue(
        new Error('database failure')
      )
      await expect(
        DirectMessageService.sendMessage(getDbUlid(), user, 'hello')
      ).rejects.toThrow('database failure')
      expect(mockedDirectMessageRepo.createDirectMessage).not.toHaveBeenCalled()
    })

    test('rejects a blank message', async () => {
      const user = buildUserContactInfo()

      await expect(
        DirectMessageService.sendMessage(getDbUlid(), user, '   ')
      ).rejects.toThrow(InputError)
      expect(mockedDirectMessageRepo.createDirectMessage).not.toHaveBeenCalled()
    })

    test('throws if the user is not in the conversation', async () => {
      const user = buildUserContactInfo()
      mockedDirectMessageRepo.getConversationForParticipant.mockResolvedValue(
        undefined
      )

      await expect(
        DirectMessageService.sendMessage(getDbUlid(), user, 'Hi!')
      ).rejects.toThrow(ConversationNotFoundError)
      expect(mockedDirectMessageRepo.createDirectMessage).not.toHaveBeenCalled()
      expect(
        DirectMessageModerationService.moderateMessage
      ).not.toHaveBeenCalled()
    })
  })

  describe('markConversationSeen', () => {
    test("updates the user's last-seen time for the conversation", async () => {
      const user = buildUserContactInfo()
      const conversationId = getDbUlid()
      mockedDirectMessageRepo.updateConversationLastSeen.mockResolvedValue(true)

      await DirectMessageService.markConversationSeen(conversationId, user)

      expect(
        mockedDirectMessageRepo.updateConversationLastSeen
      ).toHaveBeenCalledWith(conversationId, user.id)
    })

    test('throws if the user is not in the conversation', async () => {
      const user = buildUserContactInfo()
      mockedDirectMessageRepo.updateConversationLastSeen.mockResolvedValue(
        false
      )

      await expect(
        DirectMessageService.markConversationSeen(getDbUlid(), user)
      ).rejects.toThrow(ConversationNotFoundError)
    })
  })

  describe('getUnreadMessageSenderIds', () => {
    test('returns the ids of users who sent the user unread messages', async () => {
      const user = buildUserContactInfo()
      const senderIds = [getDbUlid(), getDbUlid()]
      mockedDirectMessageRepo.getUnreadDirectMessageSenderIds.mockResolvedValue(
        senderIds
      )

      const result = await DirectMessageService.getUnreadMessageSenderIds(user)

      expect(
        mockedDirectMessageRepo.getUnreadDirectMessageSenderIds
      ).toHaveBeenCalledWith(user.id)
      expect(result).toEqual(senderIds)
    })
  })
})
