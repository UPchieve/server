import type { NTHSChecklistItemStatus } from '@upchieve/api-contracts/nths-checklist'
import { runInTransaction, TransactionClient } from '../db'
import type { Ulid } from '../models/pgUtils'
import { InputError, LookupError } from '../models/Errors'
import * as NTHSChecklistProgressRepo from '../models/NTHSChecklistProgress'
import * as NTHSGroupsRepo from '../models/NTHSGroups'
import type { NTHSActionName } from '../models/NTHSGroups'
import { getChecklist } from './NTHSChecklistService'

export const LEGACY_CHECKLIST_ACTION_TO_ITEM_KEY = {
  'ATTENDED ORIENTATION': 'complete-president-orientation',
  'NAMED YOUR TEAM': 'name-your-chapter',
  'RECRUITMENT SPRINT': 'text-five-friends-or-peers',
} as const satisfies Partial<Record<NTHSActionName, string>>

export async function getChecklistWithProgress(
  nthsGroupId: Ulid,
  updatedByUserId: Ulid
) {
  const [checklist, group] = await Promise.all([
    getChecklist(),
    NTHSGroupsRepo.getGroupById(nthsGroupId),
  ])
  if (!group) throw new LookupError('NTHS group not found')

  const checklistItemKeys = new Set(
    checklist.sections.flatMap((section) =>
      section.items.map((item) => item.key)
    )
  )
  const progress = await runInTransaction(async (tc: TransactionClient) => {
    const legacyActions = await NTHSGroupsRepo.getNthsGroupActionsByGroupId(
      nthsGroupId,
      tc
    )
    await Promise.all(
      legacyActions.map(async ({ actionName }) => {
        const itemKey =
          LEGACY_CHECKLIST_ACTION_TO_ITEM_KEY[
            actionName as keyof typeof LEGACY_CHECKLIST_ACTION_TO_ITEM_KEY
          ]
        if (!itemKey || !checklistItemKeys.has(itemKey)) return

        await NTHSChecklistProgressRepo.insertNTHSChecklistItemProgressIfMissing(
          {
            nthsGroupId,
            itemKey,
            status: 'complete',
            updatedByUserId,
          },
          tc
        )
      })
    )

    return NTHSChecklistProgressRepo.getNTHSChecklistProgressByGroupId(
      nthsGroupId,
      tc
    )
  })
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
