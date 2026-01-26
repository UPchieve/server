import * as NthsRepo from '../../models/NTHSGroups'
import { getClient, runInTransaction, TransactionClient } from '../../db'
import logger from '../../logger'
import { NTHSGroupMember } from '../../models/NTHSGroups'
import { Ulid } from '../../models/pgUtils'

const logPrefix = 'NTHSGroupMemberRolesBackfill: '
export default async function (): Promise<void> {
  const client: TransactionClient = getClient()

  // Get all NTHS users
  const users = await NthsRepo.getAllNthsMembers(client)
  logger.info(
    `${logPrefix}Found ${users.length} users to insert NTHS group member roles for`
  )

  let insertCount = 0
  const results = await runInTransaction(async (tc) => {
    // For each group they are in, insert their role (derived from their title)
    for (const user of users) {
      await NthsRepo.insertNthsMemberGroupRole(
        {
          userId: user.userId,
          nthsGroupId: user.nthsGroupId,
          roleName: getRoleName(user.userId, user.title),
        },
        tc
      )
      insertCount += 1
    }

    logger.info(`${logPrefix}Inserted roles for ${insertCount} users`)
    if (insertCount !== users.length) {
      logger.error(
        `${logPrefix}Did not insert roles for all expected users. Rolling back the transaction.`
      )
      throw new Error(
        `${logPrefix}Failed to insert roles for all expected users`
      )
    }
  }, client)
}

function getRoleName(userId: Ulid, title?: string): 'admin' | 'member' {
  if (title) {
    const lowercased = title.toLowerCase()
    return lowercased.includes('president') ? 'admin' : 'member'
  }
  throw new Error(`Cannot determine role name for user ${userId}`)
}
