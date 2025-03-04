import {
  InfractionReasons,
  InsertModerationInfractionArgs,
  ModerationInfraction,
  UpdateModerationInfractionArgs,
} from './types'
import { RepoCreateError, RepoReadError, RepoUpdateError } from '../Errors'
import { getClient } from '../../db'
import * as pgQueries from './pg.queries'
import { getDbUlid, makeRequired, makeSomeRequired } from '../pgUtils'
import { camelCaseKeys } from '../../tests/db-utils'

/**
 * Inserts the infraction.
 * @returns the number of infractions (including this one) that have occurred
 * for the given user in the given session
 */
export async function insertModerationInfraction(
  data: InsertModerationInfractionArgs,
  client = getClient()
): Promise<number> {
  try {
    const result = await pgQueries.insertModerationInfraction.run(
      {
        id: getDbUlid(),
        userId: data.userId,
        sessionId: data.sessionId,
        reason: data.reason,
      },
      client
    )
    if (!result.length)
      throw new Error(
        `Failed to insert moderation infraction for user ${data.userId}, session ${data.sessionId}`
      )

    return parseInt(makeRequired(result[0]).infractionCount, 10)
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export async function updateModerationInfractionById(
  infractionId: string,
  data: UpdateModerationInfractionArgs,
  client = getClient()
): Promise<void> {
  try {
    await pgQueries.updateModerationInfractionById.run(
      {
        id: infractionId,
        active: data.active,
      },
      client
    )
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export async function getModerationInfractionsByUserAndSession(
  userId: string,
  sessionId: string,
  client = getClient()
): Promise<ModerationInfraction[]> {
  try {
    const result = await pgQueries.getModerationInfractionsByUserAndSession.run(
      {
        userId,
        sessionId,
      },
      client
    )
    if (!result.length) return []
    return result.map((r) => {
      const camelCase = camelCaseKeys(r)
      return {
        id: camelCase.id,
        userId: camelCase.userId,
        sessionId: camelCase.sessionId,
        reason: camelCase.reason as InfractionReasons,
        active: camelCase.active,
        createdAt: camelCase.createdAt,
        updatedAt: camelCase.updatedAt,
      }
    })
  } catch (err) {
    throw new RepoReadError(err)
  }
}
