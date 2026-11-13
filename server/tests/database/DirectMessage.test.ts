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

describe('updateConversationLastSeen', () => {
  async function getLastSeen(conversationId: Ulid) {
    const [row] = (
      await client.query(
        'SELECT student_last_seen, volunteer_last_seen FROM direct_message_conversations WHERE id = $1',
        [conversationId]
      )
    ).rows
    return row
  }

  test("sets only the student's last-seen time when the student views it", async () => {
    const { studentId, conversationId } = await createConversation()

    const wasUpdated = await DirectMessageRepo.updateConversationLastSeen(
      conversationId,
      studentId
    )

    const lastSeen = await getLastSeen(conversationId)
    expect(wasUpdated).toBe(true)
    expect(lastSeen.student_last_seen).not.toBeNull()
    expect(lastSeen.volunteer_last_seen).toBeNull()
  })

  test("sets only the volunteer's last-seen time when the volunteer views it", async () => {
    const { volunteerId, conversationId } = await createConversation()

    const wasUpdated = await DirectMessageRepo.updateConversationLastSeen(
      conversationId,
      volunteerId
    )

    const lastSeen = await getLastSeen(conversationId)
    expect(wasUpdated).toBe(true)
    expect(lastSeen.student_last_seen).toBeNull()
    expect(lastSeen.volunteer_last_seen).not.toBeNull()
  })

  test('moves the last-seen time forward on later views', async () => {
    const { studentId, conversationId } = await createConversation()
    const earlier = new Date('2026-10-01T12:00:00Z')
    await client.query(
      'UPDATE direct_message_conversations SET student_last_seen = $1 WHERE id = $2',
      [earlier, conversationId]
    )

    await DirectMessageRepo.updateConversationLastSeen(
      conversationId,
      studentId
    )

    const lastSeen = await getLastSeen(conversationId)
    expect(lastSeen.student_last_seen.getTime()).toBeGreaterThan(
      earlier.getTime()
    )
  })

  test('returns false and changes nothing if the user is not in the conversation', async () => {
    const { conversationId } = await createConversation()
    const otherUser = await createTestUser(client)

    const wasUpdated = await DirectMessageRepo.updateConversationLastSeen(
      conversationId,
      otherUser.id
    )

    const lastSeen = await getLastSeen(conversationId)
    expect(wasUpdated).toBe(false)
    expect(lastSeen.student_last_seen).toBeNull()
    expect(lastSeen.volunteer_last_seen).toBeNull()
  })

  test('returns false if the conversation does not exist', async () => {
    const { studentId } = await createParticipants()

    const wasUpdated = await DirectMessageRepo.updateConversationLastSeen(
      getDbUlid(),
      studentId
    )

    expect(wasUpdated).toBe(false)
  })
})

