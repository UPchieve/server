import * as db from 'zapatos/db'
import * as schema from 'zapatos/schema'
import _ from 'lodash'

import pool from '../../pg'
import * as pgUtils from '../pgUtils'
import { User } from './index'
import { RepoDeleteError, RepoReadError, RepoUpdateError } from '../Errors'
import logger from '../../logger'

// getUserIdByEmail
export async function getUserIdByEmail(
  email: string
): Promise<pgUtils.Ulid | undefined> {
  try {
    const user = await db
      .selectExactlyOne('users', { email }, { columns: ['id'] })
      .run(pool)
    if (user) return user.id
  } catch (err) {
    throw new RepoReadError(err)
  }
}

// getUserByReferralCode
export type UserContactInfo = Pick<User, '_id' | 'email' | 'firstName'>
export async function getUserContactInfoByReferralCode(
  referralCode: string
): Promise<UserContactInfo | undefined> {
  try {
    const user = await db
      .selectExactlyOne('users', pgUtils.snakeCaseKeys({ referralCode }), {
        columns: ['id', 'email', 'first_name'],
      })
      .run(pool)
    if (user) {
      // Need _id to be generic ObjectId not mongoose one
      return pgUtils.parsePgToApp(user)
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

// getUsersReferredByOtherId
export async function getTotalUsersReferredByOtherId(
  referredBy: pgUtils.Ulid
): Promise<number> {
  try {
    return await db
      .count('users', pgUtils.snakeCaseKeys({ referredBy, verified: true }))
      .run(pool)
  } catch (err) {
    throw new RepoReadError(err)
  }
}

// updateUserResetTokenById
export async function updateUserResetTokenById(
  userId: pgUtils.Ulid,
  token: string
): Promise<void> {
  try {
    const result = await db.sql<
      schema.users.SQL,
      schema.users.OnlyCols<['id']>
    >`
      UPDATE ${'users'}
      SET ${'password_reset_token'} = ${db.param(token)}
      WHERE ${'id'} IN (
        SELECT ${'id'}
        FROM ${'users'}
        WHERE ${'id'} = ${db.param(userId)}
      )
      RETURNING ${'id'};
    `.run(pool)
    if (!result) throw new RepoUpdateError('Update query did not return result')
  } catch (err) {
    if (err instanceof RepoUpdateError) throw err
    throw new RepoUpdateError(err)
  }
}

// updateUserIpById
export async function updateUserIpById(
  userId: pgUtils.Ulid,
  ipId: pgUtils.Pgid
): Promise<void> {
  try {
    const result = await db
      .upsert(
        'users_ip_addresses',
        {
          id: pgUtils.getDbUlid(),
          user_id: userId,
          ip_address_id: ipId,
          created_at: new Date(),
          updated_at: new Date(),
        },
        ['user_id', 'ip_address_id'],
        { updateColumns: db.doNothing }
      )
      .run(pool)
    if (!result)
      // there was a conflict so no insert occured
      logger.debug('Upsert query conflicted and did not update any rows')
  } catch (err) {
    if (err instanceof RepoUpdateError) throw err
    throw new RepoUpdateError(err)
  }
}

// deleteUserByEmail
export async function deleteUserByEmail(userEmail: string): Promise<void> {
  try {
    const result = await db.deletes('users', { email: userEmail }).run(pool)
    if (!result.length)
      throw new RepoDeleteError('Deletion operation returned 0 deleted rows')
  } catch (err) {
    if (err instanceof RepoDeleteError) throw err
    else throw new RepoDeleteError(err)
  }
}
