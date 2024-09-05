import { Job } from 'bull'
import * as MailService from '../../../services/MailService'
import { asString } from '../../../utils/type-utils'
import { Ulid } from '../../../models/pgUtils'
import { Jobs } from '..'
import config from '../../../config'
import { getFallIncentiveSessionStats } from '../../../services/SessionService'
import { log } from '../../logger'
import { getUserFallIncentiveData } from '../../../utils/fall-incentive-utils'
import {
  hasEmailBeenSent,
  logEmailActivity,
} from '../../../services/UserActionService'
import moment from 'moment'

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
  const data = await getUserFallIncentiveData(userId, false)
  if (!data) return
  const { user, incentiveProgramDate } = data
  const fallIncentiveProgramStartDate = moment(incentiveProgramDate)
  const hasEmailSent = await hasEmailBeenSent(
    userId,
    config.sendgrid.fallIncentiveLeavingMoneyOnTableTemplate,
    fallIncentiveProgramStartDate.toDate()
  )
  if (hasEmailSent) return

  const sessionStats = await getFallIncentiveSessionStats(
    userId,
    fallIncentiveProgramStartDate.toDate()
  )
  if (sessionStats.totalQualified === 1) {
    const { firstName, email } = user
    try {
      await MailService.sendFallIncentiveLeavingMoneyOnTableEmail(
        email,
        firstName
      )
      await logEmailActivity(
        userId,
        config.sendgrid.fallIncentiveLeavingMoneyOnTableTemplate
      )
      log(
        `Sent ${Jobs.EmailFallIncentiveLeavingMoneyOnTable} to student ${userId}`
      )
    } catch (error) {
      throw new Error(
        `Failed to send ${Jobs.EmailFallIncentiveLeavingMoneyOnTable} to student ${userId}: ${error}`
      )
    }
  }
}
