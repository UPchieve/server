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

  test('omits sections with no active items', async () => {
    const checklist = await parseChecklist({
      spreadsheetId: 'spreadsheet-id',
      worksheets: [
        worksheet([{ ...validRow, active: false }], {
          sheetId: 456,
          title: 'Draft section',
          index: 0,
        }),
        worksheet([validRow], { index: 1 }),
      ],
    })

    expect(checklist.sections).toEqual([
      expect.objectContaining({
        id: 123,
        title: 'Set up your chapter',
        order: 1,
      }),
    ])
  })

  test('ignores the README worksheet without validating or reading it', async () => {
    const readReadmeRows = jest.fn()
    const checklist = await parseChecklist({
      spreadsheetId: 'spreadsheet-id',
      worksheets: [
        worksheet([], {
          sheetId: 456,
          title: '  ReAdMe ',
          index: 0,
          headerValues: [],
          getRows: readReadmeRows,
        }),
        worksheet([validRow], { index: 1 }),
      ],
    })

    expect(checklist.sections).toEqual([
      expect.objectContaining({
        id: 123,
        title: 'Set up your chapter',
        order: 1,
      }),
    ])
    expect(readReadmeRows).not.toHaveBeenCalled()
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

  describe('section-intro row', () => {
    const introRow = (overrides: Record<string, unknown> = {}) => ({
      item_key: ' section-intro ',
      title: ' Weeks 1-3 ',
      description: ' Get the chapter running. ',
      ...overrides,
    })

    test('becomes timeframe and intro without ever being an item', async () => {
      const checklist = await parseChecklist({
        spreadsheetId: 'spreadsheet-id',
        worksheets: [
          worksheet([introRow(), validRow]),
          worksheet(
            [
              introRow({ title: 'All year', description: ' ' }),
              { ...validRow, item_key: 'other' },
            ],
            { sheetId: 456, index: 1 }
          ),
          worksheet([{ ...validRow, item_key: 'no-intro' }], {
            sheetId: 789,
            index: 2,
          }),
        ],
      })

      expect(checklist.sections.map((s) => s.items.map((i) => i.key))).toEqual([
        ['complete-orientation'],
        ['other'],
        ['no-intro'],
      ])
      expect(checklist.sections[0]).toMatchObject({
        timeframe: 'Weeks 1-3',
        intro: 'Get the chapter running.',
      })
      expect(checklist.sections[1].timeframe).toBe('All year')
      expect(checklist.sections[1].intro).toBeUndefined()
      expect(checklist.sections[2].timeframe).toBeUndefined()
      expect(checklist.sections[2].intro).toBeUndefined()
    })

    test('first row in a tab wins and none count as duplicate keys', async () => {
      const checklist = await parseChecklist({
        spreadsheetId: 'spreadsheet-id',
        worksheets: [
          worksheet([
            introRow(),
            introRow({ title: 'Later', description: 'Later intro' }),
            validRow,
          ]),
          worksheet([introRow(), { ...validRow, item_key: 'other' }], {
            sheetId: 456,
            index: 1,
          }),
        ],
      })

      expect(checklist.sections[0]).toMatchObject({
        timeframe: 'Weeks 1-3',
        intro: 'Get the chapter running.',
      })
      expect(checklist.sections).toHaveLength(2)
    })

    test.each([
      { item_key: 'SECTION-INTRO', active: 'false' },
      {
        item_key: 'Section-intro',
        active: '',
        checkable: '',
        skippable: undefined,
      },
    ])('matches %j whatever its case or other columns', async (overrides) => {
      const checklist = await parseChecklist({
        spreadsheetId: 'spreadsheet-id',
        worksheets: [worksheet([introRow(overrides), validRow])],
      })

      expect(checklist.sections[0]).toMatchObject({
        timeframe: 'Weeks 1-3',
        intro: 'Get the chapter running.',
      })
      expect(checklist.sections[0].items).toHaveLength(1)
    })

    test('drops a tab holding only the intro row', async () => {
      const checklist = await parseChecklist({
        spreadsheetId: 'spreadsheet-id',
        worksheets: [worksheet([introRow()])],
      })

      expect(checklist.sections).toEqual([])
    })
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
        'Orientation:https://nationaltutor.org/orientation, Broken:ftp://example.com, Manage:/groups/manage, Offsite://example.com, Slash:/\\evil.com, Spaced:/a b, Upper:HTTPS://example.com/Form, Members',
        'row'
      )
    ).toEqual([
      {
        label: 'Orientation',
        url: 'https://nationaltutor.org/orientation',
      },
      { label: 'Manage', url: '/groups/manage' },
      { label: 'Upper', url: 'https://example.com/Form' },
      { label: 'Members' },
    ])
  })

  test('caches a valid result and serves it for a full TTL when refresh fails', async () => {
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
    now = 200
    const stillStale = await cache.get()

    expect(stale).toBe(first)
    expect(stillStale).toBe(first)
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
