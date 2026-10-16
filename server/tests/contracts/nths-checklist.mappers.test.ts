import { toNTHSChecklistPublic } from '../../contracts/nths-checklist.mappers'
import type { NTHSChecklist } from '../../contracts/nths-checklist'
import type { NTHSChecklistItemProgress } from '../../models/NTHSChecklistProgress'

const checklist: NTHSChecklist = {
  spreadsheetId: 'spreadsheet-id',
  sections: [
    {
      id: 1,
      title: 'Get started',
      order: 0,
      items: [
        {
          key: 'recruit-members',
          order: 1,
          title: 'Recruit members',
          daysToComplete: 7,
          resources: [],
          checkable: true,
          skippable: false,
        },
        {
          key: 'review-resources',
          order: 2,
          title: 'Review resources',
          resources: [],
          checkable: true,
          skippable: true,
        },
      ],
    },
  ],
}

const progress: NTHSChecklistItemProgress = {
  id: '1',
  nthsGroupId: 'group-id',
  itemKey: 'recruit-members',
  status: 'complete',
  updatedByUserId: 'user-id',
  createdAt: new Date('2026-10-14T12:00:00.000Z'),
  updatedAt: new Date('2026-10-14T12:00:00.000Z'),
}

describe('toNTHSChecklistPublic', () => {
  test('merges saved progress into matching checklist items', () => {
    expect(
      toNTHSChecklistPublic(
        checklist,
        [progress],
        new Date('2026-10-01T12:00:00.000Z')
      )
    ).toEqual({
      sections: [
        {
          id: 1,
          title: 'Get started',
          order: 0,
          items: [
            {
              key: 'recruit-members',
              order: 1,
              title: 'Recruit members',
              dueDate: '2026-10-08T12:00:00.000Z',
              resources: [],
              checkable: true,
              skippable: false,
              status: 'complete',
            },
            {
              key: 'review-resources',
              order: 2,
              title: 'Review resources',
              dueDate: undefined,
              resources: [],
              checkable: true,
              skippable: true,
              status: 'incomplete',
            },
          ],
        },
      ],
    })
  })

  test('does not expose checklist source or progress audit fields', () => {
    const result = toNTHSChecklistPublic(checklist, [progress])

    expect(result).not.toHaveProperty('spreadsheetId')
    expect(result.sections[0].items[0]).not.toHaveProperty('updatedByUserId')
    expect(result.sections[0].items[0]).not.toHaveProperty('updatedAt')
    expect(result.sections[0].items[0]).not.toHaveProperty('daysToComplete')
  })
})
