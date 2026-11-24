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
import * as UserRepo from '../../models/User'
import { USER_BAN_TYPES } from '../../constants'
import * as QueueService from '../../services/QueueService'
import logger from '../../logger'

jest.mock('../../models/DirectMessage')
jest.mock('../../services/DirectMessageModerationService')
jest.mock('../../models/DirectMessageModeration/queries')
jest.mock('../../db')
jest.mock('../../models/User')
jest.mock('../../services/QueueService')

const mockedDirectMessageRepo = mocked(DirectMessageRepo)
const mockedDirectMessageModerationService = mocked(
  DirectMessageModerationService
)
const mockedDirectMessageModerationRepo = mocked(DirectMessageModerationRepo)
const mockedDb = mocked(Db)
const mockedUserRepo = mocked(UserRepo)
const mockedQueueService = mocked(QueueService)
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
    mockedUserRepo.getUsersBanStatuses.mockResolvedValue([])
    mockedQueueService.add.mockResolvedValue(undefined as any)
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

    test.each([USER_BAN_TYPES.SHADOW, USER_BAN_TYPES.COMPLETE])(
      'does not let a volunteer message a %s banned student',
      async (banType) => {
        const volunteer = buildUserContactInfo({
          roles: ['volunteer'],
          roleContext: new RoleContext(['volunteer'], 'volunteer', 'volunteer'),
        })
        const studentId = getDbUlid()
        mockedUserRepo.getUsersBanStatuses.mockResolvedValue([
          { id: studentId, banType },
        ])

        const result = DirectMessageService.getOrCreateConversation(
          volunteer,
          studentId
        )

        await expect(result).rejects.toThrow(NotAllowedError)
        await expect(result).rejects.toThrow(
          "You can't message this student right now"
        )
        expect(mockedUserRepo.getUsersBanStatuses).toHaveBeenCalledWith([
          studentId,
        ])
        expect(
          mockedDirectMessageRepo.getOrCreateConversation
        ).not.toHaveBeenCalled()
      }
    )

    test('does not let a student message a completely banned volunteer', async () => {
      const student = buildUserContactInfo()
      const volunteerId = getDbUlid()
      mockedUserRepo.getUsersBanStatuses.mockResolvedValue([
        { id: volunteerId, banType: USER_BAN_TYPES.COMPLETE },
      ])

      const result = DirectMessageService.getOrCreateConversation(
        student,
        volunteerId
      )

      await expect(result).rejects.toThrow(NotAllowedError)
      await expect(result).rejects.toThrow(
        "You can't message this coach right now"
      )
      expect(mockedUserRepo.getUsersBanStatuses).toHaveBeenCalledWith([
        volunteerId,
      ])
      expect(
        mockedDirectMessageRepo.getOrCreateConversation
      ).not.toHaveBeenCalled()
    })

    test('lets a student message a shadow-banned volunteer', async () => {
      const student = buildUserContactInfo()
      const volunteerId = getDbUlid()
      const conversation = buildDirectMessageConversation({
        studentId: student.id,
        volunteerId,
      })
      mockedUserRepo.getUsersBanStatuses.mockResolvedValue([
        { id: volunteerId, banType: USER_BAN_TYPES.SHADOW },
      ])
      mockedDirectMessageRepo.getOrCreateConversation.mockResolvedValue(
        conversation
      )

      const result = await DirectMessageService.getOrCreateConversation(
        student,
        volunteerId
      )

      expect(result).toEqual(conversation)
    })

    test('lets a shadow-banned student get their conversation', async () => {
      const student = buildUserContactInfo({ banType: USER_BAN_TYPES.SHADOW })
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

      expect(result).toEqual(conversation)
      expect(mockedUserRepo.getUsersBanStatuses).toHaveBeenCalledTimes(1)
      expect(mockedUserRepo.getUsersBanStatuses).toHaveBeenCalledWith([
        volunteerId,
      ])
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
      ).toHaveBeenCalledWith(conversation.id, user.id)
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
          sentWhileShadowbanned: false,
        },
        transactionClient
      )
      expect(result).toEqual({ conversation, message })
    })

    test.each([USER_BAN_TYPES.SHADOW, USER_BAN_TYPES.COMPLETE])(
      'does not let a volunteer message a %s banned student',
      async (banType) => {
        const volunteer = buildUserContactInfo({
          roles: ['volunteer'],
          roleContext: new RoleContext(['volunteer'], 'volunteer', 'volunteer'),
        })
        const conversation = buildDirectMessageConversation({
          volunteerId: volunteer.id,
        })
        mockedDirectMessageRepo.getConversationForParticipant.mockResolvedValue(
          conversation
        )
        mockedUserRepo.getUsersBanStatuses.mockResolvedValue([
          { id: conversation.studentId, banType },
        ])

        await expect(
          DirectMessageService.sendMessage(conversation.id, volunteer, 'Hi!')
        ).rejects.toThrow(NotAllowedError)

        expect(mockedUserRepo.getUsersBanStatuses).toHaveBeenCalledWith([
          conversation.studentId,
        ])
        expect(
          mockedDirectMessageModerationService.moderateMessage
        ).not.toHaveBeenCalled()
        expect(
          mockedDirectMessageModerationRepo.createCensoredDirectMessage
        ).not.toHaveBeenCalled()
        expect(
          mockedDirectMessageRepo.createDirectMessage
        ).not.toHaveBeenCalled()
      }
    )

    test('does not let a student message a completely banned volunteer', async () => {
      const student = buildUserContactInfo()
      const conversation = buildDirectMessageConversation({
        studentId: student.id,
      })
      mockedDirectMessageRepo.getConversationForParticipant.mockResolvedValue(
        conversation
      )
      mockedUserRepo.getUsersBanStatuses.mockResolvedValue([
        { id: conversation.volunteerId, banType: USER_BAN_TYPES.COMPLETE },
      ])

      await expect(
        DirectMessageService.sendMessage(conversation.id, student, 'Hi!')
      ).rejects.toThrow("You can't message this coach right now")

      expect(mockedUserRepo.getUsersBanStatuses).toHaveBeenCalledWith([
        conversation.volunteerId,
      ])
      expect(
        mockedDirectMessageModerationService.moderateMessage
      ).not.toHaveBeenCalled()
      expect(mockedDirectMessageRepo.createDirectMessage).not.toHaveBeenCalled()
    })

    test('lets a student message a shadow-banned volunteer', async () => {
      const student = buildUserContactInfo()
      const conversation = buildDirectMessageConversation({
        studentId: student.id,
      })
      mockedDirectMessageRepo.getConversationForParticipant.mockResolvedValue(
        conversation
      )
      mockedDirectMessageRepo.createDirectMessage.mockResolvedValue(
        buildDirectMessage()
      )
      mockedUserRepo.getUsersBanStatuses.mockResolvedValue([
        { id: conversation.volunteerId, banType: USER_BAN_TYPES.SHADOW },
      ])

      await DirectMessageService.sendMessage(conversation.id, student, 'Hi!')

      expect(mockedDirectMessageRepo.createDirectMessage).toHaveBeenCalled()
    })

    test.each([
      ['student', buildUserContactInfo({ banType: USER_BAN_TYPES.COMPLETE })],
      [
        'volunteer',
        buildUserContactInfo({
          banType: USER_BAN_TYPES.COMPLETE,
          roles: ['volunteer'],
          roleContext: new RoleContext(['volunteer'], 'volunteer', 'volunteer'),
        }),
      ],
    ])(
      'does not let a completely banned %s send a message',
      async (_, user) => {
        await expect(
          DirectMessageService.sendMessage(getDbUlid(), user, 'Hi!')
        ).rejects.toThrow("You can't send messages right now")

        expect(
          mockedDirectMessageRepo.getConversationForParticipant
        ).not.toHaveBeenCalled()
        expect(
          mockedDirectMessageRepo.createDirectMessage
        ).not.toHaveBeenCalled()
      }
    )

    describe('marking messages sent while shadow banned', () => {
      async function sendAs(
        user: ReturnType<typeof buildUserContactInfo>,
        role: 'student' | 'volunteer'
      ) {
        const conversation = buildDirectMessageConversation(
          role === 'student' ? { studentId: user.id } : { volunteerId: user.id }
        )
        mockedDirectMessageRepo.getConversationForParticipant.mockResolvedValue(
          conversation
        )
        mockedDirectMessageRepo.createDirectMessage.mockResolvedValue(
          buildDirectMessage()
        )
        await DirectMessageService.sendMessage(conversation.id, user, 'Hi!')
        return mockedDirectMessageRepo.createDirectMessage.mock.calls[0][0]
          .sentWhileShadowbanned
      }

      test('marks a message from a shadow-banned student', async () => {
        const user = buildUserContactInfo({ banType: USER_BAN_TYPES.SHADOW })

        expect(await sendAs(user, 'student')).toBe(true)
      })

      test('does not mark a message from a shadow-banned volunteer', async () => {
        const user = buildUserContactInfo({
          banType: USER_BAN_TYPES.SHADOW,
          roles: ['volunteer'],
          roleContext: new RoleContext(['volunteer'], 'volunteer', 'volunteer'),
        })

        expect(await sendAs(user, 'volunteer')).toBe(false)
      })
    })

    test.each([
      ['student', 'volunteer'],
      ['volunteer', 'student'],
    ] as const)(
      'queues a new DM email to the other participant when a %s sends a message',
      async (senderRole, recipientRole) => {
        const user = buildUserContactInfo()
        const partnerId = getDbUlid()
        const conversation = buildDirectMessageConversation(
          senderRole === 'student'
            ? { studentId: user.id, volunteerId: partnerId }
            : { studentId: partnerId, volunteerId: user.id }
        )
        mockedDirectMessageRepo.getConversationForParticipant.mockResolvedValue(
          conversation
        )
        mockedDirectMessageRepo.createDirectMessage.mockResolvedValue(
          buildDirectMessage()
        )

        await DirectMessageService.sendMessage(conversation.id, user, 'Hi!')

        expect(mockedQueueService.add).toHaveBeenCalledWith(
          'EmailNewDirectMessage',
          { delay: 0, removeOnComplete: true },
          { recipientId: partnerId, recipientRole }
        )
      }
    )

    test('does not queue a new DM email for a message from a shadow-banned student', async () => {
      const user = buildUserContactInfo({ banType: USER_BAN_TYPES.SHADOW })
      const conversation = buildDirectMessageConversation({
        studentId: user.id,
      })
      mockedDirectMessageRepo.getConversationForParticipant.mockResolvedValue(
        conversation
      )
      mockedDirectMessageRepo.createDirectMessage.mockResolvedValue(
        buildDirectMessage()
      )

      await DirectMessageService.sendMessage(conversation.id, user, 'Hi!')

      expect(mockedQueueService.add).not.toHaveBeenCalled()
    })

    test('still delivers the message and logs if the email job cannot be queued', async () => {
      const user = buildUserContactInfo()
      const conversation = buildDirectMessageConversation({
        studentId: user.id,
      })
      const message = buildDirectMessage()
      mockedDirectMessageRepo.getConversationForParticipant.mockResolvedValue(
        conversation
      )
      mockedDirectMessageRepo.createDirectMessage.mockResolvedValue(message)
      const queueError = new Error('Redis down')
      mockedQueueService.add.mockRejectedValue(queueError)
      const loggerErrorSpy = jest
        .spyOn(logger, 'error')
        .mockImplementation(() => logger)

      const result = await DirectMessageService.sendMessage(
        conversation.id,
        user,
        'Hi!'
      )
      // Let the fire-and-forget rejection handler run
      await new Promise(setImmediate)

      expect(result).toEqual({ conversation, message })
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'Could not queue new direct message email',
        {
          err: queueError,
          conversationId: conversation.id,
          messageId: message.id,
        }
      )
      loggerErrorSpy.mockRestore()
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
      expect(mockedQueueService.add).not.toHaveBeenCalled()
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
