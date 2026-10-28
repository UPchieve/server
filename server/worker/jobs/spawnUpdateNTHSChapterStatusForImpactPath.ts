import QueueService from '../../services/QueueService'
import * as NTHSService from '../../services/NTHSGroupsService'
import { Job } from 'bull'
import { UpdateNTHSChapterStatusJobData } from './updateNTHSChapterStatusForImpactPath'

export type SpawnUpdateNTHSChapterStatusForImpactPathJobData = {
  /**
   * The beginning of the period in which the chapter's sessions should be counted toward the chapter's impact goals
   */
  periodStart: Date
  /**
   * The end of the period in which the chapter's sessions should be counted toward the chapter's impact goals
   */
  periodEnd: Date
}

/**
 * Spawns a job for each NTHS chapter to check if its status has changed, i.e. due to meeting the chapter
 * impact requirements.
 */
export default async function (
  job: Job<SpawnUpdateNTHSChapterStatusForImpactPathJobData>
) {
  const { periodStart, periodEnd } = job.data
  const allChapters = await NTHSService.getAllNTHSGroupsChapterStatus()

  for (const chapter of allChapters) {
    await QueueService.add(
      'UpdateNTHSChapterStatusForImpactPath',
      { delay: 0 },
      {
        nthsGroupId: chapter.groupId,
        periodStart,
        periodEnd,
      } as UpdateNTHSChapterStatusJobData
    )
  }
}
