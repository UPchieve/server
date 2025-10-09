import Delta from 'quill-delta'
import * as cache from '../cache'
import { Ulid } from '../models/pgUtils'
import logger from '../logger'
import { getSessionById } from '../models/Session'
import { COLLEGE_LIST_DOC_WORKSHEET } from '../constants'
import { getCollegeListWorkSheetFlag } from './FeatureFlagService'
import * as Y from 'yjs'
import { ResourceLockedError } from '@sesamecare-oss/redlock'

// Used for v1.
function sessionIdToKey(id: Ulid): string {
  return `quill-${id.toString()}`
}

// Used for v1.
function getSessionDeltasKey(id: Ulid): string {
  return `${sessionIdToKey(id)}-deltas`
}

// Used for v2.
function getSessionDocumentUpdatesKey(id: Ulid): string {
  return `${sessionIdToKey(id)}-document-updates`
}

export async function createDoc(sessionId: Ulid): Promise<Delta> {
  const session = await getSessionById(sessionId)
  const newDoc =
    session.subject === 'collegeList' &&
    (await getCollegeListWorkSheetFlag(session.studentId))
      ? new Delta(COLLEGE_LIST_DOC_WORKSHEET)
      : new Delta()
  await cache.save(sessionIdToKey(sessionId), JSON.stringify(newDoc))
  return newDoc
}

export async function getDocEditorVersion(sessionId: Ulid): Promise<number> {
  return (await cache.exists(getSessionDocumentUpdatesKey(sessionId))) ? 2 : 1
}

export async function getDoc(sessionId: Ulid): Promise<Delta | undefined> {
  try {
    const docString = await cache.get(sessionIdToKey(sessionId))
    return new Delta(JSON.parse(docString))
  } catch (err) {
    if (!(err instanceof cache.KeyNotFoundError)) throw err
  }
}

export type QuillCacheState = {
  doc: Delta
  lastDeltaStored: Delta | undefined
}

/**
 *
 * Locks the doc resource in the cache and retrieves the
 * updated doc and the last delta that was popped from
 * the queue
 *
 */
export async function lockAndGetDocCacheState(
  sessionId: Ulid
): Promise<QuillCacheState | undefined> {
  try {
    const sessionCacheKey = sessionIdToKey(sessionId)
    const lock = await cache.lock(sessionCacheKey, 5000)
    const docString = await cache.get(sessionCacheKey)
    const result = await processDoc(sessionId, docString)
    await lock.release()
    return result
  } catch (err) {
    if (!(err instanceof cache.KeyNotFoundError)) throw err
  }
}

/*
 * `lockAndGetDocCacheState` with retry
 */
export async function getQuillDocV1(
  sessionId: Ulid,
  retries: number = 0
): Promise<QuillCacheState | undefined> {
  try {
    return await lockAndGetDocCacheState(sessionId)
  } catch (error) {
    if (error instanceof ResourceLockedError && retries < 10)
      return getQuillDocV1(sessionId, retries + 1)
    else
      logger.error(
        `Failed to update and get document in the cache for session ${sessionId} - ${error}`
      )
    return
  }
}

/**
 *
 * Empties the queue of deltas for a session and then composes and saves
 * the updated doc delta if there were deltas inside the queue
 *
 * Returns the doc stored in the cache and the last delta that was popped
 * from the queue
 *
 */
export async function processDoc(
  sessionId: Ulid,
  docString: string
): Promise<QuillCacheState> {
  const deltasCacheKey = getSessionDeltasKey(sessionId)
  let pendingDelta = await cache.lpop(deltasCacheKey)
  const isUpdateNeeded = !!pendingDelta
  let doc: Delta = new Delta(JSON.parse(docString))
  let lastDeltaStored: Delta | undefined

  while (pendingDelta) {
    const delta = new Delta(JSON.parse(pendingDelta))
    doc = doc.compose(delta)
    const prevDelta = pendingDelta
    pendingDelta = await cache.lpop(deltasCacheKey)
    if (prevDelta && !pendingDelta) lastDeltaStored = JSON.parse(prevDelta)
  }

  if (isUpdateNeeded)
    await cache.save(sessionIdToKey(sessionId), JSON.stringify(doc))
  return { doc, lastDeltaStored }
}

export async function appendToDoc(
  sessionId: Ulid,
  delta: Delta
): Promise<void> {
  await cache.rpush(getSessionDeltasKey(sessionId), JSON.stringify(delta))
}

/**
 * The new version of our Quill editor is backed by Yjs CRDTs.
 * Updates to the document are represented as Uint8Arrays. We
 * store them in a Redis @set as a string of comma separated 8-bit integers.
 *
 * example: "1,8,3,9,4"
 *
 * When we want to turn this into an actual document, we retrieve all members
 * of the Redis @set at a given key, convert them back to Uint8Arrays, then
 * apply them as updates to the Y.Doc.
 *
 * Redis does not allow empty sets, so when starting a session with v2 doc,
 * we store a dummy value (SET_EXISTS) into the set, then we can use the
 * existence of the v2 doc in cache to know which version of the doc editor
 * to use - the dummy value just needs to be removed before using the doc.
 */
export async function getDocumentUpdates(sessionId: Ulid): Promise<string[]> {
  const updates = await cache.smembers(getSessionDocumentUpdatesKey(sessionId))
  const session = await getSessionById(sessionId)
  if (
    updates.length === 0 &&
    session.subject === 'collegeList' &&
    (await getCollegeListWorkSheetFlag(session.studentId))
  ) {
    const ydoc = new Y.Doc()
    const ytext = ydoc.getText('quill')
    ytext.applyDelta(COLLEGE_LIST_DOC_WORKSHEET)
    const update = Y.encodeStateAsUpdate(ydoc)
    const updateString = Array.from(update).toString()
    await addDocumentUpdate(sessionId, updateString)
    return [updateString]
  }
  return updates.filter((u) => u !== SET_EXISTS)
}

export async function addDocumentUpdate(
  sessionId: Ulid,
  update: string
): Promise<void> {
  await cache.sadd(getSessionDocumentUpdatesKey(sessionId), update)
}

const SET_EXISTS = 'SET_EXISTS'
export async function ensureDocumentUpdateExists(sessionId: Ulid) {
  const key = getSessionDocumentUpdatesKey(sessionId)
  await cache.sadd(key, SET_EXISTS)
}

export async function deleteDoc(sessionId: Ulid): Promise<void> {
  await Promise.allSettled([
    cache.remove(sessionIdToKey(sessionId)),
    cache.remove(getSessionDeltasKey(sessionId)),
    cache.remove(getSessionDocumentUpdatesKey(sessionId)),
  ])
}
