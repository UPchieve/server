import { Job } from 'bull'
import * as MailService from '../../../services/MailService'
import { asString } from '../../../utils/type-utils'
import { Ulid } from '../../../models/pgUtils'
import { getUserContactInfoById } from '../../../models/User'
import { getFallIncentiveProgramPayload } from '../../../services/FeatureFlagService'
import { getUPFByUserId } from '../../../models/UserProductFlags'
import moment from 'moment'
import { Jobs } from '..'
import { createAccountAction } from '../../../models/UserAction'
import { ACCOUNT_USER_ACTIONS } from '../../../constants'
import config from '../../../config'
import { getEmailActivityByEmailTemplateId } from '../../../services/UserActionService'
import { getFallIncentiveSessionStats } from '../../../services/SessionService'
import { log } from '../../logger'

export type EmailFallIncentiveLeavingMoneyOnTableJobData = {
  userId: Ulid
}

/**
 *
 * We're emailing students not in the incentive program after a qualifying
 * session to hopefully encourage them to enroll into the incentive program
 *
 */
export default async (
  job: Job<EmailFallIncentiveLeavingMoneyOnTableJobData>
): Promise<void> => {
  const userId = asString(job.data.userId)
  const user = await getUserContactInfoById(userId)
  const productFlags = await getUPFByUserId(userId)
  const incentiveProgramDate = await getFallIncentiveProgramPayload(userId)
  if (!incentiveProgramDate || !user || productFlags?.fallIncentiveEnrollmentAt)
    return

  const fallIncentiveProgramStartDate = moment(incentiveProgramDate)
  const emailTemplateId =
    config.sendgrid.fallIncentiveLeavingMoneyOnTableTemplate
  const emailActivity = await getEmailActivityByEmailTemplateId(
    userId,
    emailTemplateId,
    fallIncentiveProgramStartDate.toDate()
  )
  const hasEmailBeenSent = emailActivity.length
  if (hasEmailBeenSent) {
    log(
      `${Jobs.EmailFallIncentiveLeavingMoneyOnTable} has already been sent to user ${userId}. Skipping...`
    )
    return
  }

  const sessionStats = await getFallIncentiveSessionStats(
    userId,
    fallIncentiveProgramStartDate.toDate()
  )
  if (sessionStats.totalQualified === 1) {
    const { id: studentId, firstName, email } = user
    try {
      await MailService.sendFallIncentiveLeavingMoneyOnTableEmail(
        email,
        firstName
      )
      await createAccountAction({
        action: ACCOUNT_USER_ACTIONS.EMAILED,
        userId,
        emailTemplateId:
          config.sendgrid.fallIncentiveLeavingMoneyOnTableTemplate,
      })
      log(
        `Sent ${Jobs.EmailFallIncentiveLeavingMoneyOnTable} to student ${studentId}`
      )
    } catch (error) {
      throw new Error(
        `Failed to send ${Jobs.EmailFallIncentiveLeavingMoneyOnTable} to student ${studentId}: ${error}`
      )
    }
  }
}
