import config from '../../config'
import logger from '../../logger'
import type {
  RenewalSource,
  RenewalWorksheet,
} from '../../services/NTHSRenewalDatesService'
import { parseRenewalDates } from '../../services/NTHSRenewalDatesService'
import { loadGoogleSpreadsheet } from '../../utils/google-spreadsheet'

jest.mock('../../config', () => ({
  __esModule: true,
  default: {
    nthsRenewal: { spreadsheetId: '' },
    nthsChecklist: {
      serviceAccountEmail: '',
      privateKey: '',
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

function worksheet(
  title: string,
  headerValues: string[],
  rows: Cells[]
): RenewalWorksheet {
  return {
    title,
    headerValues,
    getRows: async () =>
      rows.map((values) => ({ get: (k: string) => values[k] })),
  }
}

const STEPS = [
  ['nominations_open', 5, 1],
  ['admin_reminder', 6, 1],
  ['successor_confirmation', 8, 1],
  ['member_stage', 9, 15],
  ['close_date', 9, 30],
] as const

function dateRows(overrides: Record<string, [unknown, unknown]> = {}) {
  return STEPS.map(([step, month, day]) => ({
    step,
    month: overrides[step]?.[0] ?? month,
    day: overrides[step]?.[1] ?? day,
  }))
}

function sheet(dates: Cells[] = dateRows()): RenewalSource {
  return {
    worksheets: [worksheet('Dates', ['step', 'month', 'day'], dates)],
  }
}

const DATES = {
  nominationsOpen: '05-01',
  adminReminder: '06-01',
  successorConfirmation: '08-01',
  memberStage: '09-15',
  closeDate: '09-30',
}

describe('parseRenewalDates', () => {
  it('reads the five dates, accepting numbers typed as text', async () => {
    await expect(parseRenewalDates(sheet())).resolves.toEqual(DATES)
    await expect(
      parseRenewalDates(sheet(dateRows({ nominations_open: [' 5 ', '1'] })))
    ).resolves.toEqual(DATES)
  })

  it('skips rows with a blank step', async () => {
    const [first, ...rest] = dateRows()
    await expect(
      parseRenewalDates(sheet([first, { step: ' ' }, ...rest, {}]))
    ).resolves.toEqual(DATES)
  })

  it.each<[string, RenewalSource, RegExp]>([
    [
      'a missing step',
      sheet(dateRows().slice(1)),
      /Missing step "nominations_open"/,
    ],
    [
      'a duplicate step',
      sheet([...dateRows(), dateRows()[0]]),
      /Duplicate step/,
    ],
    [
      'an unknown step',
      sheet([...dateRows(), { step: 'extra', month: 10, day: 1 }]),
      /Unknown step "extra"/,
    ],
    [
      'a step named after an object key',
      sheet([...dateRows(), { step: 'constructor', month: 10, day: 1 }]),
      /Unknown step "constructor"/,
    ],
    [
      'a fractional month',
      sheet(dateRows({ admin_reminder: [6.5, 1] })),
      /invalid month or day/,
    ],
    [
      'a text month',
      sheet(dateRows({ admin_reminder: ['June', 1] })),
      /invalid month or day/,
    ],
    [
      'a date cell',
      sheet(dateRows({ admin_reminder: ['2027-06-01', 1] })),
      /invalid month or day/,
    ],
    [
      'month 13',
      sheet(dateRows({ close_date: [13, 1] })),
      /invalid month or day/,
    ],
    ['day 0', sheet(dateRows({ nominations_open: [5, 0] })), /not a real date/],
    [
      'day 31 in a 30-day month',
      sheet(dateRows({ admin_reminder: [6, 31] })),
      /not a real date/,
    ],
    [
      'Feb 29',
      sheet(dateRows({ nominations_open: [2, 29] })),
      /not a real date/,
    ],
    [
      'out-of-order dates',
      sheet(dateRows({ admin_reminder: [8, 15] })),
      /strictly increasing/,
    ],
    [
      'two steps on one day',
      sheet(dateRows({ member_stage: [9, 30] })),
      /strictly increasing/,
    ],
    [
      'a dates tab without a day column',
      {
        worksheets: [worksheet('dates', ['step', 'month'], dateRows())],
      },
      /missing required day column/,
    ],
    ['a missing dates tab', { worksheets: [] }, /Missing "dates" worksheet/],
  ])('rejects %s', async (_label, source, reason) => {
    await expect(parseRenewalDates(source)).rejects.toThrow(reason)
  })
})

describe('getNthsChapterRenewalDates', () => {
  const mockedLoad = jest.mocked(loadGoogleSpreadsheet)
  const original = {
    id: config.nthsRenewal.spreadsheetId,
    email: config.nthsChecklist.serviceAccountEmail,
    key: config.nthsChecklist.privateKey,
  }

  // The module keeps a cache, so each test loads a fresh copy.
  function freshReader() {
    let reader: () => Promise<unknown> = async () => undefined
    let freshLogger: typeof logger = logger
    jest.isolateModules(() => {
      reader =
        require('../../services/NTHSRenewalDatesService').getNthsChapterRenewalDates
      freshLogger = require('../../logger').default
    })
    return { reader, freshLogger }
  }

  function serveSheet(source: RenewalSource) {
    mockedLoad.mockResolvedValue({
      sheetsByIndex: source.worksheets.map((w) => ({
        ...w,
        loadHeaderRow: async () => undefined,
      })),
    } as never)
  }

  beforeEach(() => {
    jest.clearAllMocks()
    config.nthsRenewal.spreadsheetId = 'renewal-sheet'
    config.nthsChecklist.serviceAccountEmail = 'bot@example.com'
    config.nthsChecklist.privateKey = 'key'
  })

  afterAll(() => {
    config.nthsRenewal.spreadsheetId = original.id
    config.nthsChecklist.serviceAccountEmail = original.email
    config.nthsChecklist.privateKey = original.key
  })

  it('returns the dates from a valid sheet', async () => {
    serveSheet(sheet())
    await expect(freshReader().reader()).resolves.toEqual(DATES)
    expect(mockedLoad).toHaveBeenCalledWith(
      'renewal-sheet',
      'bot@example.com',
      'key'
    )
  })

  it('is off and logs an error for an invalid sheet with no earlier good copy', async () => {
    serveSheet(sheet(dateRows({ admin_reminder: [8, 15] })))
    const { reader, freshLogger } = freshReader()
    await expect(reader()).resolves.toBeNull()
    expect(freshLogger.error).toHaveBeenCalledTimes(1)
  })

  it('is off when the sheet read stalls', async () => {
    jest.useFakeTimers()
    try {
      mockedLoad.mockReturnValue(new Promise(() => undefined))
      const { reader, freshLogger } = freshReader()
      const result = reader()
      await jest.advanceTimersByTimeAsync(5000)
      await expect(result).resolves.toBeNull()
      expect(freshLogger.error).toHaveBeenCalledTimes(1)
    } finally {
      jest.useRealTimers()
    }
  })

  it('reads a broken sheet once per cache interval, not on every call', async () => {
    serveSheet(sheet(dateRows({ admin_reminder: [8, 15] })))
    const { reader, freshLogger } = freshReader()
    await reader()
    await reader()
    expect(mockedLoad).toHaveBeenCalledTimes(1)
    expect(freshLogger.error).toHaveBeenCalledTimes(1)
  })

  it.each([
    ['spreadsheet id', () => (config.nthsRenewal.spreadsheetId = '')],
    [
      'service account email',
      () => (config.nthsChecklist.serviceAccountEmail = ''),
    ],
    ['private key', () => (config.nthsChecklist.privateKey = '')],
  ])(
    'is off without a Google call or an error when the %s is unset',
    async (_label, unset) => {
      unset()
      const { reader, freshLogger } = freshReader()
      await expect(reader()).resolves.toBeNull()
      expect(mockedLoad).not.toHaveBeenCalled()
      expect(freshLogger.error).not.toHaveBeenCalled()
    }
  )
})
