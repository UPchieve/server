/**
 * @group database/parallel
 */

import { getClient } from '../../db'
import * as DirectMessageModerationRepo from '../../models/DirectMessageModeration'
import { getCanonicalDbUlid } from '../../models/pgUtils'
import type { DirectMessageConversation } from '../../types/direct-messages'
import { RepoCreateError } from '../../models/Errors'
import { UserSessionFlags } from '../../constants'
import {
  buildDirectMessage,
  buildDirectMessageConversation,
} from '../mocks/generate'
import { insertSingleRow } from '../db-utils'
import { createTestUser } from './seed-utils'

const client = getClient()

async function createConversation() {
  const student = await createTestUser(client)
  const volunteer = await createTestUser(client)
  const conversation = await insertSingleRow(
    'direct_message_conversations',
    buildDirectMessageConversation({
      id: getCanonicalDbUlid(),
      studentId: student.id,
      volunteerId: volunteer.id,
    }),
    client
  )
  return conversation
}

async function createCensoredMessage(conversation: DirectMessageConversation) {
  return DirectMessageModerationRepo.createCensoredDirectMessage(
    {
      conversationId: conversation.id,
      senderId: conversation.studentId,
      message: 'Flagged message',
      censoredBy: 'ai',
      blocked: true,
      reasons: ['PII'],
    },
    client
  )
}

describe('DirectMessageModeration', () => {
  describe('createCensoredDirectMessage', () => {
    test.each([
      { censoredBy: 'regex' as const, blocked: false },
      { censoredBy: 'ai' as const, blocked: true },
    ])(
      'stores a $censoredBy attempt with blocked=$blocked',
      async ({ censoredBy, blocked }) => {
        const conversation = await createConversation()
        const censoredMessageId =
          await DirectMessageModerationRepo.createCensoredDirectMessage(
            {
              conversationId: conversation.id,
              senderId: conversation.studentId,
              message: 'Flagged message',
              censoredBy,
              blocked,
              reasons: ['PII'],
            },
            client
          )
        const { rows } = await client.query(
          'SELECT * FROM censored_direct_messages WHERE id = $1',
          [censoredMessageId]
        )
        expect(rows).toHaveLength(1)
        expect(rows[0]).toMatchObject({
          conversation_id: conversation.id,
          sender_id: conversation.studentId,
          message: 'Flagged message',
          censored_by: censoredBy,
          blocked,
          reasons: ['PII'],
        })
        expect(rows[0].created_at).toBeDefined()
        expect(rows[0].updated_at).toBeDefined()
        const flags = await client.query(
          'SELECT id FROM direct_message_flags WHERE censored_message_id = $1',
          [censoredMessageId]
        )
        expect(flags.rows).toHaveLength(0)
      }
    )
  })

  describe('createDirectMessageFlag', () => {
    beforeEach(async () => {
      await client.query(
        'INSERT INTO session_flags (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
        [UserSessionFlags.pii]
      )
    })

    test('creates a pending flag linked to the censored message', async () => {
      const conversation = await createConversation()
      const censoredMessageId = await createCensoredMessage(conversation)
      await DirectMessageModerationRepo.createDirectMessageFlag(
        {
          conversationId: conversation.id,
          censoredMessageId,
          flagName: UserSessionFlags.pii,
        },
        client
      )
      const { rows } = await client.query(
        'SELECT * FROM direct_message_flags WHERE censored_message_id = $1',
        [censoredMessageId]
      )
      expect(rows).toHaveLength(1)
      expect(rows[0]).toMatchObject({
        conversation_id: conversation.id,
        reviewed_at: null,
      })
    })

    test('rejects evidence from a different conversation', async () => {
      const conversation = await createConversation()
      const otherConversation = await createConversation()
      const censoredMessageId = await createCensoredMessage(conversation)
      await expect(
        DirectMessageModerationRepo.createDirectMessageFlag(
          {
            conversationId: otherConversation.id,
            censoredMessageId,
            flagName: UserSessionFlags.pii,
          },
          client
        )
      ).rejects.toThrow(RepoCreateError)
    })
  })

  describe('getRecentMessages', () => {
    test('returns the latest messages in chronological order and excludes other conversations', async () => {
      const conversation = await createConversation()
      const otherConversation = await createConversation()
      for (const day of [1, 2, 3]) {
        await insertSingleRow(
          'direct_messages',
          buildDirectMessage({
            id: getCanonicalDbUlid(),
            conversationId: conversation.id,
            senderId: conversation.studentId,
            contents: `Message ${day}`,
            createdAt: new Date(`2026-10-0${day}T12:00:00Z`),
          }),
          client
        )
      }
      await insertSingleRow(
        'direct_messages',
        buildDirectMessage({
          id: getCanonicalDbUlid(),
          conversationId: otherConversation.id,
          senderId: otherConversation.studentId,
          contents: 'Unrelated message',
        }),
        client
      )
      const messages = await DirectMessageModerationRepo.getRecentMessages(
        conversation.id,
        2
      )
      expect(messages.map((message) => message.contents)).toEqual([
        'Message 2',
        'Message 3',
      ])
    })
  })
})
