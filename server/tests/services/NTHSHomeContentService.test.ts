import config from '../../config'
import {
  getNthsHomeContent,
  LINKS_HEADERS,
  parseHomeContent,
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
