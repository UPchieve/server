/**
 * @group database/parallel
 */

import { getClient } from '../../db'
import config from '../../config'
import * as DirectMessageRepo from '../../models/DirectMessage'
import { getDbUlid, Ulid } from '../../models/pgUtils'
import { createTestUser } from './seed-utils'

const client = getClient()

async function createParticipants() {
  const student = await createTestUser(client)
  const volunteer = await createTestUser(client)
  return { studentId: student.id, volunteerId: volunteer.id }
}

async function insertSession(
  studentId: Ulid,
  volunteerId: Ulid,
  { ended = true, timeTutored = config.minSessionLength + 1 } = {}
) {
  await client.query(
    `INSERT INTO sessions (id, student_id, volunteer_id, subject_id, volunteer_joined_at, ended_at, time_tutored)
     VALUES ($1, $2, $3, 1, NOW(), $4, $5)`,
    [
      getDbUlid(),
      studentId,
      volunteerId,
      ended ? new Date() : null,
      timeTutored,
    ]
  )
}

async function getConversationRows(studentId: Ulid, volunteerId: Ulid) {
  return (
    await client.query(
      'SELECT * FROM direct_message_conversations WHERE student_id = $1 AND volunteer_id = $2',
      [studentId, volunteerId]
    )
  ).rows
}

describe('getOrCreateConversation', () => {
  test('creates the conversation after the pair has had a session', async () => {
    const { studentId, volunteerId } = await createParticipants()
    await insertSession(studentId, volunteerId)

    const conversation = await DirectMessageRepo.getOrCreateConversation(
      studentId,
      volunteerId
    )

    const rows = await getConversationRows(studentId, volunteerId)
    expect(rows).toHaveLength(1)
    expect(conversation).toEqual({
      id: rows[0].id,
      studentId,
      volunteerId,
      studentLastSeen: undefined,
      volunteerLastSeen: undefined,
      createdAt: rows[0].created_at,
    })
  })

  test('returns the existing conversation without changing it', async () => {
    const { studentId, volunteerId } = await createParticipants()
    await insertSession(studentId, volunteerId)
    const first = await DirectMessageRepo.getOrCreateConversation(
      studentId,
      volunteerId
    )

    const second = await DirectMessageRepo.getOrCreateConversation(
      studentId,
      volunteerId
    )

    expect(second).toEqual(first)
    expect(await getConversationRows(studentId, volunteerId)).toHaveLength(1)
  })

  test('creates separate conversations for different pairs', async () => {
    const { studentId, volunteerId } = await createParticipants()
    const otherVolunteer = await createTestUser(client)
    await insertSession(studentId, volunteerId)
    await insertSession(studentId, otherVolunteer.id)

    const first = await DirectMessageRepo.getOrCreateConversation(
      studentId,
      volunteerId
    )
    const second = await DirectMessageRepo.getOrCreateConversation(
      studentId,
      otherVolunteer.id
    )

    expect(first).toBeDefined()
    expect(second).toBeDefined()
    expect(second!.id).not.toBe(first!.id)
  })

  describe('does not create a conversation', () => {
    test('if the pair has never had a session', async () => {
      const { studentId, volunteerId } = await createParticipants()

      expect(
        await DirectMessageRepo.getOrCreateConversation(studentId, volunteerId)
      ).toBeUndefined()
      expect(await getConversationRows(studentId, volunteerId)).toHaveLength(0)
    })

    test('if their only session has not ended', async () => {
      const { studentId, volunteerId } = await createParticipants()
      await insertSession(studentId, volunteerId, { ended: false })

      expect(
        await DirectMessageRepo.getOrCreateConversation(studentId, volunteerId)
      ).toBeUndefined()
      expect(await getConversationRows(studentId, volunteerId)).toHaveLength(0)
    })

    test('if their only session was too short to count', async () => {
      const { studentId, volunteerId } = await createParticipants()
      await insertSession(studentId, volunteerId, {
        timeTutored: config.minSessionLength,
      })

      expect(
        await DirectMessageRepo.getOrCreateConversation(studentId, volunteerId)
      ).toBeUndefined()
      expect(await getConversationRows(studentId, volunteerId)).toHaveLength(0)
    })

    test('when the student and volunteer are swapped', async () => {
      const { studentId, volunteerId } = await createParticipants()
      await insertSession(studentId, volunteerId)

      expect(
        await DirectMessageRepo.getOrCreateConversation(volunteerId, studentId)
      ).toBeUndefined()
      expect(await getConversationRows(volunteerId, studentId)).toHaveLength(0)
    })
  })
})
