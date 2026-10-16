import {
  isNTHSChecklistItemStatus,
  toNTHSChecklistItemProgress,
} from '../../models/NTHSChecklistProgress'

describe('isNTHSChecklistItemStatus', () => {
  test.each(['complete', 'incomplete', 'skipped'])('accepts %s', (status) => {
    expect(isNTHSChecklistItemStatus(status)).toBe(true)
  })

  test.each(['checked', 'unchecked', ''])('rejects %s', (status) => {
    expect(isNTHSChecklistItemStatus(status)).toBe(false)
  })
})

describe('toNTHSChecklistItemProgress', () => {
  const row = {
    id: '1',
    nthsGroupId: 'group-id',
    itemKey: 'recruit-members',
    status: 'complete',
    updatedByUserId: 'user-id',
    createdAt: new Date('2026-10-14T12:00:00.000Z'),
    updatedAt: new Date('2026-10-14T12:00:00.000Z'),
  }

  test('maps a row with a valid status', () => {
    expect(toNTHSChecklistItemProgress(row)).toEqual(row)
  })

  test('rejects a row with an invalid status', () => {
    expect(() =>
      toNTHSChecklistItemProgress({ ...row, status: 'invalid' })
    ).toThrow('Invalid NTHS checklist item status: invalid')
  })
})
