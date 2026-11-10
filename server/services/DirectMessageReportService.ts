import * as DirectMessageRepo from '../models/DirectMessage'
import * as DirectMessageReportRepo from '../models/DirectMessageReport'
import { InputError } from '../models/Errors'
import { runInTransaction } from '../db'
import { ConversationNotFoundError } from './Errors'
import * as UserRepo from '../models/User'
import { createAccountAction } from '../models/UserAction'
import QueueService from './QueueService'
import {
  ACCOUNT_USER_ACTIONS,
  USER_BAN_REASONS,
  USER_BAN_TYPES,
  SESSION_REPORT_REASON,
  UserSessionFlags,
} from '../constants'
import type { Uuid } from '../types/shared'
import type { UserContactInfo } from '../models/User'
import type { ReportDirectMessagePayload } from '../contracts/direct-messages'

const studentReportReasons = [
  SESSION_REPORT_REASON.COACH_DM_TO_STUDENT_CONNECT_OFFLINE,
  SESSION_REPORT_REASON.COACH_DM_TO_STUDENT_FELT_UNCOMFORTABLE,
  SESSION_REPORT_REASON.COACH_DM_TO_STUDENT_INAPPROPRIATE_LANGUAGE,
  SESSION_REPORT_REASON.COACH_DM_TO_STUDENT_TALKED_INAPPROPRIATE,
]
const volunteerReportReasons = [
  SESSION_REPORT_REASON.STUDENT_RUDE,
  SESSION_REPORT_REASON.STUDENT_SAFETY,
]

export async function reportConversation(
  conversationId: Uuid,
  user: UserContactInfo,
  data: ReportDirectMessagePayload
): Promise<Uuid> {
  const conversation = await DirectMessageRepo.getConversationForParticipant(
    conversationId,
    user.id
  )
  if (!conversation) throw new ConversationNotFoundError()

  const isStudent = user.id === conversation.studentId
  const reportReasons = isStudent
    ? studentReportReasons
    : volunteerReportReasons
  if (!reportReasons.includes(data.reportReason)) {
    throw new InputError('Invalid report reason')
  }

  const reportedUserId = isStudent
    ? conversation.volunteerId
    : conversation.studentId
  const isBanReason =
    !isStudent && data.reportReason === SESSION_REPORT_REASON.STUDENT_RUDE
  const reportId = await runInTransaction(async (client) => {
    const reportId = await DirectMessageReportRepo.createReport(
      {
        conversationId,
        reportReason: data.reportReason,
        reportMessage: data.reportMessage?.trim() || undefined,
        reportingUserId: user.id,
        reportedUserId,
      },
      client
    )
    await DirectMessageReportRepo.createReportFlag(
      {
        conversationId,
        reportId,
        flagName: isStudent
          ? UserSessionFlags.studentReportedCoachDm
          : UserSessionFlags.coachReportedStudentDm,
      },
      client
    )
    if (isBanReason) {
      await UserRepo.banUserById(
        reportedUserId,
        USER_BAN_TYPES.COMPLETE,
        USER_BAN_REASONS.SESSION_REPORTED,
        client
      )
      await createAccountAction(
        {
          userId: reportedUserId,
          action: ACCOUNT_USER_ACTIONS.BANNED,
          banReason: data.reportReason,
        },
        client
      )
    }
    return reportId
  })
  await QueueService.add(
    'EmailDirectMessageReported',
    {
      delay: 0,
      jobId: `dm-report-${reportId}`,
    },
    { reportId }
  )
  return reportId
}
