import {
  GoogleSpreadsheetRow,
  GoogleSpreadsheetWorksheet,
} from 'google-spreadsheet'
import config from '../config'
import type {
  NTHSChecklist,
  NTHSChecklistItem,
  NTHSChecklistResource,
  NTHSChecklistSection,
} from '../contracts/nths-checklist'
import logger from '../logger'
import {
  ensureHeaders,
  isReadmeWorksheet,
  loadGoogleSpreadsheet,
  SheetCache,
} from '../utils/google-spreadsheet'

const SECTION_INTRO_KEY = 'section-intro'

const REQUIRED_HEADERS = [
  'item_key',
  'title',
  'checkable',
  'skippable',
  'active',
]

type ChecklistRow = {
  item_key?: unknown
  title?: unknown
  description?: unknown
  days_to_complete?: unknown
  resource_links?: unknown
  checkable?: unknown
  skippable?: unknown
  active?: unknown
}

export type ChecklistWorksheet = Pick<
  GoogleSpreadsheetWorksheet,
  'sheetId' | 'title' | 'index' | 'headerValues'
> & {
  getRows(): Promise<Array<Pick<GoogleSpreadsheetRow<ChecklistRow>, 'get'>>>
}

export type ChecklistSource = () => Promise<{
  spreadsheetId: string
  worksheets: ChecklistWorksheet[]
}>

export class NTHSChecklistValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NTHSChecklistValidationError'
  }
}

function asTrimmedString(value: unknown): string | undefined {
  if (value === undefined || value === null) return
  const trimmed = String(value).trim()
  return trimmed || undefined
}

function requireString(
  value: unknown,
  field: string,
  location: string
): string {
  const parsed = asTrimmedString(value)
  if (!parsed)
    throw new NTHSChecklistValidationError(
      `${location} is missing required ${field}`
    )
  return parsed
}

function parseBoolean(
  value: unknown,
  field: string,
  location: string
): boolean {
  if (typeof value === 'boolean') return value
  const normalized = asTrimmedString(value)?.toLowerCase()
  if (normalized === 'true') return true
  if (normalized === 'false') return false
  throw new NTHSChecklistValidationError(
    `${location} has invalid ${field}; expected true or false`
  )
}

function parseDaysToComplete(
  value: unknown,
  location: string
): number | undefined {
  const normalized = asTrimmedString(value)
  if (!normalized || normalized.toLowerCase() === 'x') return
  const days = Number(normalized)
  if (!Number.isInteger(days) || days < 0)
    throw new NTHSChecklistValidationError(
      `${location} has invalid days_to_complete; expected a non-negative integer`
    )
  return days
}

export function parseResources(
  value: unknown,
  location: string
): NTHSChecklistResource[] {
  const normalized = asTrimmedString(value)
  if (!normalized) return []

  return normalized
    .split(/[\n,]/)
    .map((resource) => resource.trim())
    .filter(Boolean)
    .flatMap((resource) => {
      const link =
        resource.match(/^([^:]+):(https?:\/\/.+)$/i) ??
        resource.match(/^([^:]+):(\/(?!\/)[^\s\\]*)$/)
      if (link) {
        // high-line opens a link in a new tab only when it starts with a lowercase "http"
        const url = link[2]
          .trim()
          .replace(/^https?:/i, (scheme) => scheme.toLowerCase())
        return [{ label: link[1].trim(), url }]
      }

      if (resource.includes(':')) {
        logger.warn('Ignoring invalid NTHS checklist resource', {
          location,
          resource,
        })
        return []
      }
      return [{ label: resource }]
    })
}

