import config from '../../config'
import {
  getNthsHomeContent,
  getNthsResources,
  LINKS_HEADERS,
  parseHomeContent,
  RESOURCE_GROUPS_HEADERS,
  RESOURCES_HEADERS,
  TIPS_HEADERS,
  type HomeSource,
} from '../../services/NTHSHomeContentService'
import { loadGoogleSpreadsheet } from '../../utils/google-spreadsheet'

jest.mock('../../config', () => ({
  __esModule: true,
  default: {
    nthsRenewal: { spreadsheetId: 'sheet' },
    nthsChecklist: {
      serviceAccountEmail: 'bot@example.com',
      privateKey: 'key',
      cacheTtlMs: 300000,
    },
  },
}))
jest.mock('../../logger')
jest.mock('../../utils/google-spreadsheet', () => ({
  ...jest.requireActual('../../utils/google-spreadsheet'),
  loadGoogleSpreadsheet: jest.fn(),
}))

type Cells = Record<string, unknown>

function worksheet(title: string, headerValues: string[], rows: Cells[]) {
  return {
    title,
    headerValues,
    loadHeaderRow: async () => undefined,
    getRows: async () =>
      rows.map((values) => ({ get: (k: string) => values[k] })),
  }
}

const link = (overrides: Cells = {}): Cells => ({
  title: 'Library',
  body: 'Read',
  link: 'https://example.org/a',
  members: 'FALSE',
  live: 'TRUE',
  ...overrides,
})
const tipsTab = worksheet('Tips', TIPS_HEADERS, [{ tip: 'one', live: 'TRUE' }])
const linksTab = (rows: Cells[]) => worksheet('links', LINKS_HEADERS, rows)

const card = (overrides: Cells = {}): Cells => ({
  group: 'Start',
  title: 'Guide',
  body: 'Read',
  link: 'https://example.org/g',
  icon: ' Book ',
  members: 'TRUE',
  live: 'TRUE',
  ...overrides,
})
const groupRow = (group: string, overrides: Cells = {}): Cells => ({
  group,
  subtitle: `${group} sub`,
  icon: 'Star',
  ...overrides,
})
const groupsTab = (rows: Cells[]) =>
  worksheet('resource_groups', RESOURCE_GROUPS_HEADERS, rows)
const cardsTab = (rows: Cells[]) =>
  worksheet('resources', RESOURCES_HEADERS, rows)

describe('parseHomeContent', () => {
  it('keeps live, non-blank tips in sheet order, trimmed', async () => {
    const tips = worksheet('tips', TIPS_HEADERS, [
      { tip: ' one ', live: 'TRUE' },
      { tip: '', live: 'TRUE' },
      { tip: 'draft', live: 'FALSE' },
      { tip: 'cleared', live: '' },
      { tip: 'two', live: 'true' },
    ])
    const content = await parseHomeContent({
      worksheets: [tips, linksTab([])],
    })
    expect(content.tips).toEqual(['one', 'two'])
  })

  it.each([
    ['https link', link(), [false]],
    ['app path', link({ link: ' /groups/resources ' }), [false]],
    ['bare https scheme', link({ link: 'https://' }), []],
    ['http link', link({ link: 'http://example.org' }), []],
    ['backslash path', link({ link: '/\\example.org' }), []],
    ['newline path', link({ link: '/\n/example.org' }), []],
    ['protocol-relative link', link({ link: '//example.org' }), []],
    ['blank title', link({ title: ' ' }), []],
    ['blank body', link({ body: ' ' }), [false]],
    ['live unchecked', link({ live: 'FALSE' }), []],
    ['live cleared', link({ live: '' }), []],
    ['live lowercase', link({ live: 'true' }), [false]],
    ['members checked', link({ members: 'TRUE' }), [true]],
    ['members cleared', link({ members: '' }), [false]],
  ])('links: %s', async (_label, row, forMembers) => {
    const content = await parseHomeContent({
      worksheets: [tipsTab, linksTab([row])],
    })
    expect(content.links.map((l) => l.forMembers)).toEqual(forMembers)
  })

  it.each([
    ['a missing tips tab', [linksTab([link()])]],
    ['a missing links tab', [tipsTab]],
  ])('%s fails the whole read', async (_label, worksheets) => {
    await expect(parseHomeContent({ worksheets })).rejects.toThrow()
  })

  it.each([
    ...TIPS_HEADERS.map((header) => ['tips', header]),
    ...LINKS_HEADERS.map((header) => ['links', header]),
  ])('a %s tab without %s fails the whole read', async (tab, header) => {
    const without = (headers: string[]) => headers.filter((h) => h !== header)
    const worksheets =
      tab === 'tips'
        ? [worksheet('tips', without(TIPS_HEADERS), []), linksTab([link()])]
        : [tipsTab, worksheet('links', without(LINKS_HEADERS), [link()])]
    await expect(parseHomeContent({ worksheets })).rejects.toThrow()
  })
})

