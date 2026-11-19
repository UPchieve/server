import { Job } from 'bull'
import * as PresenceService from '../../services/PresenceService'
import { Ulid } from '../../models/pgUtils'

export type MarkPassiveCoachesInactiveJobData = {
  sessionId: Ulid
  coachIds: Ulid[]
  listedAtEpochMs: number
}

export default async (
  job: Job<MarkPassiveCoachesInactiveJobData>
): Promise<void> => {
  await Promise.all(
    job.data.coachIds.map((coachId) =>
      PresenceService.markOfflineIfPassive(coachId, {
        passiveSinceEpochMs: job.data.listedAtEpochMs,
      })
    )
  )
}
