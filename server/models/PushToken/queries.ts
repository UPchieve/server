import { PushToken } from './types'
import { RepoCreateError, RepoReadError } from '../Errors'
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
