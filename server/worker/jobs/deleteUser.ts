import { Job } from 'bull'
import { runInTransaction, TransactionClient } from '../../db'
import { Uuid } from '../../models/pgUtils'
import { deleteUserFromAdminProfiles } from '../../models/User'

type DeleteUserJob = {
  userId: Uuid
}

export default async (job: Job<DeleteUserJob>): Promise<void> => {
  const userId = job.data.userId

  await runInTransaction(async (tc: TransactionClient) => {
    await Promise.all([
      deleteUserFromAdminProfiles(userId, tc)
    ])
  })
}
