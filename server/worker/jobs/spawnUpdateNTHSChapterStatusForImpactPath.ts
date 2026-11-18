import QueueService from '../../services/QueueService'
import * as NTHSService from '../../services/NTHSGroupsService'

/**
 * Spawns a job for each NTHS chapter to check if its status has changed, i.e. due to meeting the chapter
 * impact requirements.
 */
export default async function () {
  const allChapters = await NTHSService.getAllNTHSGroupsChapterStatus()

  for (const chapter of allChapters) {
    await QueueService.add(
      'UpdateNTHSChapterStatusForImpactPath',
      { delay: 0 },
      {
        nthsGroupId: chapter.groupId,
      }
    )
  }
}
