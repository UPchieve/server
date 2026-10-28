import { JWT } from 'google-auth-library'
import { GoogleSpreadsheet } from 'google-spreadsheet'
import logger from '../logger'

const GOOGLE_SHEETS_READONLY_SCOPE =
  'https://www.googleapis.com/auth/spreadsheets.readonly'

export async function loadGoogleSpreadsheet(
  spreadsheetId: string,
  serviceAccountEmail: string,
  privateKey: string
): Promise<GoogleSpreadsheet> {
  // Keep google-auth-library on v9 while using google-spreadsheet v4. The v10
  // client returns native Headers, which google-spreadsheet v4 does not copy
  // into its requests. Upgrade these dependencies together.
  const auth = new JWT({
    email: serviceAccountEmail,
    key: privateKey.replace(/\\n/g, '\n'),
    scopes: [GOOGLE_SHEETS_READONLY_SCOPE],
  })
  const document = new GoogleSpreadsheet(spreadsheetId, auth)
  await document.loadInfo()
  return document
}

const README_WORKSHEET_TITLE = 'readme'

export function isWorksheetTitled(
  worksheet: { title: string },
  title: string
): boolean {
  return worksheet.title.trim().toLowerCase() === title
}

export function isReadmeWorksheet(worksheet: { title: string }): boolean {
  return isWorksheetTitled(worksheet, README_WORKSHEET_TITLE)
}

export function ensureHeaders(
  worksheet: { title: string; headerValues: string[] },
  required: readonly string[],
  makeError: (message: string) => Error
): void {
  const headers = new Set(worksheet.headerValues.map((header) => header.trim()))
  for (const header of required) {
    if (!headers.has(header)) {
      throw makeError(
        `Worksheet "${worksheet.title}" is missing required ${header} column`
      )
    }
  }
}

export class SheetCache<Source, Value> {
  private cached?: { value: Value; loadedAt: number }
  private pending?: Promise<Value>

  constructor(
    private readonly load: () => Promise<Source>,
    private readonly parse: (source: Source) => Promise<Value>,
    private readonly ttlMs: number,
    private readonly now: () => number,
    private readonly label: string
  ) {}

  async get(): Promise<Value> {
    if (this.cached && this.now() - this.cached.loadedAt < this.ttlMs)
      return this.cached.value
    if (this.pending) return this.pending

    this.pending = this.refresh()
    try {
      return await this.pending
    } finally {
      this.pending = undefined
    }
  }

  private async refresh(): Promise<Value> {
    try {
      const value = await this.parse(await this.load())
      this.cached = { value, loadedAt: this.now() }
      return value
    } catch (error) {
      if (!this.cached) {
        throw error
      }
      logger.warn(
        `Failed to refresh ${this.label}; serving last valid version`,
        { err: error }
      )
      this.cached.loadedAt = this.now()
      return this.cached.value
    }
  }
}
