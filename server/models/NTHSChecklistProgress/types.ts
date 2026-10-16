import type { Ulid } from '../pgUtils'
import type { NTHSChecklistItemStatus } from '@upchieve/api-contracts/nths-checklist'

export type { NTHSChecklistItemStatus } from '@upchieve/api-contracts/nths-checklist'

export const NTHS_CHECKLIST_ITEM_STATUSES = [
  'complete',
  'incomplete',
  'skipped',
] as const satisfies readonly NTHSChecklistItemStatus[]

export function isNTHSChecklistItemStatus(
  status: string
): status is NTHSChecklistItemStatus {
  return NTHS_CHECKLIST_ITEM_STATUSES.some(
    (validStatus) => validStatus === status
  )
}

export type NTHSChecklistItemProgress = {
  id: string
  nthsGroupId: Ulid
  itemKey: string
  status: NTHSChecklistItemStatus
  updatedByUserId: Ulid
  createdAt: Date
  updatedAt: Date
}
