import * as Y from 'yjs'
import * as ModerationService from './ModerationService'
import * as Regex from './ModerationService/regex'
import * as QuillDocService from './QuillDocService'
import * as SessionService from './SessionService'
import logger from '../logger'
import type { PrimaryUserRole } from './UserRolesService'
import type { SessionWithSubjectAndTopic } from '../models/Subjects'
import type { Uuid } from '../types/shared'

// How many characters of context to include on either side of the changed text
// when building the moderation window. This helps catch violations that span
// multiple buffer updates, e.g. a phone number or profanity typed in segments
const WINDOW_PAD_CHARS = 64

type DocEditorModerationResult = {
  isClean: boolean
  failures?: Record<string, string[]>
}

type TextRange = {
  start: number
  end: number
}

type TextDeltaOperation = {
  retain?: number
  insert?: string | Record<string, unknown>
  delete?: number
  attributes?: Record<string, unknown>
}

function decodeUpdate(update: string): Uint8Array {
  return Uint8Array.from(update.split(',').map(Number))
}

function buildYDocFromUpdates(updates: string[]): Y.Doc {
  const doc = new Y.Doc()
  for (const update of updates) {
    Y.applyUpdate(doc, decodeUpdate(update))
  }
  return doc
}

// Walks a Quill delta to find which character positions in the document
// were visibly changed. Returns the start/end range, or null if nothing
// visible changed (e.g. formatting only)
//
// A delta is a list of operations describing how a document changed:
//   retain N — skip N characters (cursor advances, nothing changed)
//   insert S — insert string S at current position
//   delete N — remove N characters at current position
//
// Example: doc is "Hello World", user types " there" after "Hello"
//   delta: [{ retain: 5 }, { insert: " there" }]
//   currentOffset after retain: 5
//   insert starts at 5, ends at 11 → range { start: 5, end: 11 }
function getChangedTextRange(delta: TextDeltaOperation[]): TextRange | null {
  let changedTextRange: TextRange | null = null
  let currentOffset = 0

  function includeChangedRange(start: number, end: number) {
    changedTextRange = {
      start: Math.min(changedTextRange?.start ?? start, start),
      end: Math.max(changedTextRange?.end ?? end, end),
    }
  }

  for (const operation of delta) {
    // retain advances the cursor without changing text
    if (operation.retain) currentOffset += operation.retain

    if (typeof operation.insert === 'string') {
      const insertedTextStart = currentOffset
      currentOffset += operation.insert.length
      includeChangedRange(insertedTextStart, currentOffset)
    }

    // non-string inserts are embeds (e.g. images), they occupy one position
    if (operation.insert && typeof operation.insert !== 'string') {
      currentOffset += 1
    }

    // deletion joins the surrounding text together, which could create
    // a new word worth moderating (e.g. deleting a space between two words)
    if (operation.delete) {
      includeChangedRange(currentOffset, currentOffset)
    }
  }

  return changedTextRange
}

// Slices a window of text around the changed range, padded by WINDOW_PAD_CHARS
// on each side. This gives the moderation check enough context to catch
// violations that are spread across the boundary of the changed text
function getTextWindowForModeration(
  text: string,
  changedTextRange: TextRange
): string {
  const windowStart = Math.max(0, changedTextRange.start - WINDOW_PAD_CHARS)
  const windowEnd = Math.min(
    text.length,
    changedTextRange.end + WINDOW_PAD_CHARS
  )
  return text.slice(windowStart, windowEnd)
}

// Yjs updates are binary CRDT operations and do not expose character indexes
// or plain text directly. To find what changed we have to apply the updates
// to a shadow doc and observe the Quill delta events that fire, which do
// expose character positions we can use to extract a moderation window
async function extractModerationWindow(
  sessionId: Uuid,
  updates: string[]
): Promise<string | null> {
  let doc: Y.Doc

  try {
    const approvedUpdates = await QuillDocService.getDocumentUpdates(sessionId)
    // Build a shadow doc from the last known committed state
    doc = buildYDocFromUpdates(approvedUpdates)
  } catch (err) {
    logger.error(
      { err, sessionId },
      '[DOC_EDITOR_MODERATION] Failed to build shadow Y.Doc'
    )
    return null
  }

  const yText = doc.getText('quill')
  let combinedChangedRange: TextRange | null = null

  // Observe text change events as each update is applied so we can track
  // the combined range of all visible changes across the entire buffer
  function handleTextChange(event: Y.YTextEvent) {
    const delta = event.delta as TextDeltaOperation[]
    const range = getChangedTextRange(delta)
    if (!range) return
    combinedChangedRange = {
      start: Math.min(combinedChangedRange?.start ?? range.start, range.start),
      end: Math.max(combinedChangedRange?.end ?? range.end, range.end),
    }
  }

  yText.observe(handleTextChange)

  try {
    // Apply the incoming buffer to the shadow doc so the observer can detect exactly what changed
    for (const update of updates) {
      Y.applyUpdate(doc, decodeUpdate(update))
    }
  } catch (err) {
    logger.error(
      { err, sessionId },
      '[DOC_EDITOR_MODERATION] Failed to apply buffer updates'
    )
    return null
  } finally {
    yText.unobserve(handleTextChange)
  }

  // Nothing to moderate since no visible text changed
  if (!combinedChangedRange) {
    return null
  }

  const textAfterBuffer = yText.toString()
  const windowText = getTextWindowForModeration(
    textAfterBuffer,
    combinedChangedRange
  )

  if (!windowText.trim()) {
    return null
  }

  doc.destroy()
  return windowText
}

export async function regexCheckUpdates({
  sessionId,
  updates,
}: {
  sessionId: Uuid
  updates: string[]
}): Promise<{
  result: DocEditorModerationResult
  windowText?: string | null
}> {
  const windowText = await extractModerationWindow(sessionId, updates)

  // No visible text change, no moderation needed
  if (!windowText) {
    return { result: { isClean: true } }
  }

  let sessionInfo: SessionWithSubjectAndTopic | null = null
  if (sessionId) {
    sessionInfo = await SessionService.getSessionInfo(sessionId)
  }

  const regexDecision = await Regex.regexModerate(
    windowText,
    sessionInfo?.topicId
  )
  return {
    result: {
      isClean: regexDecision.isClean,
      failures: regexDecision.failures.failures,
    },
    windowText,
  }
}

export async function moderateDocumentEditorWindowText({
  sessionId,
  senderId,
  userType,
  windowText,
}: {
  sessionId: Uuid
  senderId: Uuid
  userType: PrimaryUserRole
  windowText: string
}): Promise<DocEditorModerationResult> {
  return ModerationService.moderateDocEditor({
    sessionId,
    senderId,
    userType,
    text: windowText,
  })
}
