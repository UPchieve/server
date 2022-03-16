import { PgIpAddress } from './types'
import { RepoCreateError, RepoReadError, RepoUpdateError } from '../Errors'
import { getClient } from '../../pg'
import * as pgQueries from './pg.queries'
import {
  Ulid,
  makeSomeRequired,
  getDbUlid,
  makeRequired,
  Pgid,
} from '../pgUtils'
import { cleanIpString } from '../../utils/clean-ip-string'
import { IP_ADDRESS_STATUS } from '../../constants'

export async function getIpByRawString(
  ip: string
): Promise<PgIpAddress | undefined> {
  try {
    const result = await pgQueries.getIpByRawString.run(
      { ip: cleanIpString(ip) },
      getClient()
    )
    if (!result.length) return
    return makeRequired(result[0])
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function insertIpByRawString(ip: string): Promise<PgIpAddress> {
  try {
    const result = await pgQueries.insertIpByRawString.run(
      {
        id: getDbUlid(),
        ip: cleanIpString(ip),
      },
      getClient()
    )
    if (!result.length) throw new Error('Insert did not return new row')
    return makeSomeRequired(result[0], ['status'])
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function updateIpUserById(
  ipId: Pgid,
  userId: Ulid
): Promise<void> {
  try {
    const result = await pgQueries.insertUsersIpById.run(
      {
        id: getDbUlid(),
        ipId,
        userId,
      },
      getClient()
    )
    if (!(result.length && makeRequired(result[0]).ok))
      throw new Error('Insert query did not return ok')
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export async function updateIpStatusById(
  ipId: Pgid,
  status: IP_ADDRESS_STATUS = IP_ADDRESS_STATUS.OK
): Promise<void> {
  try {
    const result = await pgQueries.updateIpStatusById.run(
      {
        id: getDbUlid(),
        status,
      },
      getClient()
    )
    if (!(result.length && makeRequired(result[0]).ok))
      throw new Error('Update query did not return ok')
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}
