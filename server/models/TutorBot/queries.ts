import { getClient, getRoClient } from '../../db'
import { RepoCreateError, RepoReadError } from '../Errors'
import { InsertTutorBotConversationMessagePayload } from './types'
import * as pgQueries from './pg.queries'

export async function getTutorBotConversationsByUserId(userId: string) {
  try {
    const results = await pgQueries.getTutorBotConversationsByUserId.run(
      {
        userId,
      },
      getRoClient()
    )
    if (results.length) {
      return results[0]
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getTutorBotConversationById(conversationId: string) {
  try {
    const results = await pgQueries.getTutorBotConversationById.run(
      {
        conversationId,
      },
      getRoClient()
    )
    if (results.length) return results
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function insertTutorBotConversationMessage(
  data: InsertTutorBotConversationMessagePayload
) {
  try {
    await pgQueries.insertTutorBotConversationMessage.run(
      {
        ...data,
      },
      getClient()
    )
  } catch (err) {
    throw new RepoCreateError(err)
  }
}
