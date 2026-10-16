import type {
  NTHSChecklistItemPublic,
  NTHSChecklistPublic,
} from '@upchieve/api-contracts/nths-checklist'
import type { NTHSChecklist } from './nths-checklist'
import type { NTHSChecklistItemProgress } from '../models/NTHSChecklistProgress'
import { daysInMs } from '../utils/time-utils'

export function toNTHSChecklistPublic(
  checklist: NTHSChecklist,
  progress: NTHSChecklistItemProgress[],
  groupCreatedAt?: Date
): NTHSChecklistPublic {
  const progressByItemKey = new Map(
    progress.map((itemProgress) => [itemProgress.itemKey, itemProgress])
  )

  return {
    sections: checklist.sections.map((section) => ({
      id: section.id,
      title: section.title,
      order: section.order,
      items: section.items.map((item): NTHSChecklistItemPublic => {
        const dueDate =
          groupCreatedAt && item.daysToComplete !== undefined
            ? new Date(
                groupCreatedAt.getTime() + daysInMs(item.daysToComplete)
              ).toISOString()
            : undefined

        return {
          key: item.key,
          order: item.order,
          title: item.title,
          description: item.description,
          dueDate,
          resources: item.resources,
          checkable: item.checkable,
          skippable: item.skippable,
          status: progressByItemKey.get(item.key)?.status ?? 'incomplete',
        }
      }),
    })),
  }
}
