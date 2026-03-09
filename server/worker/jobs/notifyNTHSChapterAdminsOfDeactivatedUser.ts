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
    log('NTHS chapter has no admins', logData, true)
    return
  }
  const deactivatedUser = await UserService.getUserContactInfo(
    job.data.deactivatedUserId
  )
  if (!deactivatedUser?.firstName) {
    log("Could not find deactivated user's contact info", logData, true)
    throw new Error("Could not find deactivated user's contact info")
  }
  await MailService.sendNTHSChapterAdminsMemberDeactivationNotice(
    adminsContactInfo,
    deactivatedUser!.firstName
  )
  log('NTHS chapter admins were notified of a deactivated member', {
    ...logData,
    adminUserIds: adminsContactInfo.map((admin) => admin.userId),
  })
}

function log(message: string, logData: any, isError = false) {
  const logLevelFunction = isError ? logger.error : logger.info
  logLevelFunction(logData ?? {}, message)
}
