import {
  backfillEndedByUserId,
  countSessionsToBackfillEndedByUserId,
} from '../models/Session'
import { getClient, runInTransaction } from '../db'
import logger from '../logger'

export default async function () {
  const tc = getClient()
  const logPrefix = 'EndedByUserId Backfill: '
  const expectedUpdateCount = await countSessionsToBackfillEndedByUserId(tc)
  logger.info(`${logPrefix}Expecting to update ${expectedUpdateCount} rows`)

  await runInTransaction(async (client) => {
    const actualUpdateCount = await backfillEndedByUserId(client)
    logger.info(`${logPrefix}Updated ${actualUpdateCount} rows`)

    if (actualUpdateCount !== expectedUpdateCount) {
      logger.error(
        `${logPrefix}Did not update the expected number of rows. Rolling back.`
      )
      throw new Error('Did not update expected number of rows')
    }

    logger.info(`${logPrefix}Finished backfill.`)
  }, tc)
}
