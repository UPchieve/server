import {
  ChecklistSource,
  ChecklistWorksheet,
  NTHSChecklistCache,
  NTHSChecklistValidationError,
  parseChecklist,
  parseResources,
} from '../../services/NTHSChecklistService'

function worksheet(
  rows: Array<Record<string, unknown>>,
  overrides: Partial<ChecklistWorksheet> = {}
): ChecklistWorksheet {
  return {
    sheetId: 123,
    title: 'Set up your chapter',
    index: 0,
    headerValues: [
      'item_key',
      'title',
      'description',
      'days_to_complete',
      'resource_links',
      'checkable',
      'skippable',
      'active',
    ],
    getRows: async () =>
      rows.map((values) => ({
        get: (key: string) => values[key],
      })),
    ...overrides,
  } as ChecklistWorksheet
}

const validRow = {
  item_key: 'complete-orientation',
  title: 'Complete orientation',
  description: 'Learn how to launch the chapter.',
  days_to_complete: '7',
  resource_links: 'Orientation:https://nationaltutor.org/orientation, Members',
  checkable: true,
  skippable: false,
  active: true,
}

describe('NTHSChecklistService', () => {
  test('parses worksheet tabs and rows into the frontend contract', async () => {
    const checklist = await parseChecklist({
      spreadsheetId: 'spreadsheet-id',
      worksheets: [
        worksheet([{ ...validRow, item_key: 'second-item' }], {
          sheetId: 456,
          index: 1,
          title: 'Second',
        }),
        worksheet([validRow]),
      ],
    })

    expect(checklist).toEqual({
      spreadsheetId: 'spreadsheet-id',
      sections: [
        {
          id: 123,
          title: 'Set up your chapter',
          order: 0,
          items: [
            {
              key: 'complete-orientation',
              order: 1,
              title: 'Complete orientation',
              description: 'Learn how to launch the chapter.',
              daysToComplete: 7,
              resources: [
                {
                  label: 'Orientation',
                  url: 'https://nationaltutor.org/orientation',
                },
                { label: 'Members' },
              ],
              checkable: true,
              skippable: false,
            },
          ],
        },
        expect.objectContaining({ id: 456, order: 1, title: 'Second' }),
      ],
    })
  })

  test('filters inactive rows and tolerates missing optional content', async () => {
    const checklist = await parseChecklist({
      spreadsheetId: 'spreadsheet-id',
      worksheets: [
        worksheet([
          { ...validRow, active: false },
          {
            item_key: 2,
            title: 'Name your chapter',
            checkable: 'false',
            skippable: 'true',
            active: 'true',
          },
        ]),
      ],
    })

    expect(checklist.sections[0].items).toEqual([
      {
        key: '2',
        order: 2,
        title: 'Name your chapter',
        resources: [],
        checkable: false,
        skippable: true,
      },
    ])
  })

  test('rejects duplicate item keys in the same worksheet', async () => {
    await expect(
      parseChecklist({
        spreadsheetId: 'spreadsheet-id',
        worksheets: [worksheet([validRow, validRow])],
      })
    ).rejects.toThrow('duplicate item_key')
  })

  test('rejects duplicate item keys across worksheets', async () => {
    await expect(
      parseChecklist({
        spreadsheetId: 'spreadsheet-id',
        worksheets: [
          worksheet([validRow]),
          worksheet([validRow], { sheetId: 456, index: 1 }),
        ],
      })
    ).rejects.toThrow('duplicate item_key "complete-orientation" across')
  })

  test('allows resource labels while their links are unfinished', () => {
    expect(parseResources('Kickoff guide, Members', 'row')).toEqual([
      { label: 'Kickoff guide' },
      { label: 'Members' },
    ])
  })

  test('keeps valid resources and ignores malformed entries', () => {
    expect(
      parseResources(
        'Orientation:https://nationaltutor.org/orientation, Broken:ftp://example.com, Members',
        'row'
      )
    ).toEqual([
      {
        label: 'Orientation',
        url: 'https://nationaltutor.org/orientation',
      },
      { label: 'Members' },
    ])
  })

  test('caches a valid result and serves it when refresh fails', async () => {
    let now = 0
    const source: jest.MockedFunction<ChecklistSource> = jest
      .fn()
      .mockResolvedValueOnce({
        spreadsheetId: 'spreadsheet-id',
        worksheets: [worksheet([validRow])],
      })
      .mockRejectedValueOnce(new Error('Google unavailable'))
    const cache = new NTHSChecklistCache(source, 100, () => now)

    const first = await cache.get()
    now = 101
    const stale = await cache.get()

    expect(stale).toBe(first)
    expect(source).toHaveBeenCalledTimes(2)
  })

  test('does not cache an invalid initial result', async () => {
    const source = jest.fn().mockResolvedValue({
      spreadsheetId: 'spreadsheet-id',
      worksheets: [worksheet([{ ...validRow, active: 'sometimes' }])],
    })
    const cache = new NTHSChecklistCache(source, 100)

    await expect(cache.get()).rejects.toThrow(NTHSChecklistValidationError)
    await expect(cache.get()).rejects.toThrow(NTHSChecklistValidationError)
    expect(source).toHaveBeenCalledTimes(2)
  })
})
