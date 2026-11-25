import type {
  GoogleSpreadsheetRow,
  GoogleSpreadsheetWorksheet,
} from 'google-spreadsheet'
import type {
  NTHSHomeContent,
  NTHSHomeLink,
  NTHSResourceCard,
  NTHSResourceGroup,
  NTHSResources,
} from '@upchieve/api-contracts/nths-groups'
import config from '../config'
import logger from '../logger'
import {
  ensureHeaders,
  isWorksheetTitled,
  loadGoogleSpreadsheet,
  readSheetWithBackoff,
  SheetCache,
} from '../utils/google-spreadsheet'

type ParsedResourceGroup = Omit<NTHSResourceGroup, 'cards'> & {
  cards: Array<NTHSResourceCard & { forMembers: boolean }>
}

type ParsedHomeLink = NTHSHomeLink & { adminLink: string | null }

type ParsedHomeSheet = Omit<NTHSHomeContent, 'links'> & {
  links: ParsedHomeLink[]
  resources: ParsedResourceGroup[]
}

const TIPS_WORKSHEET_TITLE = 'tips'
const LINKS_WORKSHEET_TITLE = 'links'
const RESOURCES_WORKSHEET_TITLE = 'resources'
const RESOURCE_GROUPS_WORKSHEET_TITLE = 'resource_groups'
const READ_TIMEOUT_MS = 5000
export const TIPS_HEADERS = ['tip', 'live']
export const LINKS_HEADERS = ['title', 'body', 'link', 'members', 'live']
export const RESOURCES_HEADERS = [
  'group',
  'title',
  'body',
  'link',
  'icon',
  'members',
  'live',
]
export const RESOURCE_GROUPS_HEADERS = ['group', 'subtitle', 'icon']

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

function parseLinkRow(row: { get(key: string): unknown }): NTHSHomeLink | null {
  const title = cell(row, 'title')
  const link = cell(row, 'link')
  if (!isChecked(row, 'live') || !title || !isShownLink(link)) return null
  return {
    title,
    body: cell(row, 'body'),
    link,
    forMembers: isChecked(row, 'members'),
  }
}

function parseHomeLinkRow(row: {
  get(key: string): unknown
}): ParsedHomeLink | null {
  const parsed = parseLinkRow(row)
  if (!parsed) return null
  const adminLink = cell(row, 'admin_link')
  return { ...parsed, adminLink: isShownLink(adminLink) ? adminLink : null }
}

function groupKey(name: string): string {
  return name.trim().toLowerCase()
}

async function parseResources(
  source: HomeSource
): Promise<ParsedResourceGroup[]> {
  try {
    const cardsSheet = findWorksheet(
      source.worksheets,
      RESOURCES_WORKSHEET_TITLE
    )
    const groupsSheet = findWorksheet(
      source.worksheets,
      RESOURCE_GROUPS_WORKSHEET_TITLE
    )
    const [groupRows, cardRows] = await Promise.all([
      groupsSheet.getRows(),
      cardsSheet.getRows(),
    ])
    ensureHeaders(cardsSheet, RESOURCES_HEADERS)
    ensureHeaders(groupsSheet, RESOURCE_GROUPS_HEADERS)

    const groups = new Map<string, ParsedResourceGroup>()
    for (const row of groupRows) {
      const name = cell(row, 'group')
      if (!name || groups.has(groupKey(name))) {
        continue
      }
      groups.set(groupKey(name), {
        title: name,
        subtitle: cell(row, 'subtitle'),
        icon: cell(row, 'icon').toLowerCase(),
        cards: [],
      })
    }
    for (const row of cardRows) {
      const parsed = parseLinkRow(row)
      if (!parsed) {
        continue
      }
      const group = groups.get(groupKey(cell(row, 'group')))
      if (!group) {
        logger.warn('Ignoring NTHS resource with an unknown group', {
          title: parsed.title,
          group: cell(row, 'group'),
        })
        continue
      }
      group.cards.push({
        ...parsed,
        icon: cell(row, 'icon').toLowerCase(),
      })
    }
    return [...groups.values()]
  } catch (error) {
    logger.error('Could not parse NTHS resources; showing none', {
      err: error,
    })
    return []
  }
}

export async function parseHomeContent(
  source: HomeSource
): Promise<ParsedHomeSheet> {
  const tipsSheet = findWorksheet(source.worksheets, TIPS_WORKSHEET_TITLE)
  const linksSheet = findWorksheet(source.worksheets, LINKS_WORKSHEET_TITLE)
  ensureHeaders(tipsSheet, TIPS_HEADERS)
  ensureHeaders(linksSheet, LINKS_HEADERS)

  const [tipRows, linkRows, resources] = await Promise.all([
    tipsSheet.getRows(),
    linksSheet.getRows(),
    parseResources(source),
  ])
  const tips = tipRows
    .filter((row) => isChecked(row, 'live'))
    .map((row) => cell(row, 'tip'))
    .filter(Boolean)
  const links = linkRows.flatMap((row) => parseHomeLinkRow(row) ?? [])
  return { tips, links, resources }
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
      isWorksheetTitled(worksheet, LINKS_WORKSHEET_TITLE) ||
      isWorksheetTitled(worksheet, RESOURCES_WORKSHEET_TITLE) ||
      isWorksheetTitled(worksheet, RESOURCE_GROUPS_WORKSHEET_TITLE)
  )
  await Promise.all(
    worksheets
      .filter(
        (sheet) =>
          isWorksheetTitled(sheet, TIPS_WORKSHEET_TITLE) ||
          isWorksheetTitled(sheet, LINKS_WORKSHEET_TITLE)
      )
      .map((sheet) => sheet.loadHeaderRow())
  )
  return { worksheets }
}

const homeContentCache = new SheetCache(
  loadHomeSheet,
  parseHomeContent,
  config.nthsChecklist.cacheTtlMs,
  Date.now,
  'NTHS home content'
)

const homeContentFailure: { at?: number } = {}

function readHomeSheet(): Promise<ParsedHomeSheet | null> {
  return readSheetWithBackoff({
    cache: homeContentCache,
    failure: homeContentFailure,
    errorLog: 'Could not read NTHS home content; showing none',
    timeoutMessage: 'Timed out reading NTHS home content; showing none',
    timeoutMs: READ_TIMEOUT_MS,
    isConfigured: !!(
      config.nthsRenewal.spreadsheetId &&
      config.nthsChecklist.serviceAccountEmail &&
      config.nthsChecklist.privateKey
    ),
    backoffMs: config.nthsChecklist.cacheTtlMs,
  })
}

export async function getNthsHomeContent(
  isAdmin: boolean
): Promise<NTHSHomeContent> {
  const content = await readHomeSheet()
  if (!content) return { tips: [], links: [] }
  if (isAdmin) {
    return {
      tips: content.tips,
      links: content.links.map(({ adminLink, ...link }) => ({
        ...link,
        link: adminLink ?? link.link,
      })),
    }
  }
  return {
    tips: [],
    links: content.links
      .filter((link) => link.forMembers)
      .map(({ adminLink: _adminLink, ...link }) => link),
  }
}

export async function getNthsResources(
  isAdmin: boolean
): Promise<NTHSResources> {
  const content = await readHomeSheet()
  if (!content) return { groups: [] }
  const groups = content.resources
    .map(({ cards, ...group }) => ({
      ...group,
      cards: cards
        .filter((card) => isAdmin || card.forMembers)
        .map(({ forMembers: _forMembers, ...card }) => card),
    }))
    .filter((group) => group.cards.length > 0)
  return { groups }
}