describe('getNthsResources', () => {
  const mockedLoad = jest.mocked(loadGoogleSpreadsheet)
  const groups = [groupRow('Start'), groupRow('Extra'), groupRow('Empty')]

  async function read(
    isAdmin: boolean,
    cards: Cells[],
    worksheets = [groupsTab(groups), cardsTab(cards)]
  ) {
    mockedLoad.mockResolvedValue({
      sheetsByIndex: [tipsTab, linksTab([link()]), ...worksheets],
    } as never)
    let reader: typeof getNthsResources = getNthsResources
    jest.isolateModules(() => {
      reader = require('../../services/NTHSHomeContentService').getNthsResources
    })
    return (await reader(isAdmin)).groups
  }
  const titles = (result: Awaited<ReturnType<typeof read>>) =>
    result.map((g) => [g.title, g.cards.map((c) => c.title)])

  it.each([
    ['admin sees members-unchecked cards', true, card({ members: '' }), 1],
    ['member loses members-unchecked cards', false, card({ members: '' }), 0],
    ['member keeps members-checked cards', false, card(), 1],
    ['live unchecked is skipped', true, card({ live: 'FALSE' }), 0],
    ['blank title is skipped', true, card({ title: ' ' }), 0],
    ['blank link is skipped', true, card({ link: '' }), 0],
    ['invalid link is skipped', true, card({ link: '//example.org' }), 0],
    ['orphan group is skipped', true, card({ group: 'Nope' }), 0],
  ])('%s', async (_label, isAdmin, row, shown) => {
    expect(await read(isAdmin, [row])).toHaveLength(shown)
  })

  const mixedCards = [
    card({ group: 'Extra', title: 'X1' }),
    card({ title: 'S2' }),
    card({ title: 'S1' }),
  ]

  it('keeps sheet order and drops groups without visible cards', async () => {
    expect(titles(await read(true, mixedCards))).toEqual([
      ['Start', ['S2', 'S1']],
      ['Extra', ['X1']],
    ])
  })

  it('maps group subtitle and lowercased icons, and omits forMembers', async () => {
    const result = await read(true, [card()])
    expect(result[0]).toEqual({
      title: 'Start',
      subtitle: 'Start sub',
      icon: 'star',
      cards: [
        {
          title: 'Guide',
          body: 'Read',
          link: 'https://example.org/g',
          icon: 'book',
        },
      ],
    })
  })

  it('matches a card to its group ignoring case and spaces', async () => {
    expect(titles(await read(true, [card({ group: '  START ' })]))).toEqual([
      ['Start', ['Guide']],
    ])
  })

  it('ignores a group row with a blank name', async () => {
    const result = await read(
      true,
      [],
      [groupsTab([groupRow(' ')]), cardsTab([card({ group: '' })])]
    )
    expect(result).toEqual([])
  })

  it('uses the first of two groups with the same name', async () => {
    const result = await read(
      true,
      [],
      [
        groupsTab([
          groupRow('Start'),
          groupRow('start', { subtitle: 'Second' }),
        ]),
        cardsTab([card()]),
      ]
    )
    expect(result.map((g) => g.subtitle)).toEqual(['Start sub'])
  })
})

