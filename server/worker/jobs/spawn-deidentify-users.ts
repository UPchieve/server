import { Job } from 'bull'
import { Ulid } from '../../models/pgUtils'
import * as QueueService from '../../services/QueueService'

type SpawnDeidentifyUsersJob = {
  userIds: Ulid[]
}
export default async (job: Job<SpawnDeidentifyUsersJob>): Promise<void> => {
  const userIds = job.data.userIds

  for (const userId of userIds) {
    await QueueService.add(
      'DeidentifyUser',
      {
        priority: 3,
        removeOnFail: false,
        delay: 0,
      },
      {
        userId,
      }
    )
  }
}
