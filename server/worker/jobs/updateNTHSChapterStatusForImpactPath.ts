import { Ulid } from '../../models/pgUtils'
import { Job } from 'bull'
import * as NTHSService from '../../services/NTHSGroupsService'
import * as VolunteersService from '../../services/VolunteerService'
import * as SessionRepo from '../../models/Session'
import {
  NTHSChapterStatusName,
  NTHSGroupMemberWithRole,
} from '../../models/NTHSGroups'
import logger from '../../logger'
import * as MailService from '../../services/MailService'

const logPrefix = `NTHS Impact Path Chapter Status: `

export type UpdateNTHSChapterStatusJobData = {
  nthsGroupId: Ulid
  periodStart: Date
  periodEnd: Date
}

/**
 * Calculate the NTHS chapter's status (i.e. "official" or "pending") based off of their group impact.
 */
export default async function (job: Job<UpdateNTHSChapterStatusJobData>) {
  // At compile time, these are dates, but they are date strings at runtime
  // Convert back to dates here so we can make use of the Date APIs without throwing runtime errors.
  const periodStart = new Date(job.data.periodStart)
  const periodEnd = new Date(job.data.periodEnd)

  const nthsGroupId = job.data.nthsGroupId
  logger.info(
    {
      groupId: nthsGroupId,
      periodStart,
      periodEnd,
    },
    `${logPrefix}Checking NTHS impact path status for chapter`
  )

  // Get all-time members (including deactivated)
  const alltimeMembers = await NTHSService.getGroupMembers(nthsGroupId)

  // Filter down to those who are in ready to coach status
  const readyToCoachInfo =
    await VolunteersService.getVolunteersReadyToCoachStatus(
      alltimeMembers.map((member) => member.userId)
    )
  const readyToCoachUserIds = new Set<Ulid>(
    readyToCoachInfo
      .filter(
        (coach) =>
          coach.isReadyToCoach &&
          coach.banType !== 'complete' &&
          coach.banType !== 'shadow'
      )
      .map((coach) => coach.id)
  )
  const readyToCoachMembers = alltimeMembers.filter((member) =>
    readyToCoachUserIds.has(member.userId)
  )
  logger.info(
    {
      groupId: nthsGroupId,
      userIds: Array.from(readyToCoachUserIds),
    },
    `${logPrefix}Found ${readyToCoachUserIds.size} ready-to-coach members of NTHS chapter`
  )

  // Check if at least 6 of them did 1 session during the period of [t1, t2]
  // where t1 = startDate
  // and t2 = min(endDate, deactivatedAt)
  const eligibleMembers: NTHSGroupMemberWithRole[] = []
  for (const user of readyToCoachMembers) {
    const endDate =
      user.deactivatedAt && user.deactivatedAt < periodEnd
        ? user.deactivatedAt
        : periodEnd
    const usersSessions = await SessionRepo.getUserSessionsByUserId(
      user.userId,
      {
        start: periodStart,
        end: endDate,
      }
    )
    if (usersSessions.some((session) => session.volunteerId === user.userId)) {
      eligibleMembers.push(user)
    }
  }

  const newChapterStatusName: NTHSChapterStatusName =
    eligibleMembers.length >= 6 ? 'OFFICIAL' : 'PENDING'
  logger.info(
    {
      groupId: nthsGroupId,
      newChapterStatus: newChapterStatusName,
      userIds: eligibleMembers.map((member) => member.userId),
    },
    `${logPrefix}Counted ${eligibleMembers.length} eligible members for impact path for NTHS chapter`
  )
  const previousChapterStatus =
    await NTHSService.getLatestNthsChapterStatus(nthsGroupId)
  if (
    previousChapterStatus &&
    previousChapterStatus.statusName === newChapterStatusName
  ) {
    logger.info(
      {
        status: newChapterStatusName,
        groupId: nthsGroupId,
      },
      `${logPrefix}Chapter status is unchanged`
    )
    return
  }
  await NTHSService.insertNthsChapterStatus(nthsGroupId, newChapterStatusName)
  logger.info(
    { groupId: nthsGroupId, status: newChapterStatusName },
    `${logPrefix}Chapter status has been updated to ${newChapterStatusName}`
  )
  if (newChapterStatusName === 'OFFICIAL') {
    const nthsChapter = await NTHSService.getNTHSGroupByID(nthsGroupId)
    if (!nthsChapter) {
      throw new Error(`Could not find NTHS group with ID ${nthsGroupId}`)
    }
    const chapterName = nthsChapter.name
    const emailRecipients = await getChapterAdminsContactInfo(nthsGroupId)
    await MailService.sendNTHSChapterImpactPathOfficialStatusNotification(
      emailRecipients,
      chapterName
    )
    logger.info(
      {
        countUsersNotified: emailRecipients.length,
        groupId: nthsGroupId,
      },
      `${logPrefix}Sent chapter official notification to NTHS chapter admins`
    )
  }
}

async function getChapterAdminsContactInfo(nthsGroupId: Ulid): Promise<
  {
    firstName: string
    email: string
  }[]
> {
  return await NTHSService.getNTHSGroupAdminsContactInfo(nthsGroupId)
}