describe('direct messages', () => {
  async function insertMessage(
    conversationId: Ulid,
    senderId: Ulid,
    contents: string,
    createdAt: Date,
    sentWhileShadowbanned: boolean | null = false
  ) {
    await client.query(
      `INSERT INTO direct_messages (id, conversation_id, sender_id, contents, sent_while_shadowbanned, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $6)`,
      [
        getDbUlid(),
        conversationId,
        senderId,
        contents,
        sentWhileShadowbanned,
        createdAt,
      ]
    )
  }

  describe('createDirectMessage', () => {
    test('saves and returns the message', async () => {
      const { studentId, conversationId } = await createConversation()

      const message = await DirectMessageRepo.createDirectMessage({
        conversationId,
        senderId: studentId,
        contents: 'Hi!',
        sentWhileShadowbanned: false,
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
        sentWhileShadowbanned: false,
        createdAt: rows[0].created_at,
      })
    })

    test('saves that the message was sent while shadow banned', async () => {
      const { studentId, conversationId } = await createConversation()

      const message = await DirectMessageRepo.createDirectMessage({
        conversationId,
        senderId: studentId,
        contents: 'Hi!',
        sentWhileShadowbanned: true,
      })

      const { rows } = await client.query(
        'SELECT sent_while_shadowbanned FROM direct_messages WHERE id = $1',
        [message.id]
      )
      expect(rows[0].sent_while_shadowbanned).toBe(true)
      expect(message.sentWhileShadowbanned).toBe(true)
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

      const messages = await DirectMessageRepo.getDirectMessagesForConversation(
        conversationId,
        studentId
      )

      expect(messages.map((m) => m.contents)).toEqual(['first', 'second'])
    })

    describe('messages sent while shadow banned', () => {
      async function createConversationWithShadowbannedMessage() {
        const conversation = await createConversation()
        const { studentId, volunteerId, conversationId } = conversation
        await insertMessage(
          conversationId,
          studentId,
          'first',
          new Date('2026-10-01T12:00:00Z')
        )
        await insertMessage(
          conversationId,
          studentId,
          'shadowbanned',
          new Date('2026-10-02T12:00:00Z'),
          true
        )
        await insertMessage(
          conversationId,
          volunteerId,
          'third',
          new Date('2026-10-03T12:00:00Z')
        )
        return conversation
      }

      test('are hidden from the other participant', async () => {
        const { volunteerId, conversationId } =
          await createConversationWithShadowbannedMessage()

        const messages =
          await DirectMessageRepo.getDirectMessagesForConversation(
            conversationId,
            volunteerId
          )

        expect(messages.map((m) => m.contents)).toEqual(['first', 'third'])
      })

      test('are still shown to the sender', async () => {
        const { studentId, conversationId } =
          await createConversationWithShadowbannedMessage()

        const messages =
          await DirectMessageRepo.getDirectMessagesForConversation(
            conversationId,
            studentId
          )

        expect(messages.map((m) => m.contents)).toEqual([
          'first',
          'shadowbanned',
          'third',
        ])
      })
    })

    test('shows messages with no shadow ban value to the other participant', async () => {
      const { studentId, volunteerId, conversationId } =
        await createConversation()
      await insertMessage(
        conversationId,
        studentId,
        'Hi!',
        new Date('2026-10-01T12:00:00Z'),
        null
      )

      const messages = await DirectMessageRepo.getDirectMessagesForConversation(
        conversationId,
        volunteerId
      )

      expect(messages.map((m) => m.contents)).toEqual(['Hi!'])
    })
  })

  describe('getUnreadDirectMessageSenderIds', () => {
    const lastSeenAt = new Date('2026-10-02T12:00:00Z')
    const beforeLastSeen = new Date('2026-10-01T12:00:00Z')
    const afterLastSeen = new Date('2026-10-03T12:00:00Z')

    async function setLastSeen(
      conversationId: Ulid,
      column: 'student_last_seen' | 'volunteer_last_seen',
      at: Date
    ) {
      await client.query(
        `UPDATE direct_message_conversations SET ${column} = $1 WHERE id = $2`,
        [at, conversationId]
      )
    }

    test('returns the volunteer when the student has never viewed the conversation', async () => {
      const { studentId, volunteerId, conversationId } =
        await createConversation()
      await insertMessage(conversationId, volunteerId, 'Hi!', beforeLastSeen)

      expect(
        await DirectMessageRepo.getUnreadDirectMessageSenderIds(studentId)
      ).toEqual([volunteerId])
    })

    test('returns the student when the volunteer has never viewed the conversation', async () => {
      const { studentId, volunteerId, conversationId } =
        await createConversation()
      await insertMessage(conversationId, studentId, 'Hi!', beforeLastSeen)

      expect(
        await DirectMessageRepo.getUnreadDirectMessageSenderIds(volunteerId)
      ).toEqual([studentId])
    })

    test('returns the sender of a message sent after the user last viewed the conversation', async () => {
      const { studentId, volunteerId, conversationId } =
        await createConversation()
      await setLastSeen(conversationId, 'student_last_seen', lastSeenAt)
      await insertMessage(conversationId, volunteerId, 'old', beforeLastSeen)
      await insertMessage(conversationId, volunteerId, 'new', afterLastSeen)

      expect(
        await DirectMessageRepo.getUnreadDirectMessageSenderIds(studentId)
      ).toEqual([volunteerId])
    })

    test('returns each sender once even with several unread messages', async () => {
      const { studentId, volunteerId, conversationId } =
        await createConversation()
      await insertMessage(conversationId, volunteerId, 'one', beforeLastSeen)
      await insertMessage(conversationId, volunteerId, 'two', afterLastSeen)

      expect(
        await DirectMessageRepo.getUnreadDirectMessageSenderIds(studentId)
      ).toEqual([volunteerId])
    })

    test('returns senders from every conversation with unread messages', async () => {
      const { studentId, volunteerId, conversationId } =
        await createConversation()
      const otherVolunteer = await createTestUser(client)
      await insertSession(studentId, otherVolunteer.id)
      const other = await DirectMessageRepo.getOrCreateConversation(
        studentId,
        otherVolunteer.id
      )
      await insertMessage(conversationId, volunteerId, 'Hi!', afterLastSeen)
      await insertMessage(other!.id, otherVolunteer.id, 'Hey!', afterLastSeen)

      const senderIds =
        await DirectMessageRepo.getUnreadDirectMessageSenderIds(studentId)

      expect(senderIds).toHaveLength(2)
      expect(senderIds).toEqual(
        expect.arrayContaining([volunteerId, otherVolunteer.id])
      )
    })

    test('returns the sender of an unread message even if another unread message was sent while shadow banned', async () => {
      const { studentId, volunteerId, conversationId } =
        await createConversation()
      await setLastSeen(conversationId, 'volunteer_last_seen', lastSeenAt)
      await insertMessage(
        conversationId,
        studentId,
        'shadowbanned',
        afterLastSeen,
        true
      )
      await insertMessage(
        conversationId,
        studentId,
        'visible',
        new Date('2026-10-04T12:00:00Z')
      )

      expect(
        await DirectMessageRepo.getUnreadDirectMessageSenderIds(volunteerId)
      ).toEqual([studentId])
    })

    describe('returns nothing', () => {
      test('if the only unread message was sent while shadow banned', async () => {
        const { studentId, volunteerId, conversationId } =
          await createConversation()
        await insertMessage(
          conversationId,
          studentId,
          'shadowbanned',
          afterLastSeen,
          true
        )

        expect(
          await DirectMessageRepo.getUnreadDirectMessageSenderIds(volunteerId)
        ).toEqual([])
      })

      test('if every message was sent before the user last viewed the conversation', async () => {
        const { studentId, volunteerId, conversationId } =
          await createConversation()
        await setLastSeen(conversationId, 'student_last_seen', lastSeenAt)
        await insertMessage(conversationId, volunteerId, 'Hi!', beforeLastSeen)

        expect(
          await DirectMessageRepo.getUnreadDirectMessageSenderIds(studentId)
        ).toEqual([])
      })

      test("for the user's own messages", async () => {
        const { studentId, conversationId } = await createConversation()
        await insertMessage(conversationId, studentId, 'Hi!', afterLastSeen)

        expect(
          await DirectMessageRepo.getUnreadDirectMessageSenderIds(studentId)
        ).toEqual([])
      })

      test("when only the other person's last-seen time is before the message", async () => {
        const { studentId, volunteerId, conversationId } =
          await createConversation()
        await setLastSeen(conversationId, 'student_last_seen', afterLastSeen)
        await setLastSeen(conversationId, 'volunteer_last_seen', beforeLastSeen)
        await insertMessage(conversationId, volunteerId, 'Hi!', lastSeenAt)

        expect(
          await DirectMessageRepo.getUnreadDirectMessageSenderIds(studentId)
        ).toEqual([])
      })

      test('if the conversation has no messages', async () => {
        const { studentId } = await createConversation()

        expect(
          await DirectMessageRepo.getUnreadDirectMessageSenderIds(studentId)
        ).toEqual([])
      })

      test("for conversations the user isn't in", async () => {
        const { volunteerId, conversationId } = await createConversation()
        const otherUser = await createTestUser(client)
        await insertMessage(conversationId, volunteerId, 'Hi!', afterLastSeen)

        expect(
          await DirectMessageRepo.getUnreadDirectMessageSenderIds(otherUser.id)
        ).toEqual([])
      })
    })
  })
})
