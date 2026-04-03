import { getClient } from '../../db'
import logger from '../../logger'
import { RepoCreateError, RepoReadError, RepoUpdateError } from '../Errors'
import { makeSomeRequired, Ulid } from '../pgUtils'
import * as pgQueries from './pg.queries'
import { Totp } from './types'

export async function getSecretForUser(
  userId: Ulid,
  tc = getClient()
): Promise<Totp | undefined> {
  try {
    const result = await pgQueries.getSecret.run({ userId }, tc)
    if (result.length) {
      return makeSomeRequired(result[0], [
        'userId',
        'secret',
        'verified',
        'createdAt',
        'updatedAt',
      ])
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function addSecretForUser(
  userId: Ulid,
  secret: string,
  tc = getClient()
) {
  try {
    const result = await pgQueries.storeSecret.runWithCounts(
      { userId, secret },
      tc
    )
    if (result.rowCount < 1) {
      throw new RepoCreateError('User already has verified TOTP')
    }
  } catch (err) {
    if (err instanceof RepoCreateError) throw err
    throw new RepoCreateError(err)
  }
}

export type UpdateSecretForUserInput = {
  verified?: boolean
  lastUsedCounter?: number
}
export async function updateSecretForUser(
  userId: Ulid,
  options: UpdateSecretForUserInput,
  tc = getClient()
) {
  try {
    await pgQueries.updateSecret.run(
      {
        userId,
        verified: options.verified,
        lastUsedCounter: options.lastUsedCounter,
      },
      tc
    )
  } catch (err) {
    throw new RepoUpdateError('Failed to update TOTP')
  }
}
