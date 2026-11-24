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

export type NTHSHomeLink = {
  title: string
  body: string
  link: string
  forMembers: boolean
}

export type NTHSHomeContent = { tips: string[]; links: NTHSHomeLink[] }

const TIPS_WORKSHEET_TITLE = 'tips'
const LINKS_WORKSHEET_TITLE = 'links'
const READ_TIMEOUT_MS = 5000
export const TIPS_HEADERS = ['tip', 'live']
export const LINKS_HEADERS = ['title', 'body', 'link', 'members', 'live']

type HomeWorksheet = Pick<
  GoogleSpreadsheetWorksheet,
  'title' | 'headerValues'
> & {
  getRows(): Promise<
    Array<Pick<GoogleSpreadsheetRow<Record<string, unknown>>, 'get'>>
  >
}

export type HomeSource = { worksheets: HomeWorksheet[] }

function findWorksheet(
  worksheets: HomeWorksheet[],
  title: string
): HomeWorksheet {
  const worksheet = worksheets.find((candidate) =>
    isWorksheetTitled(candidate, title)
  )
  if (!worksheet) {
    throw new Error(`Missing "${title}" worksheet`)
  }
  return worksheet
}

function cell(row: { get(key: string): unknown }, key: string): string {
  return String(row.get(key) ?? '').trim()
}

function isChecked(row: { get(key: string): unknown }, key: string): boolean {
  return cell(row, key).toLowerCase() === 'true'
}

function isShownLink(link: string): boolean {
  return (
    (link.startsWith('https://') && link.length > 'https://'.length) ||
    (link.startsWith('/') && !link.startsWith('//') && !/[\\\t\n\r]/.test(link))
  )
}

export async function parseHomeContent(
  source: HomeSource
): Promise<NTHSHomeContent> {
  const tipsSheet = findWorksheet(source.worksheets, TIPS_WORKSHEET_TITLE)
  const linksSheet = findWorksheet(source.worksheets, LINKS_WORKSHEET_TITLE)
  ensureHeaders(tipsSheet, TIPS_HEADERS, (message) => new Error(message))
  ensureHeaders(linksSheet, LINKS_HEADERS, (message) => new Error(message))

  const tips = (await tipsSheet.getRows())
    .filter((row) => isChecked(row, 'live'))
    .map((row) => cell(row, 'tip'))
    .filter(Boolean)
  const links = (await linksSheet.getRows()).flatMap((row) => {
    const title = cell(row, 'title')
    const link = cell(row, 'link')
    if (!isChecked(row, 'live') || !title || !isShownLink(link)) return []
    return [
      {
        title,
        body: cell(row, 'body'),
        link,
        forMembers: isChecked(row, 'members'),
      },
    ]
  })
  return { tips, links }
}

async function loadHomeSheet(): Promise<HomeSource> {
  const document = await loadGoogleSpreadsheet(
    config.nthsRenewal.spreadsheetId,
    config.nthsChecklist.serviceAccountEmail,
    config.nthsChecklist.privateKey
  )
  const worksheets = document.sheetsByIndex.filter(
    (worksheet) =>
      isWorksheetTitled(worksheet, TIPS_WORKSHEET_TITLE) ||
      isWorksheetTitled(worksheet, LINKS_WORKSHEET_TITLE)
  )
  await Promise.all(worksheets.map((sheet) => sheet.loadHeaderRow()))
  return { worksheets }
}

const homeContentCache = new SheetCache(
  loadHomeSheet,
  parseHomeContent,
  config.nthsChecklist.cacheTtlMs,
  Date.now,
  'NTHS home content'
)

let lastFailureAt: number | undefined

export async function getNthsHomeContent(
  isAdmin: boolean
): Promise<NTHSHomeContent> {
  const empty: NTHSHomeContent = { tips: [], links: [] }
  if (
    !config.nthsRenewal.spreadsheetId ||
    !config.nthsChecklist.serviceAccountEmail ||
    !config.nthsChecklist.privateKey
  )
    return empty
  // A failed read with no good copy is not cached by SheetCache; wait out the
  // TTL so a broken sheet costs one Google read and one error per interval.
  if (
    lastFailureAt !== undefined &&
    Date.now() - lastFailureAt < config.nthsChecklist.cacheTtlMs
  )
    return empty
  // The Google client sets no request timeout, so a stalled read would
  // otherwise hold the route open.
  const content: NTHSHomeContent | null = await timeLimit({
    promise: homeContentCache.get().catch((error: unknown) => {
      logger.error('Could not read NTHS home content; showing none', {
        err: error,
      })
      return null
    }),
    fallbackReturnValue: null,
    timeLimitReachedErrorMessage:
      'Timed out reading NTHS home content; showing none',
    waitInMs: READ_TIMEOUT_MS,
  })
  lastFailureAt = content ? undefined : Date.now()
  if (!content) return empty
  if (isAdmin) return content
  return { tips: [], links: content.links.filter((l) => l.forMembers) }
}
