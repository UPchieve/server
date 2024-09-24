import { getClient, getRoClient } from '../../db'
import { RepoCreateError, RepoReadError } from '../Errors'
import {
  InsertTutorBotConversationMessagePayload,
  InsertTutorBotConversationPayload,
  UpdateTutorBotConversationSessionIdMessagePayload,
} from './types'
import * as pgQueries from './pg.queries'
import { makeSomeOptional, makeRequired, Ulid } from '../pgUtils'

export async function getTutorBotConversationsByUserId(userId: string) {
  try {
    const results = await pgQueries.getTutorBotConversationsByUserId.run(
      {
        userId,
      },
      getRoClient()
    )
    return results.map(row => makeSomeOptional(row, ['sessionId']))
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getTutorBotConversationMessagesBySessionId(
  sessionId: Ulid
) {
  try {
    const conversation = await pgQueries.getTutorBotConversationBySessionId.run(
      {
        sessionId,
      },

      getRoClient()
    )

    const results = await pgQueries.getTutorBotConversationMessagesById.run(
      {
        conversationId: makeRequired(conversation[0]).id,
      },
      getRoClient()
    )
    const attrs = makeRequired(conversation[0])
    return {
      conversationId: attrs.id,
      sessionId: attrs.sessionId,
      subjectId: attrs.subjectId,
      messages: results.map(makeRequired),
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getTutorBotConversationMessagesById(
  conversationId: string
) {
  try {
    const conversation = await pgQueries.getTutorBotConversationById.run(
      {
        conversationId,
      },

      getRoClient()
    )
    const results = await pgQueries.getTutorBotConversationMessagesById.run(
      {
        conversationId,
      },
      getRoClient()
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
export async function insertTutorBotConversation(
  data: InsertTutorBotConversationPayload
) {
  try {
    const result = await pgQueries.insertTutorBotConversation.run(
      data,
      getClient()
    )
    if (!result.length)
      throw new RepoCreateError('Failed to create conversation')
    return result[0].id
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export async function updateTutorBotConversationSessionId(
  data: UpdateTutorBotConversationSessionIdMessagePayload
) {
  try {
    const result = await pgQueries.updateTutorBotConversationSessionId.run(
      {
        ...data,
      },
      getClient()
    )
    if (result.length) return makeRequired(result[0])
    throw new RepoCreateError('Failed to insert tutor bot conversation message')
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export async function insertTutorBotConversationMessage(
  data: InsertTutorBotConversationMessagePayload
) {
  try {
    const result = await pgQueries.insertTutorBotConversationMessage.run(
      {
        ...data,
      },
      getClient()
    )
    if (result.length) return makeRequired(result[0])
    throw new RepoCreateError('Failed to insert tutor bot conversation message')
  } catch (err) {
    throw new RepoCreateError(err)
  }
}
