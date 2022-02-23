import Delta from 'quill-delta'
import { Types } from 'mongoose'
import * as cache from '../cache'

function sessionIdToKey(id: Types.ObjectId): string {
  return `quill-${id.toString()}`
}

function getSessionDeltasKey(id: Types.ObjectId): string {
  return `${sessionIdToKey(id)}-deltas`
}

export async function createDoc(sessionId: Types.ObjectId): Promise<Delta> {
  const newDoc = new Delta()
  await cache.save(sessionIdToKey(sessionId), JSON.stringify(newDoc))
  return newDoc
}

export async function getDoc(
  sessionId: Types.ObjectId
): Promise<Delta | undefined> {
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
  sessionId: Types.ObjectId
): Promise<QuillCacheState | undefined> {
  try {
    const sessionCacheKey = sessionIdToKey(sessionId)
    const lock = await cache.lock(sessionCacheKey, 5000)
    const docString = await cache.get(sessionCacheKey)
    const result = await processDoc(sessionId, docString)
    await lock.unlock()
    return result
  } catch (err) {
    if (!(err instanceof cache.KeyNotFoundError)) throw err
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
  sessionId: Types.ObjectId,
  docString: string
): Promise<QuillCacheState> {
  const deltasCacheKey = getSessionDeltasKey(sessionId)
  let pendingDelta: string = await cache.lpop(deltasCacheKey)
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
  sessionId: Types.ObjectId,
  delta: Delta
): Promise<void> {
  await cache.rpush(getSessionDeltasKey(sessionId), JSON.stringify(delta))
}

export async function deleteDoc(sessionId: Types.ObjectId): Promise<void> {
  try {
    await cache.remove(sessionIdToKey(sessionId))
    await cache.remove(getSessionDeltasKey(sessionId))
  } catch (err) {
    if (!(err instanceof cache.KeyDeletionFailureError)) throw err
  }
}
