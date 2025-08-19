import { getClient } from '../db'
import logger from '../logger'

export default async function backfillReferralsTable() {
  try {
    const countBeforeResult = await getClient().query(`
      SELECT COUNT(*) as count
      FROM upchieve.users
      WHERE referred_by IS NOT NULL
    `)
    const countBefore = countBeforeResult.rows[0].count
    logger.info(`Total referrals in users table: ${countBefore}`)

    if (!countBefore) {
      return
    }

    const insertResult = await getClient().query(`
      INSERT INTO upchieve.referrals (user_id, referred_by)
      SELECT u.id, u.referred_by
      FROM upchieve.users u
      WHERE u.referred_by IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM upchieve.referrals r 
          WHERE r.user_id = u.id AND r.referred_by = u.referred_by
        )
    `)

    logger.info(`Total referrals created: ${insertResult.rowCount}`)

    const countAfterResult = await getClient().query(`
      SELECT COUNT(*) as count
      FROM upchieve.referrals
    `)
    const countAfter = countAfterResult.rows[0].count
    logger.info(`Total referrals in referrals table: ${countAfter}`)

    logger.info('Referrals table backfill completed successfully.')
  } catch (error) {
    logger.error(error, `Error backfilling referrals table.`)
  }
}
