import type {
  GoogleSpreadsheetRow,
  GoogleSpreadsheetWorksheet,
} from 'google-spreadsheet'
import config from '../config'
import logger from '../logger'
import {
  ensureHeaders,
  isWorksheetTitled,
  loadGoogleSpreadsheet,
  SheetCache,
} from '../utils/google-spreadsheet'
import { timeLimit } from '../utils/time-limit'

export type NTHSRenewalDates = {
  nominationsOpen: string
  adminReminder: string
  successorConfirmation: string
  memberStage: string
  closeDate: string
}

const DATES_WORKSHEET_TITLE = 'dates'
const READ_TIMEOUT_MS = 5000

const STEP_KEYS = {
  nominations_open: 'nominationsOpen',
  admin_reminder: 'adminReminder',
  successor_confirmation: 'successorConfirmation',
  member_stage: 'memberStage',
  close_date: 'closeDate',
} as const satisfies Record<string, keyof NTHSRenewalDates>

// February has 28 days so that Feb 29 is rejected: the dates carry no year.
const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

export type RenewalWorksheet = Pick<
  GoogleSpreadsheetWorksheet,
  'title' | 'headerValues'
> & {
  getRows(): Promise<
    Array<Pick<GoogleSpreadsheetRow<Record<string, unknown>>, 'get'>>
  >
}

export type RenewalSource = { worksheets: RenewalWorksheet[] }

export class NTHSRenewalDatesValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NTHSRenewalDatesValidationError'
  }
}

function toValidationError(message: string) {
  return new NTHSRenewalDatesValidationError(message)
}

function invalid(message: string): never {
  throw new NTHSRenewalDatesValidationError(message)
}

function findWorksheet(
  worksheets: RenewalWorksheet[],
  title: string
): RenewalWorksheet {
  const worksheet = worksheets.find((candidate) =>
    isWorksheetTitled(candidate, title)
  )
  if (!worksheet) {
    invalid(`Missing "${title}" worksheet`)
  }
  return worksheet
}

function parseWholeNumber(value: unknown): number | undefined {
  if (typeof value === 'number')
    return Number.isInteger(value) ? value : undefined
  if (typeof value !== 'string' || !/^\d+$/.test(value.trim())) return
  return Number(value.trim())
}

function toMonthDay(step: string, month: unknown, day: unknown): string {
  const m = parseWholeNumber(month)
  const d = parseWholeNumber(day)
  if (m === undefined || d === undefined || m < 1 || m > 12)
    return invalid(`Step "${step}" has an invalid month or day`)
  if (d < 1 || d > DAYS_IN_MONTH[m - 1])
    return invalid(`Step "${step}" is not a real date`)
  return `${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

async function parseDates(worksheet: RenewalWorksheet) {
  ensureHeaders(worksheet, ['step', 'month', 'day'], toValidationError)
  const found = new Map<string, string>()
  for (const row of await worksheet.getRows()) {
    const step = String(row.get('step') ?? '').trim()
    if (!step) {
      continue
    }
    if (!Object.hasOwn(STEP_KEYS, step)) {
      invalid(`Unknown step "${step}"`)
    }
    if (found.has(step)) {
      invalid(`Duplicate step "${step}"`)
    }
    found.set(step, toMonthDay(step, row.get('month'), row.get('day')))
  }
  const dates = {} as NTHSRenewalDates
  let previous = ''
  for (const [step, key] of Object.entries(STEP_KEYS)) {
    const date = found.get(step)
    if (!date) {
      invalid(`Missing step "${step}"`)
    }
    if (date <= previous) {
      invalid('Renewal steps must be in strictly increasing order')
    }
    dates[key] = date
    previous = date
  }
  return dates
}

export async function parseRenewalDates(
  source: RenewalSource
): Promise<NTHSRenewalDates> {
  return parseDates(findWorksheet(source.worksheets, DATES_WORKSHEET_TITLE))
}

async function loadRenewalSheet(): Promise<RenewalSource> {
  const document = await loadGoogleSpreadsheet(
    config.nthsRenewal.spreadsheetId,
    config.nthsChecklist.serviceAccountEmail,
    config.nthsChecklist.privateKey
  )
  const worksheets = document.sheetsByIndex.filter((worksheet) =>
    isWorksheetTitled(worksheet, DATES_WORKSHEET_TITLE)
  )
  await Promise.all(worksheets.map((sheet) => sheet.loadHeaderRow()))
  return { worksheets }
}

const renewalDatesCache = new SheetCache(
  loadRenewalSheet,
  parseRenewalDates,
  config.nthsChecklist.cacheTtlMs,
  Date.now,
  'NTHS renewal dates'
)

let lastFailureAt: number | undefined

export async function getNthsChapterRenewalDates(): Promise<NTHSRenewalDates | null> {
  if (
    !config.nthsRenewal.spreadsheetId ||
    !config.nthsChecklist.serviceAccountEmail ||
    !config.nthsChecklist.privateKey
  )
    return null
  // A failed read with no good copy is not cached by SheetCache; wait out the
  // TTL so a broken sheet costs one Google read and one error per interval.
  if (
    lastFailureAt !== undefined &&
    Date.now() - lastFailureAt < config.nthsChecklist.cacheTtlMs
  )
    return null
  // The Google client sets no request timeout, so a stalled read would
  // otherwise hold GET /nths-groups open.
  const dates: NTHSRenewalDates | null = await timeLimit({
    promise: renewalDatesCache.get().catch((error) => {
      logger.error(
        'Could not read NTHS renewal dates; treating renewal as off',
        { err: error }
      )
      return null
    }),
    fallbackReturnValue: null,
    timeLimitReachedErrorMessage:
      'Timed out reading NTHS renewal dates; treating renewal as off',
    waitInMs: READ_TIMEOUT_MS,
  })
  lastFailureAt = dates ? undefined : Date.now()
  return dates
}
