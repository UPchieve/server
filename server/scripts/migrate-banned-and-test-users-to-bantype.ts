import * as db from '../db'
import { logError } from '../worker/logger'
import { log } from '../worker/logger'

export default async function main() {
  try {
    await db.connect()
    await db.getClient().query(`
    UPDATE
        users
    SET
        ban_type = 'complete'
        WHERE banned = TRUE;

    UPDATE 
        users
    SET 
        ban_type = 'shadow'
    WHERE
        test_user = TRUE
        AND email NOT LIKE '%@upchieve.org'
        AND banned = FALSE;
    `)
    log('Successfully updated banned an test users to ban types')
  } catch (e) {
    logError(e as Error)
  }
}