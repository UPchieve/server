import { getClient, getRoClient } from '../../db'
import { RepoCreateError, RepoReadError } from '../Errors'
import {
  InsertTutorBotConversationMessagePayload,
  InsertTutorBotConversationPayload,
} from './types'
import * as pgQueries from './pg.queries'
import { makeSomeOptional, makeRequired } from '../pgUtils'

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
    return {
      subjectId: makeSomeOptional(conversation[0], ['sessionId']).subjectId,
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
