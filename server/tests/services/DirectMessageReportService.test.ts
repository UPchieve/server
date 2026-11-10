import { mocked } from 'jest-mock'
import { Pool } from 'pg'
import * as DirectMessageReportService from '../../services/DirectMessageReportService'
import * as DirectMessageRepo from '../../models/DirectMessage'
import * as DirectMessageReportRepo from '../../models/DirectMessageReport'
import * as UserRepo from '../../models/User'
import * as UserActionRepo from '../../models/UserAction'
import * as Db from '../../db'
import QueueService from '../../services/QueueService'
import { InputError } from '../../models/Errors'
import { ConversationNotFoundError } from '../../services/Errors'
import {
  SESSION_REPORT_REASON,
  UserSessionFlags,
  USER_BAN_TYPES,
  USER_BAN_REASONS,
} from '../../constants'
import { getUuid } from '../../models/pgUtils'
import {
  buildDirectMessageConversation,
  buildUserContactInfo,
} from '../mocks/generate'

jest.mock('../../models/DirectMessage')
jest.mock('../../models/DirectMessageReport')
jest.mock('../../models/User')
jest.mock('../../models/UserAction')
jest.mock('../../db')

const mockedDirectMessageRepo = mocked(DirectMessageRepo)
const mockedReportRepo = mocked(DirectMessageReportRepo)
const mockedUserRepo = mocked(UserRepo)
const mockedUserActionRepo = mocked(UserActionRepo)
const mockedDb = mocked(Db)
const mockedQueueService = mocked(QueueService)
const client = new Pool()

beforeEach(() => {
  jest.resetAllMocks()
  mockedDb.runInTransaction.mockImplementation(async (callback) =>
    callback(client)
  )
  mockedReportRepo.createReport.mockResolvedValue(getUuid())
})
afterAll(async () => {
  await client.end()
})

describe('reportConversation', () => {
  test('records a student report about their coach and queues review without banning the coach', async () => {
    const user = buildUserContactInfo()
    const conversation = buildDirectMessageConversation({ studentId: user.id })
    mockedDirectMessageRepo.getConversationForParticipant.mockResolvedValue(
      conversation
    )
    const data = {
      reportReason: SESSION_REPORT_REASON.COACH_DM_TO_STUDENT_CONNECT_OFFLINE,
      reportMessage: '  asked to call  ',
    }

    const reportId = await DirectMessageReportService.reportConversation(
      conversation.id,
      user,
      data
    )
    expect(mockedReportRepo.createReport).toHaveBeenCalledWith(
      {
        conversationId: conversation.id,
        reportReason: data.reportReason,
        reportMessage: 'asked to call',
        reportingUserId: user.id,
        reportedUserId: conversation.volunteerId,
      },
      client
    )
    expect(mockedReportRepo.createReportFlag).toHaveBeenCalledWith(
      {
        conversationId: conversation.id,
        reportId,
        flagName: UserSessionFlags.studentReportedCoachDm,
      },
      client
    )
    expect(mockedUserRepo.banUserById).not.toHaveBeenCalled()
    expect(mockedQueueService.add).toHaveBeenCalledWith(
      'EmailDirectMessageReported',
      { delay: 0, jobId: `dm-report-${reportId}` },
      { reportId }
    )
  })

  test('bans a student reported for inappropriate behavior and records the account action', async () => {
    const user = buildUserContactInfo()
    const conversation = buildDirectMessageConversation({
      volunteerId: user.id,
    })
    mockedDirectMessageRepo.getConversationForParticipant.mockResolvedValue(
      conversation
    )

    await DirectMessageReportService.reportConversation(conversation.id, user, {
      reportReason: SESSION_REPORT_REASON.STUDENT_RUDE,
    })
    expect(mockedReportRepo.createReportFlag).toHaveBeenCalledWith(
      expect.objectContaining({
        flagName: UserSessionFlags.coachReportedStudentDm,
      }),
      client
    )
    expect(mockedUserRepo.banUserById).toHaveBeenCalledWith(
      conversation.studentId,
      USER_BAN_TYPES.COMPLETE,
      USER_BAN_REASONS.SESSION_REPORTED,
      client
    )
    expect(mockedUserActionRepo.createAccountAction).toHaveBeenCalledWith(
      expect.objectContaining({ userId: conversation.studentId }),
      client
    )
  })

  test('creates review work without banning a student for a safety concern', async () => {
    const user = buildUserContactInfo()
    const conversation = buildDirectMessageConversation({
      volunteerId: user.id,
    })
    mockedDirectMessageRepo.getConversationForParticipant.mockResolvedValue(
      conversation
    )

    await DirectMessageReportService.reportConversation(conversation.id, user, {
      reportReason: SESSION_REPORT_REASON.STUDENT_SAFETY,
    })
    expect(mockedReportRepo.createReportFlag).toHaveBeenCalled()
    expect(mockedUserRepo.banUserById).not.toHaveBeenCalled()
    expect(mockedUserActionRepo.createAccountAction).not.toHaveBeenCalled()
    expect(mockedQueueService.add).toHaveBeenCalled()
  })

  test('rejects nonparticipants before saving or taking action', async () => {
    mockedDirectMessageRepo.getConversationForParticipant.mockResolvedValue(
      undefined
    )

    await expect(
      DirectMessageReportService.reportConversation(
        getUuid(),
        buildUserContactInfo(),
        { reportReason: SESSION_REPORT_REASON.STUDENT_RUDE }
      )
    ).rejects.toThrow(ConversationNotFoundError)
    expect(mockedReportRepo.createReport).not.toHaveBeenCalled()
    expect(mockedUserRepo.banUserById).not.toHaveBeenCalled()
  })

  test('rejects reasons intended for the other participant role', async () => {
    const user = buildUserContactInfo()
    mockedDirectMessageRepo.getConversationForParticipant.mockResolvedValue(
      buildDirectMessageConversation({ studentId: user.id })
    )

    await expect(
      DirectMessageReportService.reportConversation(getUuid(), user, {
        reportReason: SESSION_REPORT_REASON.STUDENT_RUDE,
      })
    ).rejects.toThrow(InputError)
    expect(mockedReportRepo.createReport).not.toHaveBeenCalled()
  })

  test('does not queue emails if the report transaction fails', async () => {
    const user = buildUserContactInfo()
    mockedDirectMessageRepo.getConversationForParticipant.mockResolvedValue(
      buildDirectMessageConversation({ studentId: user.id })
    )
    mockedReportRepo.createReportFlag.mockRejectedValue(
      new Error('flag failure')
    )

    await expect(
      DirectMessageReportService.reportConversation(getUuid(), user, {
        reportReason:
          SESSION_REPORT_REASON.COACH_DM_TO_STUDENT_INAPPROPRIATE_LANGUAGE,
      })
    ).rejects.toThrow('flag failure')
    expect(mockedQueueService.add).not.toHaveBeenCalled()
    expect(mockedUserRepo.banUserById).not.toHaveBeenCalled()
  })
})
