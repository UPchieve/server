import { Ulid } from '../../models/pgUtils'
import { Job } from 'bull'
import logger from '../../logger'
import * as NTHSGroupsRepo from '../../models/NTHSGroups'
import * as MailService from '../../services/MailService'
import * as UserService from '../../services/UserService'

export type NotifyNTHSChapterAdminsOfDeactivatedUserJobData = {
  nthsGroupId: Ulid
  deactivatedUserId: Ulid
}

export default async function (
  job: Job<NotifyNTHSChapterAdminsOfDeactivatedUserJobData>
) {
  const logData = {
    groupId: job.data.nthsGroupId,
    deactivatedUserId: job.data.deactivatedUserId,
  }
  const adminsContactInfo = await NTHSGroupsRepo.getGroupAdminsContactInfo(
    job.data.nthsGroupId
  )
  if (!adminsContactInfo.length) {
    logger.warn('NTHS chapter has no current admins to notify', logData)
    return
  }
  const deactivatedUser = await UserService.getUserContactInfo(
    job.data.deactivatedUserId
  )
  if (!deactivatedUser?.firstName) {
    const err = new Error("Could not find deactivated user's contact info")
    logger.error(err.message, { err, ...logData })
    throw err
  }
  await MailService.sendNTHSChapterAdminsMemberDeactivationNotice(
    adminsContactInfo,
    deactivatedUser!.firstName
  )
  logger.info('NTHS chapter admins were notified of a deactivated member', {
    ...logData,
    adminUserIds: adminsContactInfo.map((admin) => admin.userId),
  })
}
