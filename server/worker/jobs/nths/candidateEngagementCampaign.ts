import { Job } from 'bull'
import moment from 'moment'
import 'moment-timezone'
import config from '../../../config'
import {
  NTHS_CAMPAIGN_EMAILS,
  NTHSCampaignEmail,
} from '../../../constants/nths-campaign'
import logger from '../../../logger'
import * as NthsApplicationRepo from '../../../models/NTHSApplication'
import type { NTHSActiveCampaignPresident } from '../../../models/NTHSApplication'
import {
  NTHSCampaignEmailRecipient,
  sendNTHSCampaignEmail,
} from '../../../services/MailService'
import * as NotificationService from '../../../services/NotificationService'
import * as NTHSGroupsService from '../../../services/NTHSGroupsService'
import { buildAppLink } from '../../../utils/link-builders'
import {
  NTHSCampaignSelection,
  NTHSCampaignState,
  selectNTHSCampaignEmail,
} from './candidateEngagementCampaignState'

const EMAIL_BATCH_SIZE = 100
const CAMPAIGN_TIME_ZONE = 'America/New_York'

type JobData = {
  cohortStartDate: Date
  cohortEndDate: Date
}

type SelectedCampaignEmail = {
  president: NTHSActiveCampaignPresident
  selection: NTHSCampaignSelection
  membersCount: number
}

type PendingRecipient<T extends NTHSCampaignEmail> = {
  userId: string
  recipient: NTHSCampaignEmailRecipient<T>
}

type PendingRecipientsByEmail = {
  [T in NTHSCampaignEmail]: PendingRecipient<T>[]
}

function asTemplateEntries(): [NTHSCampaignEmail, string][] {
  return Object.entries(config.sendgrid.nthsCandidateEngagment) as [
    NTHSCampaignEmail,
    string,
  ][]
}

function mapSentEmails(
  notifications: Awaited<
    ReturnType<typeof NotificationService.getLatestEmailNotifications>
  >
): Map<string, NTHSCampaignState['sentAt']> {
  const emailByTemplateId = new Map(
    asTemplateEntries().map(([email, templateId]) => [templateId, email])
  )
  const sentByUser = new Map<string, NTHSCampaignState['sentAt']>()

  for (const notification of notifications) {
    const email = emailByTemplateId.get(notification.emailTemplateId)
    if (!email) continue
    const sentAt = sentByUser.get(notification.userId) ?? {}
    sentAt[email] = notification.sentAt
    sentByUser.set(notification.userId, sentAt)
  }

  return sentByUser
}

function emptyPendingRecipients(): PendingRecipientsByEmail {
  return {
    setupDay3: [],
    recruitingDay3: [],
    recruitingDay8: [],
    recruitingDay14: [],
    recruitingDay18: [],
    activationA1: [],
    activationA2: [],
    activationA3: [],
    day21Extension: [],
  }
}

function formattedLaunchDate(launchDate: Date): string {
  return moment(launchDate).tz(CAMPAIGN_TIME_ZONE).format('MMMM D, YYYY')
}

function groupRecipients(
  selections: SelectedCampaignEmail[],
  tutoringCountsByGroupId: Map<string, number>
): PendingRecipientsByEmail {
  const pending = emptyPendingRecipients()

  for (const { president, selection, membersCount } of selections) {
    const base = {
      to: president.email,
      dynamicData: { firstName: president.firstName },
    }
    const launch_date = formattedLaunchDate(selection.launchDate)
    const common = { userId: president.userId }

    switch (selection.email) {
      case 'setupDay3':
        pending.setupDay3.push({ ...common, recipient: base })
        break
      case 'recruitingDay3':
        pending.recruitingDay3.push({
          ...common,
          recipient: {
            ...base,
            dynamicData: { ...base.dynamicData, launch_date },
          },
        })
        break
      case 'recruitingDay8':
        pending.recruitingDay8.push({
          ...common,
          recipient: {
            ...base,
            dynamicData: {
              ...base.dynamicData,
              days_left: selection.daysLeft,
            },
          },
        })
        break
      case 'recruitingDay14':
        pending.recruitingDay14.push({
          ...common,
          recipient: {
            ...base,
            dynamicData: {
              ...base.dynamicData,
              days_left: selection.daysLeft,
            },
          },
        })
        break
      case 'recruitingDay18':
        if (!president.inviteCode)
          throw new Error(
            `NTHS chapter ${president.chapterId} has no invite code`
          )
        pending.recruitingDay18.push({
          ...common,
          recipient: {
            ...base,
            dynamicData: {
              ...base.dynamicData,
              days_left: selection.daysLeft,
              invite_link: buildAppLink(`join-team/${president.inviteCode}`),
            },
          },
        })
        break
      case 'activationA1':
      case 'activationA2':
      case 'activationA3': {
        if (!president.chapterId)
          throw new Error(
            `Activation email ${selection.email} has no NTHS chapter`
          )
        const recipient = {
          ...base,
          dynamicData: {
            ...base.dynamicData,
            members_count: membersCount,
            tutoring_count:
              tutoringCountsByGroupId.get(president.chapterId) ?? 0,
            launch_date,
          },
        }
        pending[selection.email].push({ ...common, recipient })
        break
      }
      case 'day21Extension':
        pending.day21Extension.push({
          ...common,
          recipient: {
            ...base,
            dynamicData: { ...base.dynamicData, launch_date },
          },
        })
        break
    }
  }

  return pending
}

