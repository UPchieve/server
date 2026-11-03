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

async function createConversation() {
  const { studentId, volunteerId } = await createParticipants()
  await insertSession(studentId, volunteerId)
  const conversation = await DirectMessageRepo.getOrCreateConversation(
    studentId,
    volunteerId
  )
  return { studentId, volunteerId, conversationId: conversation!.id }
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

describe('getConversationForParticipant', () => {
  test('returns the conversation to the student', async () => {
    const { studentId, volunteerId, conversationId } =
      await createConversation()
    const [row] = await getConversationRows(studentId, volunteerId)

    const conversation = await DirectMessageRepo.getConversationForParticipant(
      conversationId,
      studentId
    )

    expect(conversation).toEqual({
      id: conversationId,
      studentId,
      volunteerId,
      studentLastSeen: undefined,
      volunteerLastSeen: undefined,
      createdAt: row.created_at,
    })
  })

  test('returns the conversation to the volunteer', async () => {
    const { volunteerId, conversationId } = await createConversation()

    const conversation = await DirectMessageRepo.getConversationForParticipant(
      conversationId,
      volunteerId
    )

    expect(conversation?.id).toBe(conversationId)
  })

  test('returns the last-seen times once they are set', async () => {
    const { studentId, conversationId } = await createConversation()
    const [row] = (
      await client.query(
        'UPDATE direct_message_conversations SET student_last_seen = NOW(), volunteer_last_seen = NOW() WHERE id = $1 RETURNING *',
        [conversationId]
      )
    ).rows

    const conversation = await DirectMessageRepo.getConversationForParticipant(
      conversationId,
      studentId
    )

    expect(conversation?.studentLastSeen).toEqual(row.student_last_seen)
    expect(conversation?.volunteerLastSeen).toEqual(row.volunteer_last_seen)
  })

  test('returns undefined if the user is not in the conversation', async () => {
    const { conversationId } = await createConversation()
    const otherUser = await createTestUser(client)

    const conversation = await DirectMessageRepo.getConversationForParticipant(
      conversationId,
      otherUser.id
    )

    expect(conversation).toBeUndefined()
  })

  test('returns undefined if the conversation does not exist', async () => {
    const { studentId } = await createParticipants()

    const conversation = await DirectMessageRepo.getConversationForParticipant(
      getDbUlid(),
      studentId
    )

    expect(conversation).toBeUndefined()
  })
})

describe('direct messages', () => {
  async function insertMessage(
    conversationId: Ulid,
    senderId: Ulid,
    contents: string,
    createdAt: Date
  ) {
    await client.query(
      `INSERT INTO direct_messages (id, conversation_id, sender_id, contents, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $5)`,
      [getDbUlid(), conversationId, senderId, contents, createdAt]
    )
  }

  describe('createDirectMessage', () => {
    test('saves and returns the message', async () => {
      const { studentId, conversationId } = await createConversation()

      const message = await DirectMessageRepo.createDirectMessage({
        conversationId,
        senderId: studentId,
        contents: 'Hi!',
      })

      const { rows } = await client.query(
        'SELECT * FROM direct_messages WHERE id = $1',
        [message.id]
      )
      expect(rows).toHaveLength(1)
      expect(message).toEqual({
        id: rows[0].id,
        conversationId,
        senderId: studentId,
        contents: 'Hi!',
        createdAt: rows[0].created_at,
      })
    })
  })

  describe('getDirectMessagesForConversation', () => {
    test("returns only this conversation's messages, oldest first", async () => {
      const { studentId, volunteerId, conversationId } =
        await createConversation()
      const other = await createConversation()
      await insertMessage(
        conversationId,
        volunteerId,
        'second',
        new Date('2026-10-02T12:00:00Z')
      )
      await insertMessage(
        conversationId,
        studentId,
        'first',
        new Date('2026-10-01T12:00:00Z')
      )
      await insertMessage(
        other.conversationId,
        other.studentId,
        'other conversation',
        new Date('2026-10-01T12:00:00Z')
      )

      const messages =
        await DirectMessageRepo.getDirectMessagesForConversation(conversationId)

      expect(messages.map((m) => m.contents)).toEqual(['first', 'second'])
    })
  })
})
