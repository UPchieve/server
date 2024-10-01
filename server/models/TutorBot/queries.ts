import { getClient, getRoClient, TransactionClient } from '../../db'
import { RepoCreateError, RepoReadError } from '../Errors'
import {
  InsertTutorBotConversationMessagePayload,
  InsertTutorBotConversationPayload,
} from './types'
import * as pgQueries from './pg.queries'
import { makeSomeOptional, makeRequired, Ulid } from '../pgUtils'

export async function getTutorBotConversationsByUserId(
  userId: string,
  client: TransactionClient = getRoClient()
) {
  try {
    const results = await pgQueries.getTutorBotConversationsByUserId.run(
      {
        userId,
      },
      client
    )
    return results.map(row => makeSomeOptional(row, ['sessionId']))
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getTutorBotConversationMessagesById(
  conversationId: string,
  client: TransactionClient = getClient()
) {
  try {
    const conversation = await pgQueries.getTutorBotConversationById.run(
      {
        conversationId,
      },
      client
    )
    const results = await pgQueries.getTutorBotConversationMessagesById.run(
      {
        conversationId,
      },
      client
    )
    const attrs = makeSomeOptional(conversation[0], ['sessionId'])
    return {
      subjectId: attrs.subjectId,
      sessionId: attrs.sessionId,
      messages: results.map(makeRequired),
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}
export async function getTutorBotConversationMessagesBySessionId(
  sessionId: Ulid,
  client: TransactionClient = getClient()
) {
  try {
    const [
      conversation,
    ] = await pgQueries.getTutorBotConversationBySessionId.run(
      {
        sessionId,
      },
      client
    )
    if (conversation) {
      const results = await pgQueries.getTutorBotConversationMessagesById.run(
        {
          conversationId: conversation.id,
        },
        client
      )
      const attrs = makeSomeOptional(conversation, ['sessionId'])
      return {
        conversationId: conversation.id,
        subjectId: attrs.subjectId,
        sessionId: attrs.sessionId,
        messages: results.map(makeRequired),
      }
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function insertTutorBotConversation(
  data: InsertTutorBotConversationPayload,
  client: TransactionClient = getClient()
) {
  try {
    const result = await pgQueries.insertTutorBotConversation.run(data, client)
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
) {
  try {
    const result = await pgQueries.insertTutorBotConversationMessage.run(
      {
        ...data,
      },
      client
    )
    if (result.length) return makeRequired(result[0])
    throw new RepoCreateError('Failed to insert tutor bot conversation message')
  } catch (err) {
    throw new RepoCreateError(err)
  }
}
