import QueueService from '../../services/QueueService'
import * as NTHSService from '../../services/NTHSGroupsService'
import { Jobs } from './index'
import { Job } from 'bull'

export type SpawnUpdateNTHSChapterStatusForImpactPathJobData = {
  periodStart: Date
  periodEnd: Date
}

export default async function (
  job: Job<SpawnUpdateNTHSChapterStatusForImpactPathJobData>
) {
  // Get all chapters that are not already school-official...
  const allChapters = await NTHSService.getAllNTHSGroupsChapterStatus()
  const notSchoolOfficialChapters = allChapters.filter(
    (chapter) => chapter.schoolAffiliationStatusName !== 'AFFILIATED'
  )

  // ... and spawn a job to check if they are official via the "Impact Path"
  for (let i = 0; i < notSchoolOfficialChapters.length; i++) {
    const chapter = notSchoolOfficialChapters[i]
    await QueueService.add(Jobs.UpdateNTHSChapterStatusForImpactPath, {
      nthsGroupId: chapter.groupId,
      startDate: job.data.periodStart,
      endDate: job.data.periodEnd,
    })
  }
}
