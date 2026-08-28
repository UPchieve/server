import {
  InfractionReasons,
  InsertModerationInfractionArgs,
  ModerationInfraction,
  UpdateModerationInfractionArgs,
} from './types'
import { RepoCreateError, RepoReadError, RepoUpdateError } from '../Errors'
import { getClient, TransactionClient } from '../../db'
import * as pgQueries from './pg.queries'
import { getDbUlid, makeSomeRequired } from '../pgUtils'

export async function insertModerationInfraction(
  data: InsertModerationInfractionArgs,
  client: TransactionClient = getClient()
): Promise<ModerationInfraction> {
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
    const inserted = result[0]
    const reason = inserted.reason as { [key: string]: any }

    return makeSomeRequired({ ...inserted, reason }, [
      'id',
      'userId',
      'sessionId',
      'reason',
      'active',
      'createdAt',
      'updatedAt',
    ])
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

export async function deactivateModerationInfractionByUserId(
  userId: string,
  client: TransactionClient = getClient()
): Promise<void> {
  try {
    await pgQueries.deactivateModerationInfractionByUserId.run(
      { userId },
      client
    )
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export async function getModerationInfractionsByUser(
  userId: string,
  args?: {
    sessionId?: string
    active?: boolean
  },
  client?: TransactionClient
): Promise<ModerationInfraction[]> {
  try {
    const result = await pgQueries.getModerationInfractionsByUser.run(
      {
        userId,
        sessionId: args?.sessionId,
        active: args?.active,
      },
      client ?? getClient()
    )
    if (!result.length) return []
    return result.map((r) =>
      makeSomeRequired({ ...r, reason: r.reason as InfractionReasons }, [
        'id',
        'userId',
        'sessionId',
        'reason',
        'active',
        'createdAt',
        'updatedAt',
      ])
    )
  } catch (err) {
    throw new RepoReadError(err)
  }
}
