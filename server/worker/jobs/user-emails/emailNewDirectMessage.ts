import { Job } from 'bull'
import * as cache from '../../../cache'
import * as DirectMessageRepo from '../../../models/DirectMessage'
import * as UserRepo from '../../../models/User'
import * as MailService from '../../../services/MailService'
import * as PresenceService from '../../../services/PresenceService'
import { USER_BAN_TYPES } from '../../../constants'
import logger from '../../../logger'
import type { Uuid } from '../../../types/shared'

export const DM_EMAIL_THROTTLE_SECONDS = 60 * 60

export function getDmEmailThrottleKey(recipientId: Uuid): string {
  return `dm-email-sent:${recipientId}`
}

export type EmailNewDirectMessageJobData = {
  recipientId: Uuid
  recipientRole: 'student' | 'volunteer'
}

export default async function emailNewDirectMessage(
  job: Job<EmailNewDirectMessageJobData>
): Promise<void> {
  const { recipientId, recipientRole } = job.data

  // Excludes banned and deactivated users
  const recipient = await UserRepo.getReportedUser(recipientId)
  if (!recipient || recipient.banType === USER_BAN_TYPES.COMPLETE) return

  if (
    recipientRole === 'volunteer' &&
    (await PresenceService.isUserOnline(recipientId, 'volunteer'))
  ) {
    return
  }

  const numUnreadMessages =
    await DirectMessageRepo.getUnreadDirectMessageCount(recipientId)
  if (numUnreadMessages === 0) return

  const throttleKey = getDmEmailThrottleKey(recipientId)
  const claimed = await cache.setIfNotExists(
    throttleKey,
    new Date().toISOString(),
    DM_EMAIL_THROTTLE_SECONDS
  )
  if (!claimed) {
    logger.debug('Skipping new DM email, already sent one within the hour', {
      recipientId,
    })
    return
  }

  try {
    await MailService.sendNewDirectMessageNotification(
      recipient.email,
      recipient.firstName,
      recipientRole,
      numUnreadMessages
    )
  } catch (err) {
    // Release the throttle so a retry (or the next DM) can still send
    await cache.remove(throttleKey)
    throw err
  }
}
