import {
  getVolunteersForOnboardingBackfill,
  updateVolunteerOnboarded,
} from '../../models/Volunteer'
import { runInTransaction, TransactionClient } from '../../db'
import logger from '../../logger'
import { createAccountAction } from '../../models/UserAction'
import { ACCOUNT_USER_ACTIONS, EVENTS } from '../../constants'
import * as AnalyticsService from '../../services/AnalyticsService'
import QueueService from '../../services/QueueService'
import { Jobs } from './index'

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
      {
        volunteerIdsToOnboard: volunteersToUpdate.map((vol) => vol.id),
      },
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

    try {
      for (const volunteer of volunteersToUpdate) {
        await QueueService.add(
          Jobs.EmailVolunteerQuickTips,
          { volunteerId: volunteer.id },
          // Process job 5 days after the volunteer is onboarded.
          {
            delay: 1000 * 60 * 60 * 24 * 5,
            removeOnComplete: true,
            removeOnFail: true,
          }
        )

        // @TODO Special email for these volunteers, especially ones whose lastActivityAt was a while ago?
      }
    } catch (err) {
      logger.error('Onboarding backfill: Failed to send onboarding email')
    }
  })
}
