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
  startDate: Date
  endDate: Date
}

export default async function (job: Job<UpdateNTHSChapterStatusJobData>) {
  // Get all-time members (including deactivated)
  const alltimeMembers = await NTHSService.getGroupMembers(job.data.nthsGroupId)

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
    const startDate = new Date(
      Math.max(
        user.joinedAt.getMilliseconds(),
        job.data.startDate.getMilliseconds()
      )
    )
    const endDate = new Date(
      Math.min(
        (user.deactivatedAt ?? job.data.endDate).getMilliseconds(),
        job.data.endDate.getMilliseconds()
      )
    )
    const usersSessions = await SessionRepo.getUserSessionsByUserId(
      user.userId,
      {
        start: startDate,
        end: endDate,
        subject: '',
      }
    )
    if (usersSessions.some((session) => session.volunteerId === user.userId)) {
      eligibleMembers.push(user)
    }
  }

  const newChapterStatusName: NTHSChapterStatusName =
    eligibleMembers.length >= 6 ? 'OFFICIAL' : 'PENDING'
  const previousChapterStatus = await NTHSService.getLatestNthsChapterStatus(
    job.data.nthsGroupId
  )
  if (
    previousChapterStatus &&
    previousChapterStatus.statusName === newChapterStatusName
  ) {
    logger.info(
      {
        status: newChapterStatusName,
        groupId: job.data.nthsGroupId,
      },
      `${logPrefix}Chapter status is unchanged`
    )
    return
  }
  await NTHSService.insertNthsChapterStatus(
    job.data.nthsGroupId,
    newChapterStatusName
  )
  // @TODO Emit emails.
}