describe('getNthsHomeContent', () => {
  const mockedLoad = jest.mocked(loadGoogleSpreadsheet)
  const sheetsFor = (worksheets: HomeSource['worksheets']) =>
    ({ sheetsByIndex: worksheets }) as never

  beforeEach(() => {
    jest.clearAllMocks()
    config.nthsRenewal.spreadsheetId = 'sheet'
  })

  it('gives an admin every tip and link, a member only member links', async () => {
    mockedLoad.mockResolvedValue(
      sheetsFor([
        tipsTab,
        linksTab([link({ members: 'TRUE' }), link({ title: 'Staff' })]),
      ])
    )
    const admin = await getNthsHomeContent(true)
    expect(admin.tips).toEqual(['one'])
    expect(admin.links.map((l) => l.title)).toEqual(['Library', 'Staff'])
    const member = await getNthsHomeContent(false)
    expect(member.tips).toEqual([])
    expect(member.links.map((l) => l.title)).toEqual(['Library'])
  })

  it.each([
    [
      'an https address',
      'https://example.org/admin',
      'https://example.org/admin',
    ],
    ['an app page', '/groups/manage', '/groups/manage'],
    ['blank', '', 'https://example.org/a'],
    [
      'not an allowed address',
      'http://example.org/admin',
      'https://example.org/a',
    ],
  ])(
    'sends an admin to the admin link when it is %s, and a member to the link',
    async (_label, adminLink, adminHref) => {
      mockedLoad.mockResolvedValue(
        sheetsFor([
          tipsTab,
          worksheet(
            'links',
            ['title', 'body', 'link', 'members', 'live'],
            [link({ members: 'TRUE', admin_link: adminLink })]
          ),
        ])
      )
      let reader: typeof getNthsHomeContent = getNthsHomeContent
      jest.isolateModules(() => {
        reader =
          require('../../services/NTHSHomeContentService').getNthsHomeContent
      })
      const row = {
        title: 'Library',
        body: 'Read',
        link: 'https://example.org/a',
        forMembers: true,
      }
      expect((await reader(true)).links).toEqual([{ ...row, link: adminHref }])
      expect((await reader(false)).links).toEqual([row])
    }
  )

  const blankTab = (title: string) => ({
    ...worksheet(title, [], []),
    get headerValues(): string[] {
      throw new Error('Header values are not yet loaded')
    },
    getRows: async () => {
      throw new Error('No values in the header row')
    },
  })
  const withoutColumn = (tab: ReturnType<typeof worksheet>, column: string) =>
    ({
      ...tab,
      headerValues: tab.headerValues.filter((header) => header !== column),
    }) as ReturnType<typeof worksheet>

  it.each([
    [
      'a blank resources tab',
      blankTab('resources'),
      groupsTab([groupRow('A')]),
    ],
    [
      'a blank resource_groups tab',
      cardsTab([card()]),
      blankTab('resource_groups'),
    ],
    [
      'a resources tab missing a column',
      withoutColumn(cardsTab([card()]), 'link'),
      groupsTab([groupRow('Start')]),
    ],
    [
      'a resource_groups tab missing a column',
      cardsTab([card()]),
      withoutColumn(groupsTab([groupRow('Start')]), 'subtitle'),
    ],
  ])('keeps tips and links with %s', async (_label, first, second) => {
    mockedLoad.mockResolvedValue(
      sheetsFor([tipsTab, linksTab([link()]), first, second])
    )
    let service: typeof import('../../services/NTHSHomeContentService') =
      jest.requireActual('../../services/NTHSHomeContentService')
    jest.isolateModules(() => {
      service = require('../../services/NTHSHomeContentService')
    })
    const home = await service.getNthsHomeContent(true)
    expect(home.tips).toEqual(['one'])
    expect(home.links).toHaveLength(1)
    expect(await service.getNthsResources(true)).toEqual({ groups: [] })
  })

  it('returns empty lists when the read fails', async () => {
    mockedLoad.mockRejectedValue(new Error('quota'))
    let reader: typeof getNthsHomeContent = getNthsHomeContent
    jest.isolateModules(() => {
      reader =
        require('../../services/NTHSHomeContentService').getNthsHomeContent
    })
    await expect(reader(true)).resolves.toEqual({ tips: [], links: [] })
  })

  it('skips the sheet until the TTL passes after a failed read', async () => {
    mockedLoad.mockRejectedValue(new Error('quota'))
    let reader: typeof getNthsHomeContent = getNthsHomeContent
    jest.isolateModules(() => {
      reader =
        require('../../services/NTHSHomeContentService').getNthsHomeContent
    })
    const now = jest.spyOn(Date, 'now')
    const start = 1_000_000
    try {
      now.mockReturnValue(start)
      await reader(true)
      expect(mockedLoad).toHaveBeenCalledTimes(1)

      now.mockReturnValue(start + config.nthsChecklist.cacheTtlMs - 1)
      await expect(reader(true)).resolves.toEqual({ tips: [], links: [] })
      expect(mockedLoad).toHaveBeenCalledTimes(1)

      now.mockReturnValue(start + config.nthsChecklist.cacheTtlMs)
      await reader(true)
      expect(mockedLoad).toHaveBeenCalledTimes(2)
    } finally {
      now.mockRestore()
    }
  })
})
