import logger from '../../../logger'
import type { Ulid } from '../../../models/pgUtils'
import type { NTHSRenewalEmailRecipient } from '../../../models/NTHSRenewal'
import {
  sendNthsRenewalEmail,
  type NthsRenewalEmailData,
} from '../../../services/MailService'
import { createEmailNotification } from '../../../services/NotificationService'

export async function sendAndRecordNthsEmails<
  R extends NTHSRenewalEmailRecipient,
>(
  groupId: Ulid,
  templateId: string,
  recipients: R[],
  extraData: (recipient: R) => Partial<NthsRenewalEmailData> = () => ({})
): Promise<string[]> {
  const failures: string[] = []
  let sent = 0
  for (const recipient of recipients) {
    const { userId, email, firstName, chapterName } = recipient
    try {
      await sendNthsRenewalEmail(email, templateId, {
        firstName,
        chapterName,
        ...extraData(recipient),
      })
    } catch (err) {
      logger.error('Failed to send NTHS renewal email', {
        groupId,
        userId,
        templateId,
        err,
      })
      failures.push(`send ${templateId} to user ${userId}`)
      continue
    }
    sent++
    try {
      await createEmailNotification({ userId, emailTemplateId: templateId })
    } catch (err) {
      logger.error('NTHS renewal email sent but not recorded', {
        groupId,
        userId,
        templateId,
        err,
      })
      failures.push(`record ${templateId} for user ${userId}`)
    }
  }
  if (sent) {
    logger.info('Sent NTHS renewal emails', { groupId, templateId, sent })
  }
  return failures
}
