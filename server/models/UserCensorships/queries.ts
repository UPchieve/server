import { SessionMedium, UserCensorship } from './types'
import { getClient } from '../../db'
import * as pgQueries from './pg.queries'
import { getDbUlid, makeRequired, makeSomeOptional } from '../pgUtils'
import { RepoCreateError, RepoReadError } from '../Errors'
import { session_medium } from './pg.queries'

export async function getUserCensorshipsBySessionId(
  sessionId: string
): Promise<UserCensorship[]> {
  try {
    const client = getClient()
    const result = await pgQueries.getUserCensorshipsBySessionId.run(
      {
        sessionId,
      },
      client
    )
    if (!result.length) return []
    return result.map(row => makeSomeOptional(row, ['comment']))
  } catch (err) {
    throw new RepoReadError(err)
  }
}

/**
 * Inserts the censorship and returns the count of active censorships (including this one) for the given (userId, sessionId)
 * @param sessionId
 * @param userId
 * @param sessionId
 * @param reason - i.e. 'profanity', 'hate_speech'
 * @param medium
 * @param active
 * @param comment
 */
export async function insertUserCensorship({
  userId,
  sessionId,
  reason,
  medium,
  active,
  comment,
}: {
  userId: string
  sessionId: string
  reason: string
  medium: SessionMedium
  active?: boolean
  comment?: string
}): Promise<number> {
  try {
    const client = getClient()
    const result = await pgQueries.insertUserCensorship.run(
      {
        id: getDbUlid(),
        userId,
        sessionId,
        reason,
        medium: medium as session_medium,
        active: active ?? true,
        comment: comment ?? null,
      },
      client
    )
    const errorMsg = 'Failed to insert user censorship'
    if (!result.length) throw new Error(errorMsg)

    const count = makeRequired(result[0]).countCensorshipsByUserInSession
    if (!count) throw new Error(errorMsg)
    return parseInt(count, 10)
  } catch (err) {
    throw new RepoCreateError(err)
  }
}