async function parseWorksheet(
  worksheet: ChecklistWorksheet
): Promise<NTHSChecklistSection> {
  ensureHeaders(
    worksheet,
    REQUIRED_HEADERS,
    (message) => new NTHSChecklistValidationError(message)
  )
  const rows = await worksheet.getRows()
  const itemKeys = new Set<string>()
  const items: NTHSChecklistItem[] = []
  let intro: { timeframe?: string; intro?: string } | undefined

  for (const [rowIndex, row] of rows.entries()) {
    const location = `Worksheet "${worksheet.title}" row ${rowIndex + 2}`
    if (
      asTrimmedString(row.get('item_key'))?.toLowerCase() === SECTION_INTRO_KEY
    ) {
      intro ??= {
        timeframe: asTrimmedString(row.get('title')),
        intro: asTrimmedString(row.get('description')),
      }
      continue
    }
    const active = parseBoolean(row.get('active'), 'active', location)
    if (!active) continue

    const key = requireString(row.get('item_key'), 'item_key', location)
    if (itemKeys.has(key))
      throw new NTHSChecklistValidationError(
        `${location} has duplicate item_key "${key}"`
      )
    itemKeys.add(key)

    const item: NTHSChecklistItem = {
      key,
      order: rowIndex + 1,
      title: requireString(row.get('title'), 'title', location),
      resources: parseResources(row.get('resource_links'), location),
      checkable: parseBoolean(row.get('checkable'), 'checkable', location),
      skippable: parseBoolean(row.get('skippable'), 'skippable', location),
    }
    const description = asTrimmedString(row.get('description'))
    const daysToComplete = parseDaysToComplete(
      row.get('days_to_complete'),
      location
    )
    if (description) item.description = description
    if (daysToComplete !== undefined) item.daysToComplete = daysToComplete
    items.push(item)
  }

  return {
    id: worksheet.sheetId,
    title: worksheet.title,
    order: worksheet.index,
    ...(intro?.intro && { intro: intro.intro }),
    ...(intro?.timeframe && { timeframe: intro.timeframe }),
    items,
  }
}

export async function parseChecklist(source: {
  spreadsheetId: string
  worksheets: ChecklistWorksheet[]
}): Promise<NTHSChecklist> {
  const parsedSections = await Promise.all(
    source.worksheets
      .filter((worksheet) => !isReadmeWorksheet(worksheet))
      .slice()
      .sort((left, right) => left.index - right.index)
      .map(parseWorksheet)
  )
  const sections = parsedSections.filter((section) => section.items.length > 0)
  const itemKeys = new Set<string>()
  for (const section of sections) {
    for (const item of section.items) {
      if (itemKeys.has(item.key))
        throw new NTHSChecklistValidationError(
          `Checklist has duplicate item_key "${item.key}" across worksheets`
        )
      itemKeys.add(item.key)
    }
  }
  return { spreadsheetId: source.spreadsheetId, sections }
}

async function loadGoogleWorksheet(): ReturnType<ChecklistSource> {
  if (
    !config.nthsChecklist.spreadsheetId ||
    !config.nthsChecklist.serviceAccountEmail ||
    !config.nthsChecklist.privateKey
  )
    throw new Error('NTHS checklist Google Sheets configuration is incomplete')

  const document = await loadGoogleSpreadsheet(
    config.nthsChecklist.spreadsheetId,
    config.nthsChecklist.serviceAccountEmail,
    config.nthsChecklist.privateKey
  )
  const worksheets = document.sheetsByIndex.filter(
    (worksheet) => !isReadmeWorksheet(worksheet)
  )
  await Promise.all(worksheets.map((sheet) => sheet.loadHeaderRow()))
  return {
    spreadsheetId: document.spreadsheetId,
    worksheets,
  }
}

export class NTHSChecklistCache extends SheetCache<
  Awaited<ReturnType<ChecklistSource>>,
  NTHSChecklist
> {
  constructor(
    source: ChecklistSource,
    ttlMs: number,
    now: () => number = Date.now
  ) {
    super(source, parseChecklist, ttlMs, now, 'NTHS checklist')
  }
}

const checklistCache = new NTHSChecklistCache(
  loadGoogleWorksheet,
  config.nthsChecklist.cacheTtlMs
)

export function getChecklist(): Promise<NTHSChecklist> {
  return checklistCache.get()
}
