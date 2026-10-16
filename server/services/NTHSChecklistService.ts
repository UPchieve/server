import { JWT } from 'google-auth-library'
import {
  GoogleSpreadsheet,
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

const GOOGLE_SHEETS_READONLY_SCOPE =
  'https://www.googleapis.com/auth/spreadsheets.readonly'

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
      const externalLink = resource.match(/^([^:]+):(https?:\/\/.+)$/i)
      if (externalLink)
        return [{ label: externalLink[1].trim(), url: externalLink[2].trim() }]

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

function assertHeaders(worksheet: ChecklistWorksheet): void {
  const headers = new Set(worksheet.headerValues.map((header) => header.trim()))
  for (const header of REQUIRED_HEADERS) {
    if (!headers.has(header))
      throw new NTHSChecklistValidationError(
        `Worksheet "${worksheet.title}" is missing required ${header} column`
      )
  }
}

async function parseWorksheet(
  worksheet: ChecklistWorksheet
): Promise<NTHSChecklistSection> {
  assertHeaders(worksheet)
  const rows = await worksheet.getRows()
  const itemKeys = new Set<string>()
  const items: NTHSChecklistItem[] = []

  for (const [rowIndex, row] of rows.entries()) {
    const location = `Worksheet "${worksheet.title}" row ${rowIndex + 2}`
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
    items,
  }
}

export async function parseChecklist(source: {
  spreadsheetId: string
  worksheets: ChecklistWorksheet[]
}): Promise<NTHSChecklist> {
  const sections = await Promise.all(
    source.worksheets
      .slice()
      .sort((left, right) => left.index - right.index)
      .map(parseWorksheet)
  )
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

  // Keep google-auth-library on v9 while using google-spreadsheet v4. The v10
  // client returns native Headers, which google-spreadsheet v4 does not copy
  // into its requests. Upgrade these dependencies together.
  const auth = new JWT({
    email: config.nthsChecklist.serviceAccountEmail,
    key: config.nthsChecklist.privateKey.replace(/\\n/g, '\n'),
    scopes: [GOOGLE_SHEETS_READONLY_SCOPE],
  })
  const document = new GoogleSpreadsheet(
    config.nthsChecklist.spreadsheetId,
    auth
  )
  await document.loadInfo()
  await Promise.all(
    document.sheetsByIndex.map((sheet) => sheet.loadHeaderRow())
  )
  return {
    spreadsheetId: document.spreadsheetId,
    worksheets: document.sheetsByIndex,
  }
}

export class NTHSChecklistCache {
  private cached?: { checklist: NTHSChecklist; loadedAt: number }
  private pending?: Promise<NTHSChecklist>

  constructor(
    private readonly source: ChecklistSource,
    private readonly ttlMs: number,
    private readonly now: () => number = Date.now
  ) {}

  async get(): Promise<NTHSChecklist> {
    if (this.cached && this.now() - this.cached.loadedAt < this.ttlMs)
      return this.cached.checklist
    if (this.pending) return this.pending

    this.pending = this.refresh()
    try {
      return await this.pending
    } finally {
      this.pending = undefined
    }
  }

  private async refresh(): Promise<NTHSChecklist> {
    try {
      const checklist = await parseChecklist(await this.source())
      this.cached = { checklist, loadedAt: this.now() }
      return checklist
    } catch (error) {
      if (!this.cached) throw error
      logger.warn(
        'Failed to refresh NTHS checklist; serving last valid version',
        { error }
      )
      return this.cached.checklist
    }
  }
}

const checklistCache = new NTHSChecklistCache(
  loadGoogleWorksheet,
  config.nthsChecklist.cacheTtlMs
)

export function getChecklist(): Promise<NTHSChecklist> {
  return checklistCache.get()
}
