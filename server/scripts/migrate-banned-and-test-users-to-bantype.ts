import * as db from '../db'
import { logError } from '../worker/logger'
import { log } from '../worker/logger'

export default async function main() {
  try {
    await db.connect()

    await db.runInTransaction(async (tc) => {
      await migrateUsers(tc)
    })
  } catch (e) {
    logError(e as Error)
  }
}

export async function migrateUsers(tc: db.TransactionClient) {
  const updateCompleteBanQuery = await tc.query(`
    UPDATE users
    SET ban_type = 'complete'
    WHERE banned = TRUE
    RETURNING 1;
  `)

  // Count the number of users updated to complete ban
  const numUsersCompleteBanned = updateCompleteBanQuery.rowCount

  // Update users to shadow ban
  const updateShadowBanQuery = await tc.query(`
    UPDATE users
    SET ban_type = 'shadow',
    test_user = FALSE
    WHERE test_user = TRUE
      AND email NOT LIKE '%@upchieve.org'
      AND banned = FALSE
    RETURNING 1;
  `)

  // Count the number of users updated to shadow ban
  const numUsersShadowBanned = updateShadowBanQuery.rowCount

  log(
    `Successfully updated ${numUsersCompleteBanned} banned users to complete ban ` +
      `and ${numUsersShadowBanned} test users to shadow banned.`
  )
}
