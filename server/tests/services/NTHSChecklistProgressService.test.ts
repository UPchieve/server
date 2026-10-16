import { mocked } from 'jest-mock'
import * as NTHSChecklistProgressRepo from '../../models/NTHSChecklistProgress'
import * as NTHSGroupsRepo from '../../models/NTHSGroups'
import { InputError, LookupError } from '../../models/Errors'
import * as NTHSChecklistService from '../../services/NTHSChecklistService'
import {
  getChecklistWithProgress,
  updateChecklistItemProgress,
} from '../../services/NTHSChecklistProgressService'

jest.mock('../../models/NTHSChecklistProgress')
jest.mock('../../models/NTHSGroups')
jest.mock('../../services/NTHSChecklistService')

const checklist = {
  spreadsheetId: 'spreadsheet-id',
  sections: [
    {
      id: 1,
      title: 'Get started',
      order: 0,
      items: [
        {
          key: 'checkable-item',
          order: 1,
          title: 'Checkable item',
          resources: [],
          checkable: true,
          skippable: false,
        },
        {
          key: 'skippable-item',
          order: 2,
          title: 'Skippable item',
          resources: [],
          checkable: false,
          skippable: true,
        },
      ],
    },
  ],
}

const savedProgress = {
  id: '1',
  nthsGroupId: 'group-id',
  itemKey: 'checkable-item',
  status: 'complete' as const,
  updatedByUserId: 'user-id',
  createdAt: new Date('2026-10-14T12:00:00.000Z'),
  updatedAt: new Date('2026-10-14T12:00:00.000Z'),
}

beforeEach(() => {
  jest.resetAllMocks()
  mocked(NTHSChecklistService.getChecklist).mockResolvedValue(checklist)
  mocked(NTHSGroupsRepo.getGroupById).mockResolvedValue({
    id: 'group-id',
    name: 'Chapter',
    key: 'chapter',
    inviteCode: 'ABC123',
    createdAt: new Date('2026-10-01T12:00:00.000Z'),
  })
})

describe('getChecklistWithProgress', () => {
  test('loads the checklist definition and chapter progress', async () => {
    mocked(
      NTHSChecklistProgressRepo.getNTHSChecklistProgressByGroupId
    ).mockResolvedValue([savedProgress])

    await expect(getChecklistWithProgress('group-id')).resolves.toEqual({
      checklist,
      progress: [savedProgress],
      groupCreatedAt: new Date('2026-10-01T12:00:00.000Z'),
    })
    expect(
      NTHSChecklistProgressRepo.getNTHSChecklistProgressByGroupId
    ).toHaveBeenCalledWith('group-id')
    expect(NTHSGroupsRepo.getGroupById).toHaveBeenCalledWith('group-id')
  })

  test('rejects a group that no longer exists', async () => {
    mocked(NTHSGroupsRepo.getGroupById).mockResolvedValue(undefined)

    await expect(getChecklistWithProgress('group-id')).rejects.toThrow(
      LookupError
    )
  })
})

describe('updateChecklistItemProgress', () => {
  test.each(['complete', 'incomplete'] as const)(
    'stores %s for a checkable item',
    async (status) => {
      mocked(
        NTHSChecklistProgressRepo.upsertNTHSChecklistItemProgress
      ).mockResolvedValue({ ...savedProgress, status })

      await updateChecklistItemProgress({
        nthsGroupId: 'group-id',
        itemKey: 'checkable-item',
        status,
        updatedByUserId: 'user-id',
      })

      expect(
        NTHSChecklistProgressRepo.upsertNTHSChecklistItemProgress
      ).toHaveBeenCalledWith({
        nthsGroupId: 'group-id',
        itemKey: 'checkable-item',
        status,
        updatedByUserId: 'user-id',
      })
    }
  )

  test('stores skipped for a skippable item', async () => {
    mocked(
      NTHSChecklistProgressRepo.upsertNTHSChecklistItemProgress
    ).mockResolvedValue({
      ...savedProgress,
      itemKey: 'skippable-item',
      status: 'skipped',
    })

    await updateChecklistItemProgress({
      nthsGroupId: 'group-id',
      itemKey: 'skippable-item',
      status: 'skipped',
      updatedByUserId: 'user-id',
    })

    expect(
      NTHSChecklistProgressRepo.upsertNTHSChecklistItemProgress
    ).toHaveBeenCalled()
  })

  test('stores incomplete for a skippable-only item', async () => {
    mocked(
      NTHSChecklistProgressRepo.upsertNTHSChecklistItemProgress
    ).mockResolvedValue({
      ...savedProgress,
      itemKey: 'skippable-item',
      status: 'incomplete',
    })

    await updateChecklistItemProgress({
      nthsGroupId: 'group-id',
      itemKey: 'skippable-item',
      status: 'incomplete',
      updatedByUserId: 'user-id',
    })

    expect(
      NTHSChecklistProgressRepo.upsertNTHSChecklistItemProgress
    ).toHaveBeenCalledWith({
      nthsGroupId: 'group-id',
      itemKey: 'skippable-item',
      status: 'incomplete',
      updatedByUserId: 'user-id',
    })
  })

  test('rejects an unknown item', async () => {
    await expect(
      updateChecklistItemProgress({
        nthsGroupId: 'group-id',
        itemKey: 'missing-item',
        status: 'complete',
        updatedByUserId: 'user-id',
      })
    ).rejects.toThrow(LookupError)
  })

  test('rejects checking a non-checkable item', async () => {
    await expect(
      updateChecklistItemProgress({
        nthsGroupId: 'group-id',
        itemKey: 'skippable-item',
        status: 'complete',
        updatedByUserId: 'user-id',
      })
    ).rejects.toThrow(InputError)
  })

  test('rejects skipping a non-skippable item', async () => {
    await expect(
      updateChecklistItemProgress({
        nthsGroupId: 'group-id',
        itemKey: 'checkable-item',
        status: 'skipped',
        updatedByUserId: 'user-id',
      })
    ).rejects.toThrow(InputError)
  })
})