async function sendPendingRecipients(
  pendingByEmail: PendingRecipientsByEmail
): Promise<void> {
  for (const email of NTHS_CAMPAIGN_EMAILS) {
    const pending = pendingByEmail[
      email
    ] as PendingRecipient<NTHSCampaignEmail>[]
    const templateId = config.sendgrid.nthsCandidateEngagment[email]

    for (let start = 0; start < pending.length; start += EMAIL_BATCH_SIZE) {
      const batch = pending.slice(start, start + EMAIL_BATCH_SIZE)
      await sendNTHSCampaignEmail(
        email,
        batch.map(({ recipient }) => recipient)
      )
      for (const { userId } of batch) {
        await NotificationService.createEmailNotification({
          userId,
          emailTemplateId: templateId,
        })
      }
      logger.info('Sent NTHS candidate engagement email batch', {
        email,
        recipientsCount: batch.length,
      })
    }
  }
}

export default async function (job: Job<JobData>) {
  const cohortStartDate = new Date(job.data.cohortStartDate)
  const cohortEndDate = new Date(job.data.cohortEndDate)
  const presidents = await NthsApplicationRepo.getActiveCampaignPresidents(
    cohortStartDate,
    cohortEndDate
  )

  if (!presidents.length) {
    logger.info('Found no active NTHS candidate engagement presidents')
    return
  }

  const groupIds = presidents.flatMap(({ chapterId }) =>
    chapterId ? [chapterId] : []
  )
  const templateIds = asTemplateEntries().map(([, templateId]) => templateId)
  const [memberCounts, notifications] = await Promise.all([
    NTHSGroupsService.getActiveMemberCounts(groupIds),
    NotificationService.getLatestEmailNotifications(
      presidents.map(({ userId }) => userId),
      templateIds
    ),
  ])
  const membersByGroupId = new Map(
    memberCounts.map(({ groupId, membersCount }) => [groupId, membersCount])
  )
  const sentByUser = mapSentEmails(notifications)
  const now = new Date()
  const selections = presidents.flatMap((president) => {
    const membersCount = president.chapterId
      ? (membersByGroupId.get(president.chapterId) ?? 0)
      : 0
    const selection = selectNTHSCampaignEmail(
      {
        approvedAt: president.approvedAt,
        chapterId: president.chapterId,
        membersCount,
        sentAt: sentByUser.get(president.userId) ?? {},
      },
      now
    )
    return selection ? [{ president, selection, membersCount }] : []
  })

  if (!selections.length) {
    logger.info('Found no NTHS candidate engagement emails due', {
      presidentsCount: presidents.length,
    })
    return
  }

  const activationGroupIds = selections.flatMap(({ president, selection }) =>
    selection.email.startsWith('activation') && president.chapterId
      ? [president.chapterId]
      : []
  )
  const tutoringCounts = activationGroupIds.length
    ? await NTHSGroupsService.getTutoringMemberCounts(activationGroupIds)
    : []
  const tutoringCountsByGroupId = new Map(
    tutoringCounts.map(({ groupId, tutoringMembersCount }) => [
      groupId,
      tutoringMembersCount,
    ])
  )

  await sendPendingRecipients(
    groupRecipients(selections, tutoringCountsByGroupId)
  )
}
