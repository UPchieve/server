import * as NTHSRenewalRepo from '../../../models/NTHSRenewal'
import { getNthsChapterRenewalDates } from '../../../services/NTHSRenewalDatesService'
import {
  closeRenewalCycle,
  nextRenewalCycle,
  schoolYearDate,
} from '../../../services/NTHSRenewalService'
import QueueService from '../../../services/QueueService'

export default async function spawnChapterRenewal() {
  const now = new Date()
  const dates = await getNthsChapterRenewalDates()
  if (!dates) return
  const nextCycle = nextRenewalCycle(dates, now)
  const closeCycle = closeRenewalCycle(dates, now)
  if (!closeCycle && now < nextCycle.nominationsOpenAt) return
  const cycle = closeCycle ?? nextCycle
  const chapterIds = await NTHSRenewalRepo.getRenewalCycleChapters(
    schoolYearDate(cycle),
    cycle.closesAt
  )
  for (const nthsGroupId of chapterIds) {
    await QueueService.add(
      'NTHSChapterRenewal',
      { delay: 0 },
      { nthsGroupId, now: now.toISOString() }
    )
  }
}
