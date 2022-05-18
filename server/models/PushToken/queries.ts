import { PushToken } from './types'
import { RepoCreateError, RepoReadError, RepoUpdateError } from '../Errors'
import { getClient } from '../../db'
import * as pgQueries from './pg.queries'
import { Ulid, getDbUlid, makeRequired } from '../pgUtils'

export async function getPushTokensByUserId(
  userId: Ulid
): Promise<PushToken[]> {
  try {
    const result = await pgQueries.getPushTokensByUserId.run(
      { userId },
      getClient()
    )
    return result.map(v => makeRequired(v))
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function createPushTokenByUserId(
  userId: Ulid,
  token: string
): Promise<PushToken> {
  try {
    const result = await pgQueries.createPushTokenByUserId.run(
      { id: getDbUlid(), userId, token },
      getClient()
    )
    if (!result.length) throw new Error('Insert query did not return new row')
    return makeRequired(result[0])
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export async function deleteDuplicatePushTokens(
  userId: Ulid,
  outageDate: Date
): Promise<void> {
  try {
    const result = await pgQueries.deleteDuplicatePushTokens.run(
      { id: getDbUlid(), userId, token },
      getClient()
    )
    if (result.length && makeRequired(result[0].ok)) return
    throw new RepoUpdateError('Update query did not delete duplicate push token')
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}
