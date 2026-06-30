import { runInTransaction, TransactionClient } from '../../db'
import {
  getVolunteersForBgInfoUserActionBackfill,
  backfillVolunteersBgInfoUserAction,
} from '../../models/Volunteer'
import logger from '../../logger'

const logPrefix = 'Backfilling background info user action: '
export default async function () {
  logger.info(
    `${logPrefix}Beginning backfill of COMPLETED BACKGROUND INFORMATION user actions`
  )
  const volunteers = await getVolunteersForBgInfoUserActionBackfill()
  const targetVolunteers = volunteers.filter(
    (vol) => !!vol.occupationFirstSetAt
  )
  if (volunteers.length !== targetVolunteers.length) {
    // All of the volunteers returned should have a minimum date that their first volunteer_occupation was set at,
    // but validate that just in case.
    throw new Error(`${logPrefix} - Query returned unexpected results`)
  }

  logger.info(
    `${logPrefix}About to backfill ${targetVolunteers.length} user actions.`
  )
  await runInTransaction(async (tc: TransactionClient) => {
    const results = await backfillVolunteersBgInfoUserAction(tc)

    // Make sure the count matches
    if (results.length !== targetVolunteers.length) {
      logger.error(
        `${logPrefix}Did not backfill the expected number of user actions; expected=${targetVolunteers.length}, actual=${results.length}; rolling back!`
      )
      throw new Error('Did not backfill the expected number of user actions')
    }

    logger.info(
      `${logPrefix}Completed volunteer background info user action backfill. numBackfilled=${results.length}`
    )
  })
}
