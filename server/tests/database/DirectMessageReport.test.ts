/**
 * @group database/parallel
 */

import { getClient } from '../../db'
import * as DirectMessageReportRepo from '../../models/DirectMessageReport'
import { getCanonicalDbUlid } from '../../models/pgUtils'
import { RepoCreateError } from '../../models/Errors'
import { SESSION_REPORT_REASON, UserSessionFlags } from '../../constants'
import { buildDirectMessageConversation } from '../mocks/generate'
import { insertSingleRow } from '../db-utils'
import { createTestUser } from './seed-utils'

const client = getClient()

async function createConversation() {
  const student = await createTestUser(client)
  const volunteer = await createTestUser(client)
  return insertSingleRow(
    'direct_message_conversations',
    buildDirectMessageConversation({
      id: getCanonicalDbUlid(),
      studentId: student.id,
      volunteerId: volunteer.id,
    }),
    client
  )
}

beforeEach(async () => {
  await client.query(
    'INSERT INTO report_reasons (reason) VALUES ($1) ON CONFLICT (reason) DO NOTHING',
    [SESSION_REPORT_REASON.COACH_DM_TO_STUDENT_CONNECT_OFFLINE]
  )
  await client.query(
    'INSERT INTO session_flags (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
    [UserSessionFlags.studentReportedCoachDm]
  )
})

describe('DirectMessageReport repo', () => {
  describe('createReport', () => {
    test('stores who reported whom and the report details', async () => {
      const conversation = await createConversation()
      const reportId = await DirectMessageReportRepo.createReport(
        {
          conversationId: conversation.id,
          reportingUserId: conversation.studentId,
          reportedUserId: conversation.volunteerId,
          reportReason:
            SESSION_REPORT_REASON.COACH_DM_TO_STUDENT_CONNECT_OFFLINE,
          reportMessage: 'Details',
        },
        client
      )
      const report = await DirectMessageReportRepo.getReportById(reportId)
      expect(report).toMatchObject({
        id: reportId,
        conversationId: conversation.id,
        reportingUserId: conversation.studentId,
        reportedUserId: conversation.volunteerId,
        reportMessage: 'Details',
        reportReason: SESSION_REPORT_REASON.COACH_DM_TO_STUDENT_CONNECT_OFFLINE,
      })
    })

    test('rejects a report reason that does not exist', async () => {
      const conversation = await createConversation()
      await expect(
        DirectMessageReportRepo.createReport(
          {
            conversationId: conversation.id,
            reportingUserId: conversation.studentId,
            reportedUserId: conversation.volunteerId,
            reportReason: 'unknown',
          },
          client
        )
      ).rejects.toThrow(RepoCreateError)
    })
  })

  describe('createReportFlag', () => {
    test('links pending review work to the conversation report', async () => {
      const conversation = await createConversation()
      const reportId = await DirectMessageReportRepo.createReport(
        {
          conversationId: conversation.id,
          reportingUserId: conversation.studentId,
          reportedUserId: conversation.volunteerId,
          reportReason:
            SESSION_REPORT_REASON.COACH_DM_TO_STUDENT_CONNECT_OFFLINE,
        },
        client
      )
      await DirectMessageReportRepo.createReportFlag(
        {
          conversationId: conversation.id,
          reportId,
          flagName: UserSessionFlags.studentReportedCoachDm,
        },
        client
      )
      const { rows } = await client.query(
        'SELECT * FROM direct_message_flags WHERE report_id = $1',
        [reportId]
      )
      expect(rows).toHaveLength(1)
      expect(rows[0]).toMatchObject({
        conversation_id: conversation.id,
        report_id: reportId,
        reviewed_at: null,
      })
      const other = await createConversation()
      await expect(
        DirectMessageReportRepo.createReportFlag(
          {
            conversationId: other.id,
            reportId,
            flagName: UserSessionFlags.studentReportedCoachDm,
          },
          client
        )
      ).rejects.toThrow(RepoCreateError)
    })
  })
})
