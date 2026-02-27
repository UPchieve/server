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
  const nthsGroupId = job.data.nthsGroupId
  // At compile time, these are dates, but they are date strings at runtime
  // Convert back to dates here so we can make use of the Date APIs without throwing runtime errors.
  const periodStart = new Date(job.data.periodStart)
  const periodEnd = new Date(job.data.periodEnd)
  // Get all-time members (including deactivated)
  const alltimeMembers = await NTHSService.getGroupMembers(nthsGroupId)

  // Filter down to those who are in ready to coach status
  const readyToCoachInfo =
    await VolunteersService.getVolunteersReadyToCoachStatus(
      alltimeMembers.map((member) => member.userId)
    )
  const readyToCoachUserIds = new Set<Ulid>(
    readyToCoachInfo
      .filter((coach) => coach.isReadyToCoach)
      .map((coach) => coach.id)
  )
  const readyToCoachMembers = alltimeMembers.filter((member) =>
    readyToCoachUserIds.has(member.userId)
  )

  // Check if at least 6 of them did 1 session during the period of [t1, t2]
  // where t1 = max(joinedAt, startDate)
  // and t2 = min(endDate, deactivatedAt)
  const eligibleMembers: NTHSGroupMemberWithRole[] = []
  for (let i = 0; i < readyToCoachMembers.length; i++) {
    const user = readyToCoachMembers[i]
    const startDate = user.joinedAt > periodStart ? user.joinedAt : periodStart
    const endDate =
      user.deactivatedAt && user.deactivatedAt < periodEnd
        ? user.deactivatedAt
        : periodEnd
    const usersSessions = await SessionRepo.getUserSessionsByUserId(
      user.userId,
      {
        start: startDate,
        end: endDate,
      }
    )
    if (usersSessions.some((session) => session.volunteerId === user.userId)) {
      eligibleMembers.push(user)
    }
  }

  const newChapterStatusName: NTHSChapterStatusName =
    eligibleMembers.length >= 6 ? 'OFFICIAL' : 'PENDING'
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
  // @TODO Emit emails.
}
