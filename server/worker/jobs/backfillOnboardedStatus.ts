import {
  getVolunteersForOnboardingBackfill,
  updateVolunteerOnboarded,
} from '../../models/Volunteer'
import { runInTransaction, TransactionClient } from '../../db'
import logger from '../../logger'
import { createAccountAction } from '../../models/UserAction'
import { ACCOUNT_USER_ACTIONS, EVENTS } from '../../constants'
import * as AnalyticsService from '../../services/AnalyticsService'

/**
 * Backfills the onboarded status for volunteers now that the availability
 * step is no longer required.
 */
export default async function backfillOnboardedStatus() {
  await runInTransaction(async (tc: TransactionClient) => {
    const volunteersToUpdate = await getVolunteersForOnboardingBackfill(tc)
    if (!volunteersToUpdate.length) {
      logger.info(
        'Onboarding backfill: Found no volunteers to update, so returning early.'
      )
      return
    }
    logger.info(
      `Onboarding backfill: Found ${volunteersToUpdate.length} volunteers to backfill onboarded status for.`
    )

    const onboardedVolunteers = []
    for (const volunteer of volunteersToUpdate) {
      await updateVolunteerOnboarded(volunteer.id, tc)
      await createAccountAction(
        {
          action: ACCOUNT_USER_ACTIONS.ONBOARDED,
          userId: volunteer.id,
          ipAddress: undefined,
        },
        tc
      )
      AnalyticsService.captureEvent(volunteer.id, EVENTS.ACCOUNT_ONBOARDED, {
        event: EVENTS.ACCOUNT_ONBOARDED,
        source: 'remove-availability-reqt-backfill-script',
      })
      if (volunteer.approved) {
        AnalyticsService.captureEvent(
          volunteer.id,
          EVENTS.ACCOUNT_VOLUNTEER_READY,
          {
            source: 'remove-availability-reqt-backfill-script',
          }
        )
      }
      onboardedVolunteers.push(volunteer.id)
    }
    logger.info(
      {
        onboardedVolunteerIds: onboardedVolunteers,
      },
      `Onboarding backfill: Onboarded ${onboardedVolunteers.length} volunteers`
    )
  })
}
