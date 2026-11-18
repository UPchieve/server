import { Ulid } from '../../models/pgUtils'
import { Job } from 'bull'
import * as NTHSService from '../../services/NTHSGroupsService'
import {
  getNthsChapterImpact,
  NTHSChapterStatusName,
} from '../../models/NTHSGroups'
import { schoolYearFor } from '../../utils/school-year'
import logger from '../../logger'
import * as MailService from '../../services/MailService'

const logPrefix = `NTHS Impact Path Chapter Status: `

export type UpdateNTHSChapterStatusJobData = {
  nthsGroupId: Ulid
}

/**
 * Calculate the NTHS chapter's status (i.e. "official" or "pending") based off of their group impact.
 */
export default async function (job: Job<UpdateNTHSChapterStatusJobData>) {
  const nthsGroupId = job.data.nthsGroupId
  logger.info(`${logPrefix}Checking NTHS impact path status for chapter`, {
    groupId: nthsGroupId,
  })

  const schoolYear = schoolYearFor(new Date())
  const { hasOfficialStatus, schoolYearToDate } = await getNthsChapterImpact(
    nthsGroupId,
    schoolYear.startsAt,
    schoolYear.endsAt
  )

  if (hasOfficialStatus) {
    logger.info(`${logPrefix}Already OFFICIAL; skipping`, {
      groupId: nthsGroupId,
    })
    return
  }

  const previousChapterStatus =
    await NTHSService.getLatestNthsChapterStatus(nthsGroupId)
  const newChapterStatusName: NTHSChapterStatusName =
    schoolYearToDate.membersTutoring >=
    NTHSService.CHAPTER_GOALS.membersTutoring
      ? 'OFFICIAL'
      : 'PENDING'
  logger.info(
    `${logPrefix}Counted ${schoolYearToDate.membersTutoring} members tutoring for NTHS chapter`,
    { groupId: nthsGroupId, newChapterStatus: newChapterStatusName }
  )

  if (
    previousChapterStatus &&
    previousChapterStatus.statusName === newChapterStatusName
  ) {
    logger.info(`${logPrefix} unchanged`, {
      status: newChapterStatusName,
      groupId: nthsGroupId,
    })
    return
  }
  await NTHSService.insertNthsChapterStatus(nthsGroupId, newChapterStatusName)
  logger.info(
    `${logPrefix}Chapter status has been updated to ${newChapterStatusName}`,
    { groupId: nthsGroupId, status: newChapterStatusName }
  )
  if (newChapterStatusName === 'OFFICIAL') {
    const nthsChapter = await NTHSService.getNTHSGroupByID(nthsGroupId)
    if (!nthsChapter) {
      throw new Error(`Could not find NTHS group with ID ${nthsGroupId}`)
    }
    const chapterName = nthsChapter.name
    const emailRecipients = await getChapterAdminsContactInfo(nthsGroupId)
    if (!emailRecipients.length) {
      logger.warn(
        `${logPrefix}NTHS chapter has no current admins to notify of official status`,
        { groupId: nthsGroupId }
      )
      return
    }
    await MailService.sendNTHSChapterImpactPathOfficialStatusNotification(
      emailRecipients,
      chapterName
    )
    logger.info(
      `${logPrefix}Sent chapter official notification to NTHS chapter admins`,
      {
        countUsersNotified: emailRecipients.length,
        groupId: nthsGroupId,
      }
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
