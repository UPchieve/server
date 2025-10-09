import logger from '../../logger'
import {
  backfillCoachSmsConsent,
  getCoachesWithFalseSmsConsent,
} from '../../models/Volunteer'
import { runInTransaction } from '../../db'

const LOG_PREFIX = 'Coach sms_consent backfill: '
export default async function () {
  logger.info(`${LOG_PREFIX}Starting backfill`)
  await runInTransaction(async (tc) => {
    const targetCoaches = await getCoachesWithFalseSmsConsent(tc)
    logger.info(
      { userIds: targetCoaches },
      `${LOG_PREFIX}Found ${targetCoaches.length} coaches to update`
    )

    const updatedIds = await backfillCoachSmsConsent(targetCoaches, tc)
    logger.info(
      { updatedIds },
      `${LOG_PREFIX}Updated ${updatedIds.length} coaches to have sms_consent = true`
    )
    if (targetCoaches.length !== updatedIds.length) {
      logger.error(
        `${LOG_PREFIX}Failed to update all target coaches. Found ${targetCoaches.length} but updated only ${updatedIds.length}`
      )
      throw new Error(
        'Updated incorrect number of users in coach sms_consent backfill job'
      )
    }
  })
}
