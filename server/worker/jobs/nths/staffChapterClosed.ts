import type { Job } from 'bull'
import config from '../../../config'
import logger from '../../../logger'
import type { Ulid } from '../../../models/pgUtils'
import * as NTHSRenewalRepo from '../../../models/NTHSRenewal'
import { syncChangedMembers } from '../../../services/NTHSGroupsService'
import { sendAndRecordNthsEmails } from './sendNthsEmails'

export type NTHSStaffChapterClosedJobData = {
  nthsGroupId: Ulid
}

const TEMPLATE_ID = config.sendgrid.nthsRenewal.chapterClosed

export default async function staffChapterClosed(
  job: Job<NTHSStaffChapterClosedJobData>
) {
  const { nthsGroupId } = job.data
  let failures: string[]
  try {
    const recipients = await NTHSRenewalRepo.getStaffClosedEmailRecipients({
      groupId: nthsGroupId,
      emailTemplateId: TEMPLATE_ID,
    })
    await syncChangedMembers(recipients.map((recipient) => recipient.userId))
    failures = await sendAndRecordNthsEmails(TEMPLATE_ID, recipients)
  } catch (err) {
    logger.error('NTHS staff close email failed', {
      groupId: nthsGroupId,
      err,
    })
    throw err
  }
  if (failures.length) {
    throw new Error(
      `NTHS staff close email failed for group ${nthsGroupId}: ${failures.join(', ')}`
    )
  }
}
