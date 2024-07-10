import * as db from '../db'
import { logError } from '../worker/logger'
import { log } from '../worker/logger'

export default async function main() {
  try {
    await db.connect()

    await db.runInTransaction(async tc => {
      await migrateUsers(tc)
    })
  } catch (e) {
    logError(e as Error)
  }
}

export async function migrateUsers(tc: db.TransactionClient) {
  const updateQuery = await tc.query(`
    WITH updated_complete_ban AS (UPDATE
        users
    SET
        ban_type = 'complete'
        WHERE banned = TRUE
        RETURNING 1
    ),
    updated_shadow_ban AS (UPDATE 
        users
    SET 
        ban_type = 'shadow'
    WHERE
        test_user = TRUE
        AND email NOT LIKE '%@upchieve.org'
        AND banned = FALSE
    RETURNING 1
  )
    SELECT 
      (SELECT COUNT(*) FROM updated_complete_ban) AS complete_count,
      (SELECT COUNT(*) FROM updated_shadow_ban) AS shadow_count;
    `)

  const { numUsersCompleteBaned, numUsersShadowBanned } = updateQuery.rows[0]

  log(
    `Successfully updated ${numUsersCompleteBaned} banned users to complete ban ` +
      `and ${numUsersShadowBanned} test users to shadow banned.`
  )
}
