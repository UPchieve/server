import {
  getNonHighSchoolNTHSMembers,
  deactivateGroupMember,
} from '../models/NTHSGroups'
import { getClient, runInTransaction } from '../db'
import logger from '../logger'
import { Ulid } from '../models/pgUtils'
import QueueService from '../services/QueueService'
import { Jobs } from './jobs'
import { sendIndividualsDeactivationFromNTHSNotice } from '../services/MailService'

const logPrefix = `NTHS Cleanup of Non-HS members: `
export default async function () {
  const client = getClient()
  const membersToRemove = await getNonHighSchoolNTHSMembers(client)
  const affectedChapterIds = new Set<Ulid>()
  membersToRemove.forEach((member) =>
    affectedChapterIds.add(member.nthsGroupId)
  )

  logger.info(
    {
      userIds: membersToRemove.map((member) => member.userId),
      groupIds: Array.from(affectedChapterIds),
    },
    `${logPrefix}Found ${membersToRemove.length} NTHS members to remove`
  )

  await runInTransaction(async (tc) => {
    for (const member of membersToRemove) {
      await deactivateGroupMember(member.userId, member.nthsGroupId, tc)
      await QueueService.add(Jobs.NotifyNTHSChapterAdminsOfDeactivatedUser, {
        nthsGroupId: member.nthsGroupId,
        deactivatedUserId: member.userId,
      })
      await sendIndividualsDeactivationFromNTHSNotice(
        member.firstName,
        member.email,
        member.chapterName
      )

      logger.info(
        {
          userId: member.userId,
          groupId: member.nthsGroupId,
        },
        `${logPrefix}Removed a non-HS user from NTHS`
      )
    }
  }, client)
}
