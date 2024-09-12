import { Jobs } from '..'
import moment from 'moment'
import config from '../../../config'
import * as MailService from '../../../services/MailService'
import {
  createEmailNotification,
  getEmailNotificationsByTemplateId,
  hasUserBeenSentEmail,
} from '../../../services/NotificationService'
import { createGiftCardRewardLink } from '../../../services/TremendousService'
import { getUserFallIncentiveData } from '../../../services/IncentiveProgramService'
import { log } from '../../logger'

export default async (): Promise<void> => {
  let totalGiftCardsSent = 0
  const errors: string[] = []
  const lastMonday = moment()
    .utc()
    .subtract(1, 'weeks')
    .startOf('isoWeek')
  const lastSunday = lastMonday.clone().endOf('isoWeek')

  const notifications = await getEmailNotificationsByTemplateId({
    emailTemplateId: config.sendgrid.qualifiedForGiftCardTemplate,
    start: lastMonday.toDate(),
    end: lastSunday.toDate(),
  })

  for (const notification of notifications) {
    try {
      const data = await getUserFallIncentiveData(notification.userId, true)
      if (!data) {
        log(
          `${Jobs.EmailFallIncentiveRewards} no fall incentive data found for student ${notification.userId}`
        )
        continue
      }
      const { user } = data

      // We want to check if we sent you a giftcard this week for the student's
      // last week's fall incentive
      const startOfWeek = moment()
        .startOf('isoWeek')
        .utc()
      const hasUserBeenSentGiftCard = await hasUserBeenSentEmail({
        userId: user.id,
        emailTemplateId: config.sendgrid.fallIncentiveGiftCardTemplate,
        start: startOfWeek.toDate(),
      })
      if (hasUserBeenSentGiftCard) {
        log(
          `${Jobs.EmailFallIncentiveRewards} student ${user.id} has already received gift card for ${lastMonday} to ${lastSunday}`
        )
        continue
      }

      const rewardLink = await createGiftCardRewardLink({
        name: user.firstName,
        email: user.email,
        externalId: notification.sessionId,
        method: 'LINK',
        amount: 10,
      })
      if (!rewardLink) {
        log(
          `${Jobs.EmailFallIncentiveRewards} failed to create a gift card reward link for student ${user.id} for session ${notification.sessionId}`
        )
        continue
      }

      await MailService.sendFallIncentiveGiftCardEmail(
        user.email,
        user.firstName,
        rewardLink
      )
      await createEmailNotification({
        userId: user.id,
        sessionId: notification.sessionId,
        emailTemplateId: config.sendgrid.fallIncentiveGiftCardTemplate,
      })
      totalGiftCardsSent++
      log(`${Jobs.EmailFallIncentiveRewards} sent student ${user.id} gift card`)
    } catch (error) {
      errors.push(
        `Failed to send ${Jobs.EmailFallIncentiveRewards} to student ${notification.userId}: ${error}`
      )
      log(
        `${Jobs.EmailFallIncentiveRewards} error processing user ${notification.userId}: ${error}`
      )
    }
  }

  log(
    `${Jobs.EmailFallIncentiveRewards} total sent gift cards ${totalGiftCardsSent}`
  )

  if (errors.length) {
    throw new Error(
      `Failed to send ${Jobs.EmailFallIncentiveRewards} to: ${errors}`
    )
  }
}
