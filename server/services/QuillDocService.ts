import Delta from 'quill-delta'
import * as cache from '../cache'

function sessionIdToKey(id: string): string {
  return `quill-${id}`
}

export async function createDoc(sessionId: string): Promise<Delta> {
  const newDoc = new Delta()
  await cache.save(sessionIdToKey(sessionId), JSON.stringify(newDoc))
  return newDoc
}

export async function getDoc(sessionId: string): Promise<Delta | undefined> {
  try {
    const docString = await cache.get(sessionIdToKey(sessionId))
    return new Delta(JSON.parse(docString))
  } catch (err) {
    if (!(err instanceof cache.KeyNotFoundError)) throw err
  }
}

export async function appendToDoc(
  sessionId: string,
  delta: Delta
): Promise<void> {
  const redisKey = sessionIdToKey(sessionId)
  try {
    const docString = await cache.get(redisKey)
    const updatedDoc = new Delta(JSON.parse(docString)).compose(delta)
    await cache.save(redisKey, JSON.stringify(updatedDoc))
  } catch (err) {
    if (!(err instanceof cache.KeyNotFoundError)) throw err
  }
}

export async function deleteDoc(sessionId: string): Promise<void> {
  try {
    await cache.remove(sessionIdToKey(sessionId))
  } catch (err) {
    if (!(err instanceof cache.KeyDeletionFailureError)) throw err
  }
}
