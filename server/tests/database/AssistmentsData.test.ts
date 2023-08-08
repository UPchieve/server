/**
 * @group database
 */

import {
  getAssistmentsDataBySession,
  updateAssistmentsDataSentById,
  createAssistmentsDataBySessionId,
} from '../../models/AssistmentsData/queries'
import { Pool } from 'pg'
import {
  buildUserRow,
  buildStudentProfile,
  buildAssistmentsData,
  buildSession,
} from '../mocks/generate'
import { insertSingleRow, dropTables, executeQuery } from '../db-utils'
import { AssistmentsData } from '../../models/AssistmentsData'
import { Student } from '../../models/Student'
import { Session } from '../../models/Session'
import { RepoCreateError } from '../../models/Errors'
import { getClient } from '../../db'

describe('Assistments data queries', () => {
  const client: Pool = getClient()
  let student: Student
  let session: Session
  let ad: AssistmentsData
  beforeAll(async () => {
    const user = await insertSingleRow('users', buildUserRow(), client)
    student = await insertSingleRow(
      'student_profiles',
      buildStudentProfile({ userId: user.id }),
      client
    )
  })
  beforeEach(async () => {
    await dropTables(['assistments_data', 'sessions'], client)
    session = await insertSingleRow(
      'sessions',
      await buildSession({ studentId: student.userId }, client),
      client
    )
    ad = await insertSingleRow(
      'assistments_data',
      buildAssistmentsData({ sessionId: session.id }),
      client
    )
  })
  test('getAssistmentsDataBySession gets AD for a session', async () => {
    const result = await getAssistmentsDataBySession(session.id)
    expect(result).toEqual(ad)
  })
  test('updateAssistmentsDataSentById updates sent status', async () => {
    await updateAssistmentsDataSentById(ad.id)
    const result = await executeQuery(
      `SELECT sent, sent_at FROM assistments_data WHERE session_id = $1`,
      [session.id],
      client
    )
    expect(result.rows[0].sent).toBeTruthy()
    expect(result.rows[0].sentAt).toBeDefined()
  })
  test('createAssistmentsDataBySessionId creates new AD when none exist for a session', async () => {
    const newSession = await insertSingleRow(
      'sessions',
      await buildSession({ studentId: student.userId }, client),
      client
    )
    const expectedAd = buildAssistmentsData({ sessionId: newSession.id })
    const newAd = await createAssistmentsDataBySessionId(
      expectedAd.problemId,
      expectedAd.assignmentId,
      expectedAd.studentId,
      expectedAd.sessionId
    )
    expect(newAd.sessionId).toEqual(newSession.id)
    const result = await executeQuery(
      `SELECT * FROM assistments_data WHERE session_id = $1`,
      [newSession.id],
      client
    )
    expect(result.rows[0].sessionId).toEqual(expectedAd.sessionId)
  })
  test('createAssistmentsDataBySessionId throws when creating new AD for session that already has one', async () => {
    expect.assertions(1)
    await expect(
      createAssistmentsDataBySessionId(
        ad.problemId,
        ad.assignmentId,
        ad.studentId,
        session.id
      )
    ).rejects.toBeInstanceOf(RepoCreateError)
  })
})
