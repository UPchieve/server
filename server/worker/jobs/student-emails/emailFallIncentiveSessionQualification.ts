import { Job } from 'bull'
import * as MailService from '../../../services/MailService'
import { asString } from '../../../utils/type-utils'
import { Ulid } from '../../../models/pgUtils'
import { Jobs } from '..'
import { getFallIncentiveSessionOverview } from '../../../services/SessionService'
import config from '../../../config'
import {
  hasUserBeenSentEmail,
  createEmailNotification,
} from '../../../services/NotificationService'
import { getUserFallIncentiveData } from '../../../services/IncentiveProgramService'
import moment from 'moment'
import { log } from '../../logger'

export interface EmailFallIncentiveSessionQualificationJobData {
  userId: Ulid
}

/**
 *
 * After every session for a student enrolled in the incentive program,
 * we check if it's their first qualifying or non-qualifying session of the week start from Monday.
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
  // We're using ISO week to have the week's starting point as Monday
  const thisMonday = moment()
    .startOf('isoWeek')
    .utc()
  const fallIncentiveEnrollmentAt = moment(
    productFlags?.fallIncentiveEnrollmentAt
  ).utc()
  const startOfWeek = moment.max(
    thisMonday,
    fallIncentiveProgramStartDate,
    fallIncentiveEnrollmentAt
  )

  const qualifiedEmailSent = await hasUserBeenSentEmail({
    userId,
    emailTemplateId: config.sendgrid.qualifiedForGiftCardTemplate,
    start: startOfWeek.toDate(),
  })
  // If they already qualified for this week, do not send any email
  if (qualifiedEmailSent) return

  const sessionOverview = await getFallIncentiveSessionOverview(
    userId,
    startOfWeek.toDate()
  )
  const { firstName, email } = user
  try {
    if (sessionOverview.qualifiedSessions.length >= 1) {
      await MailService.sendQualifiedForGiftCardEmail(email, firstName)
      await createEmailNotification({
        userId,
        sessionId: sessionOverview.qualifiedSessions[0],
        emailTemplateId: config.sendgrid.qualifiedForGiftCardTemplate,
      })
      log(
        `Sent ${Jobs.EmailFallIncentiveSessionQualification} to student ${userId} gift card qualified email`
      )
    } else if (sessionOverview.unqualifiedSessions.length >= 1) {
      const unqualifiedEmailSent = await hasUserBeenSentEmail({
        userId,
        emailTemplateId: config.sendgrid.stillTimeForQualifyingSessionTemplate,
        start: startOfWeek.toDate(),
      })
      if (!unqualifiedEmailSent) {
        await MailService.sendStillTimeToHaveQualifyingSessionEmail(
          email,
          firstName
        )
        await createEmailNotification({
          userId,
          sessionId: sessionOverview.unqualifiedSessions[0],
          emailTemplateId:
            config.sendgrid.stillTimeForQualifyingSessionTemplate,
        })
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
