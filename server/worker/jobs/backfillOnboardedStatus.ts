import {
  getVolunteersForOnboardingBackfill,
  updateVolunteerOnboarded,
  VolunteerToOnboard,
} from '../../models/Volunteer'
import { runInTransaction, TransactionClient } from '../../db'
import logger from '../../logger'
import { createAccountAction } from '../../models/UserAction'
import { ACCOUNT_USER_ACTIONS, EVENTS } from '../../constants'
import * as AnalyticsService from '../../services/AnalyticsService'
import * as MailService from '../../services/MailService'
import QueueService from '../../services/QueueService'
import { Jobs } from './index'

/**
 * Backfills the onboarded status for volunteers now that the availability
 * step is no longer required.
 */
export default async function backfillOnboardedStatus() {
  const onboardedVolunteers: VolunteerToOnboard[] | undefined =
    await runInTransaction(async (tc: TransactionClient) => {
      const targetVolunteers = await getVolunteersForOnboardingBackfill(tc)
      if (!targetVolunteers.length) {
        logger.info(
          'Onboarding backfill: Found no volunteers to update, so returning early.'
        )
        return
      }
      logger.info(
        {
          volunteerIdsToOnboard: targetVolunteers.map((vol) => vol.id),
        },
        `Onboarding backfill: Found ${targetVolunteers.length} volunteers to backfill onboarded status for.`
      )

      const onboardedVolunteers: VolunteerToOnboard[] = []
      for (const volunteer of targetVolunteers) {
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
        onboardedVolunteers.push(volunteer)
      }
      return onboardedVolunteers
    })
  if (!onboardedVolunteers) {
    return
  }

  logger.info(
    {
      onboardedVolunteerIds: onboardedVolunteers.map(
        (volunteer) => volunteer.id
      ),
    },
    `Onboarding backfill: Onboarded ${onboardedVolunteers.length} volunteers`
  )

  const readyToCoachVolunteers = onboardedVolunteers.filter(
    (volunteer) => volunteer.approved
  )

  try {
    logger.info(
      {
        readyToCoachVolunteerIds: readyToCoachVolunteers.map((vol) => vol.id),
      },
      `Onboarding backfill: Sending now-ready-to-coach email and enqueueing Volunteer Quick Tips email to ${readyToCoachVolunteers.length} volunteers`
    )
    // Queue up the Quick Tips email to send in 5 days
    for (const volunteer of readyToCoachVolunteers) {
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
      await MailService.sendBackfillNowReadyToCoachEmail(
        volunteer.email,
        volunteer.firstName
      )
    }
  } catch (err) {
    logger.error(
      { err },
      'Onboarding backfill: Failed to send now-ready-to-coach email to some volunteers'
    )
  }
}
