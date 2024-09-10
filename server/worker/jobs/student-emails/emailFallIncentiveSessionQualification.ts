import { Job } from 'bull'
import * as MailService from '../../../services/MailService'
import { asString } from '../../../utils/type-utils'
import { Ulid } from '../../../models/pgUtils'
import { Jobs } from '..'
import { getFallIncentiveSessionStats } from '../../../services/SessionService'
import config from '../../../config'
import {
  hasEmailBeenSent,
  createEmailNotification,
} from '../../../services/NotificationService'
import { getUserFallIncentiveData } from '../../../utils/fall-incentive-utils'
import moment from 'moment'
import { log } from '../../logger'

export interface EmailFallIncentiveSessionQualificationJobData {
  userId: Ulid
}

/**
 *
 * After every session for a student enrolled in the incentive program,
 * we check if it's their first qualifying or non-qualifying session of the week.
 *
 * - If it's their first qualifying session, we notify the student that they have
 *   qualified for a gift card, which will be sent at a later date.
 * - If it's their first non-qualifying session, we inform the student that they
 *   have until Sunday to complete a qualifying session to still be eligible.
 *
 * Each student should only receive one email per week:
 * - If they have already received the "qualified" email, they will not receive
 *   the "non-qualified" email even if they have a non-qualifying session later.
 *
 * This hels us ensure that the student only receives relevant notifications once per week.
 *
 */
export default async (
  job: Job<EmailFallIncentiveSessionQualificationJobData>
): Promise<void> => {
  const userId = asString(job.data.userId)
  const data = await getUserFallIncentiveData(userId, true)
  if (!data) return

  const { user, productFlags, incentiveProgramDate } = data
  const fallIncentiveProgramStartDate = moment(incentiveProgramDate)
  const thisMonday = moment()
    .startOf('week')
    .utc()
  const fallIncentiveEnrollmentAt = moment(
    productFlags?.fallIncentiveEnrollmentAt
  ).utc()
  const startOfWeek = moment.max(
    thisMonday,
    fallIncentiveProgramStartDate,
    fallIncentiveEnrollmentAt
  )

  const qualifiedEmailSent = await hasEmailBeenSent(
    userId,
    config.sendgrid.qualifiedForGiftCardTemplate,
    startOfWeek.toDate()
  )
  // If they already qualified for this week, do not send any email
  if (qualifiedEmailSent) return

  const sessionStats = await getFallIncentiveSessionStats(
    userId,
    startOfWeek.toDate()
  )
  const { firstName, email } = user
  try {
    // Send qualified email if this is their first qualifying session
    if (sessionStats.totalQualified === 1) {
      await MailService.sendQualifiedForGiftCardEmail(email, firstName)
      await createEmailNotification(
        userId,
        config.sendgrid.qualifiedForGiftCardTemplate
      )
      log(
        `Sent ${Jobs.EmailFallIncentiveSessionQualification} to student ${userId} gift card qualified email`
      )
    }

    // Send reminder email if this is their first unqualified session
    if (sessionStats.totalUnqualified === 1) {
      const unqualifiedEmailSent = await hasEmailBeenSent(
        userId,
        config.sendgrid.stillTimeForQualifyingSessionTemplate,
        startOfWeek.toDate()
      )
      if (!unqualifiedEmailSent) {
        await MailService.sendStillTimeToHaveQualifyingSessionEmail(
          email,
          firstName
        )
        await createEmailNotification(
          userId,
          config.sendgrid.stillTimeForQualifyingSessionTemplate
        )
        log(
          `${Jobs.EmailFallIncentiveSessionQualification} sent student ${userId} session did not qualify email`
        )
      }
    }
  } catch (error) {
    throw new Error(
      `Failed to send ${Jobs.EmailFallIncentiveSessionQualification} to student ${userId}: ${error}`
    )
  }
}
