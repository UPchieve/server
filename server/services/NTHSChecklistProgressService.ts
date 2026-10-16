import type { NTHSChecklistItemStatus } from '@upchieve/api-contracts/nths-checklist'
import type { Ulid } from '../models/pgUtils'
import { InputError, LookupError } from '../models/Errors'
import * as NTHSChecklistProgressRepo from '../models/NTHSChecklistProgress'
import * as NTHSGroupsRepo from '../models/NTHSGroups'
import { getChecklist } from './NTHSChecklistService'

export async function getChecklistWithProgress(nthsGroupId: Ulid) {
  const [checklist, progress, group] = await Promise.all([
    getChecklist(),
    NTHSChecklistProgressRepo.getNTHSChecklistProgressByGroupId(nthsGroupId),
    NTHSGroupsRepo.getGroupById(nthsGroupId),
  ])
  if (!group) throw new LookupError('NTHS group not found')
  return { checklist, progress, groupCreatedAt: group.createdAt }
}

export async function updateChecklistItemProgress(args: {
  nthsGroupId: Ulid
  itemKey: string
  status: NTHSChecklistItemStatus
  updatedByUserId: Ulid
}) {
  const checklist = await getChecklist()
  const item = checklist.sections
    .flatMap((section) => section.items)
    .find((candidate) => candidate.key === args.itemKey)

  if (!item) throw new LookupError('NTHS checklist item not found')
  if (args.status === 'skipped' && !item.skippable)
    throw new InputError('NTHS checklist item cannot be skipped')
  if (args.status === 'complete' && !item.checkable)
    throw new InputError('NTHS checklist item cannot be checked')

  return NTHSChecklistProgressRepo.upsertNTHSChecklistItemProgress(args)
}
