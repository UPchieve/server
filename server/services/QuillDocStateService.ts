import * as Y from 'yjs'
import * as QuillDocService from './QuillDocService'
import * as ModerationService from './ModerationService'
import { Ulid } from '../models/pgUtils'
import { PrimaryUserRole } from './UserRolesService'
import logger from '../logger'

const MAX_CACHED_SESSIONS = 500
const WINDOW_PAD_CHARS = 64

type CacheEntry = {
  doc: Y.Doc
  lastTouched: number
}

// Map preserves insertion order, giving us LRU behavior:
// on access, delete and re-set to move the entry to the tail;
// on overflow, evict the first (oldest) key.
const cache = new Map<string, CacheEntry>()

function touch(sessionId: string, entry: CacheEntry): void {
  entry.lastTouched = Date.now()
  cache.delete(sessionId)
  cache.set(sessionId, entry)
}

function evictIfNeeded(): void {
  while (cache.size > MAX_CACHED_SESSIONS) {
    const oldest = cache.keys().next().value
    if (oldest === undefined) break
    cache.delete(oldest)
  }
}

export function evictSession(sessionId: Ulid | string): void {
  cache.delete(sessionId.toString())
}

function decodeUpdate(update: string): Uint8Array {
  return Uint8Array.from(update.split(',').map(Number))
}

async function getOrBuildYDoc(sessionId: Ulid): Promise<Y.Doc> {
  const key = sessionId.toString()
  const existing = cache.get(key)
  if (existing) {
    touch(key, existing)
    return existing.doc
  }

  const updates = await QuillDocService.getDocumentUpdates(sessionId)
  const doc = new Y.Doc()
  for (const update of updates) {
    Y.applyUpdate(doc, decodeUpdate(update))
  }
  const entry: CacheEntry = { doc, lastTouched: Date.now() }
  cache.set(key, entry)
  evictIfNeeded()
  return doc
}

function findDiffRange(
  before: string,
  after: string
): { start: number; end: number } {
  let start = 0
  const minLen = Math.min(before.length, after.length)
  while (start < minLen && before[start] === after[start]) start++

  let beforeEnd = before.length
  let afterEnd = after.length
  while (
    beforeEnd > start &&
    afterEnd > start &&
    before[beforeEnd - 1] === after[afterEnd - 1]
  ) {
    beforeEnd--
    afterEnd--
  }

  return { start, end: afterEnd }
}

function extractWindow(text: string, start: number, end: number): string {
  const windowStart = Math.max(0, start - WINDOW_PAD_CHARS)
  const windowEnd = Math.min(text.length, end + WINDOW_PAD_CHARS)
  return text.slice(windowStart, windowEnd)
}

export type ModerationDecision =
  | { clean: true }
  | {
      clean: false
      failures: Record<string, string[] | never>
      authoritativeUpdates: string[]
    }

/**
 * Apply an incoming Yjs update to the cached server-side Y.Doc, moderate
 * the affected window of text, and decide whether to accept or reject.
 *
 * On reject: evicts the cached doc (so next access rebuilds from the canonical
 * Redis log, which does not contain the rejected update) and returns the
 * current authoritative update list for the client to reset to.
 */
export async function applyAndModerate({
  sessionId,
  update,
  senderId,
  userType,
}: {
  sessionId: Ulid
  update: string
  senderId: Ulid
  userType: PrimaryUserRole
}): Promise<ModerationDecision> {
  let doc: Y.Doc
  try {
    doc = await getOrBuildYDoc(sessionId)
  } catch (err) {
    logger.error(
      err,
      { sessionId: sessionId.toString() },
      'QuillDocStateService: failed to build Y.Doc; failing open'
    )
    return { clean: true }
  }

  const yText = doc.getText('quill')
  const preText = yText.toString()

  try {
    Y.applyUpdate(doc, decodeUpdate(update))
  } catch (err) {
    logger.error(
      err,
      { sessionId: sessionId.toString() },
      'QuillDocStateService: failed to apply update; failing open'
    )
    return { clean: true }
  }

  const postText = yText.toString()

  if (preText === postText) return { clean: true }

  const { start, end } = findDiffRange(preText, postText)
  const windowText = extractWindow(postText, start, end)

  const result = await ModerationService.moderateMessage(
    {
      message: windowText,
      senderId: senderId.toString(),
      userType,
      sessionId: sessionId.toString(),
    },
    'document-editor-text-node'
  )

  // moderateMessage returns `boolean` only for legacy clients that omit sessionId;
  // we always pass sessionId, so this is the failures shape.
  const failures = typeof result === 'boolean' ? {} : result.failures
  if (Object.keys(failures).length === 0) return { clean: true }

  evictSession(sessionId)
  const authoritativeUpdates =
    await QuillDocService.getDocumentUpdates(sessionId)
  return { clean: false, failures, authoritativeUpdates }
}
