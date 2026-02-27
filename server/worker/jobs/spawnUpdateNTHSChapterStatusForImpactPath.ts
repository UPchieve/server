import QueueService from '../../services/QueueService'
import * as NTHSService from '../../services/NTHSGroupsService'
import { Jobs } from './index'
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
 * Exclude chapters which are school affiliated because these ones are "official" chapters regardless of impact stats.
 */
export default async function (
  job: Job<SpawnUpdateNTHSChapterStatusForImpactPathJobData>
) {
  const { periodStart, periodEnd } = job.data
  // Get all chapters that are not already school-official...
  const allChapters = await NTHSService.getAllNTHSGroupsChapterStatus()
  const notSchoolOfficialChapters = allChapters.filter(
    (chapter) => chapter.schoolAffiliationStatusName !== 'AFFILIATED'
  )

  // ... and spawn a job to check if they are official via the "Impact Path"
  for (const chapter of notSchoolOfficialChapters) {
    await QueueService.add(Jobs.UpdateNTHSChapterStatusForImpactPath, {
      nthsGroupId: chapter.groupId,
      periodStart,
      periodEnd,
    } as UpdateNTHSChapterStatusJobData)
  }
}
