import { getClient, TransactionClient } from '../../db'
import { RepoCreateError, RepoReadError, RepoUpdateError } from '../Errors'
import * as pgQueries from './pg.queries'
import { makeSomeOptional, makeRequired, getDbUlid } from '../pgUtils'
import {
  InsertTutorBotConversationMessagePayload,
  InsertTutorBotConversationPayload,
  TutorBotMessage,
  TutorBotSenderType,
  TutorBotTranscript,
  TutorBotConversation,
} from '../../types/tutor-bot'
import type { Uuid } from '../../types/shared'

type TutorBotMessageRow = {
  tutorBotConversationId: Uuid
  userId: Uuid
  createdAt: Date
  senderUserType: TutorBotSenderType
  message: string
}

function toTutorBotMessage(row: TutorBotMessageRow): TutorBotMessage {
  return {
    tutorBotConversationId: row.tutorBotConversationId,
    userId: row.userId,
    senderUserType: row.senderUserType,
    message: row.message,
    createdAt: row.createdAt,
  }
}

type TutorBotConversationRow = {
  id: Uuid
  userId: Uuid
  sessionId?: Uuid
  subjectId: number
  createdAt: Date
}

function toTutorBotConversation(
  row: TutorBotConversationRow
): TutorBotConversation {
  return {
    id: row.id,
    userId: row.userId,
    subjectId: row.subjectId,
    sessionId: row.sessionId,
    createdAt: row.createdAt,
  }
}

export async function getTutorBotConversationById(
  conversationId: Uuid,
  client: TransactionClient = getClient()
): Promise<TutorBotConversation | undefined> {
  try {
    const [row] = await pgQueries.getTutorBotConversationById.run(
      {
        conversationId,
      },
      client
    )
    return row
      ? toTutorBotConversation(makeSomeOptional(row, ['sessionId']))
      : undefined
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getTutorBotConversationBySessionId(
  sessionId: Uuid,
  client: TransactionClient = getClient()
): Promise<TutorBotConversation | undefined> {
  try {
    const [row] = await pgQueries.getTutorBotConversationBySessionId.run(
      {
        sessionId,
      },
      client
    )
    return row
      ? toTutorBotConversation(makeSomeOptional(row, ['sessionId']))
      : undefined
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getTutorBotConversationMessagesById(
  conversationId: Uuid,
  client: TransactionClient = getClient()
): Promise<TutorBotMessage[]> {
  try {
    const rows = await pgQueries.getTutorBotConversationMessagesById.run(
      {
        conversationId,
      },
      client
    )
    return rows.map((row) => toTutorBotMessage(makeRequired(row)))
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getTutorBotTranscriptByConversationId(
  conversationId: Uuid,
  client: TransactionClient = getClient()
): Promise<TutorBotTranscript | undefined> {
  try {
    const conversation = await getTutorBotConversationById(
      conversationId,
      client
    )
    if (!conversation) return undefined

    const messages = await getTutorBotConversationMessagesById(
      conversationId,
      client
    )

    return {
      conversationId: conversation.id,
      subjectId: conversation.subjectId,
      sessionId: conversation.sessionId,
      messages,
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getTutorBotTranscriptBySessionId(
  sessionId: Uuid,
  client: TransactionClient = getClient()
): Promise<TutorBotTranscript | undefined> {
  try {
    const conversation = await getTutorBotConversationBySessionId(
      sessionId,
      client
    )
    if (!conversation) return undefined

    const messages = await getTutorBotConversationMessagesById(
      conversation.id,
      client
    )

    return {
      conversationId: conversation.id,
      subjectId: conversation.subjectId,
      sessionId: conversation.sessionId,
      messages,
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function insertTutorBotConversation(
  data: InsertTutorBotConversationPayload,
  client: TransactionClient = getClient()
): Promise<Uuid> {
  const input = {
    ...data,
    id: getDbUlid(),
  }
  try {
    const result = await pgQueries.insertTutorBotConversation.run(input, client)
    if (!result.length)
      throw new RepoCreateError('Failed to create conversation')
    return result[0].id
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export async function insertTutorBotConversationMessage(
  data: InsertTutorBotConversationMessagePayload,
  client: TransactionClient = getClient()
): Promise<TutorBotMessage> {
  try {
    const result = await pgQueries.insertTutorBotConversationMessage.run(
      {
        ...data,
      },
      client
    )
    if (result.length) return toTutorBotMessage(makeRequired(result[0]))
    throw new RepoCreateError('Failed to insert tutor bot conversation message')
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export async function updateTutorBotConversationSessionId(
  data: {
    conversationId: Uuid
    sessionId: Uuid
  },
  client: TransactionClient = getClient()
) {
  try {
    await pgQueries.updateTutorBotConversationSessionId.run(data, client)
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}
