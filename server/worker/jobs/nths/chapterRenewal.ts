import type { Job } from 'bull'
import config from '../../../config'
import logger from '../../../logger'
import type { Ulid } from '../../../models/pgUtils'
import * as NTHSRenewalRepo from '../../../models/NTHSRenewal'
import type {
  NTHSRenewalEmailMember,
  NTHSRenewalEmailRecipient,
} from '../../../models/NTHSRenewal'
import { isNthsChapterRenewalEnabled } from '../../../services/FeatureFlagService'
import {
  sendNthsRenewalEmail,
  type NthsRenewalEmailData,
} from '../../../services/MailService'
import { createEmailNotification } from '../../../services/NotificationService'
import { isClearedToViewChapterMemberInfo } from '../../../services/NTHSGroupsService'
import { getNthsChapterRenewalDates } from '../../../services/NTHSRenewalDatesService'
import {
  closeDueChapter,
  closeRenewalCycle,
  nextRenewalCycle,
  schoolYearDate,
  type NTHSRenewalCycle,
} from '../../../services/NTHSRenewalService'
import { hoursInMs } from '../../../utils/time-utils'

const TEMPLATES = config.sendgrid.nthsRenewal

export type NTHSChapterRenewalJobData = {
  nthsGroupId: Ulid
  now: string
}

type PreCloseEmail = {
  templateId: string
  sendFrom: Date
  sendUntil: Date
  isRecipient: (member: NTHSRenewalEmailMember) => boolean | Promise<boolean>
  extraData?: (member: NTHSRenewalEmailMember) => Partial<NthsRenewalEmailData>
}

export default async function chapterRenewal(
  job: Job<NTHSChapterRenewalJobData>
) {
  const { nthsGroupId } = job.data
  const now = new Date(job.data.now)
  const dates = await getNthsChapterRenewalDates()
  if (!dates) return
  let failures: string[]
  try {
    failures = await sendPreCloseEmails(
      nthsGroupId,
      nextRenewalCycle(dates, now),
      now
    )
    const closeCycle = closeRenewalCycle(dates, now)
    if (closeCycle) {
      failures.push(
        ...(await closeIfDue(nthsGroupId, closeCycle, now)),
        ...(await sendClosedEmails(nthsGroupId, closeCycle))
      )
    }
  } catch (err) {
    logger.error('NTHS chapter renewal failed', {
      groupId: nthsGroupId,
      err,
    })
    throw err
  }
  if (failures.length) {
    throw new Error(
      `NTHS chapter renewal failed for group ${nthsGroupId}: ${failures.join(', ')}`
    )
  }
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

function preCloseEmails(cycle: NTHSRenewalCycle): PreCloseEmail[] {
  return [
    {
      templateId: TEMPLATES.nominationsOpen,
      sendFrom: cycle.nominationsOpenAt,
      sendUntil: cycle.memberStageAt,
      isRecipient: async (member) =>
        member.isAdmin &&
        !member.chapterHasNamed &&
        !member.chapterConfirmed &&
        (await isClearedToViewChapterMemberInfo(member.userId, true)),
      extraData: () => ({
        successorDate: formatDate(cycle.successorConfirmationAt),
      }),
    },
    {
      templateId: TEMPLATES.namedSuccessor,
      sendFrom: cycle.successorConfirmationAt,
      sendUntil: cycle.closesAt,
      isRecipient: (member) => member.namedUnanswered,
      extraData: (member) => ({
        selfNamed: member.selfNamed,
        chapterConfirmed: member.chapterConfirmed,
      }),
    },
    {
      templateId: TEMPLATES.memberStage,
      sendFrom: cycle.memberStageAt,
      sendUntil: cycle.memberEmailEndsAt,
      isRecipient: (member) => !member.chapterConfirmed,
    },
  ]
}

async function sendPreCloseEmails(
  groupId: Ulid,
  cycle: NTHSRenewalCycle,
  now: Date
): Promise<string[]> {
  const openEmails = preCloseEmails(cycle).filter(
    ({ sendFrom, sendUntil }) => sendFrom <= now && now < sendUntil
  )
  if (!openEmails.length) return []
  const members = await NTHSRenewalRepo.getRenewalEmailMembers(
    groupId,
    schoolYearDate(cycle),
    cycle.sentSince,
    openEmails.map(({ templateId }) => templateId)
  )
  const failures: string[] = []
  for (const email of openEmails) {
    const recipients: NTHSRenewalEmailMember[] = []
    for (const member of members) {
      if (
        !member.sentTemplateIds.includes(email.templateId) &&
        (await email.isRecipient(member))
      ) {
        recipients.push(member)
      }
    }
    failures.push(
      ...(await sendRenewalEmails(
        email.templateId,
        recipients,
        cycle,
        email.extraData
      ))
    )
  }
  return failures
}

async function closeIfDue(
  groupId: Ulid,
  cycle: NTHSRenewalCycle,
  now: Date
): Promise<string[]> {
  try {
    const due = await NTHSRenewalRepo.getChapterDueToRenewalClose(
      groupId,
      schoolYearDate(cycle),
      cycle.closesAt
    )
    if (!due) return []
    // A chapter with no member rows has nobody to gate on, so it closes whatever the flag says.
    if (!(await isEnabledForAll(due.affectedUserIds))) return []
    if (await closeDueChapter(groupId, cycle, now)) {
      logger.info('Closed NTHS chapter at renewal', { groupId })
    }
    return []
  } catch (err) {
    logger.error('NTHS chapter close step failed', { groupId, err })
    const isLastRun =
      now.getTime() + hoursInMs(1) >= cycle.closeWindowEndsAt.getTime()
    if (isLastRun) {
      logger.warn(
        'NTHS chapter close step failed on the last run of the window',
        { groupId }
      )
    }
    return ['close']
  }
}

async function sendClosedEmails(
  groupId: Ulid,
  cycle: NTHSRenewalCycle
): Promise<string[]> {
  const recipients = await NTHSRenewalRepo.getRenewalClosedEmailRecipients({
    groupId,
    schoolYearStartsOn: schoolYearDate(cycle),
    closesAt: cycle.closesAt,
    emailTemplateId: TEMPLATES.chapterClosed,
  })
  return await sendRenewalEmails(TEMPLATES.chapterClosed, recipients, cycle)
}

async function isEnabledForAll(userIds: Ulid[]): Promise<boolean> {
  for (const userId of userIds) {
    if (!(await isNthsChapterRenewalEnabled(userId))) return false
  }
  return true
}

async function sendRenewalEmails<R extends NTHSRenewalEmailRecipient>(
  templateId: string,
  recipients: R[],
  cycle: NTHSRenewalCycle,
  extraData: (recipient: R) => Partial<NthsRenewalEmailData> = () => ({})
): Promise<string[]> {
  const closeDate = formatDate(new Date(cycle.closesOn))
  const failures: string[] = []
  let sent = 0
  for (const recipient of recipients) {
    const { userId, email, firstName, chapterName } = recipient
    if (!(await isNthsChapterRenewalEnabled(userId))) {
      continue
    }
    try {
      await sendNthsRenewalEmail(email, templateId, {
        firstName,
        chapterName,
        closeDate,
        ...extraData(recipient),
      })
    } catch (err) {
      logger.error('Failed to send NTHS renewal email', {
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
        userId,
        templateId,
        err,
      })
      failures.push(`record ${templateId} for user ${userId}`)
    }
  }
  if (sent) {
    logger.info('Sent NTHS renewal emails', { templateId, sent })
  }
  return failures
}
