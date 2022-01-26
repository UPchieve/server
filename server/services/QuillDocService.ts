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
    return processDoc(sessionId, docString)
  } catch (err) {
    if (!(err instanceof cache.KeyNotFoundError)) throw err
  }
}

export async function processDoc(
  sessionId: Types.ObjectId,
  docString: string
): Promise<Delta | undefined> {
  try {
    const deltasKey = getSessionDeltasKey(sessionId)
    let doc: Delta = JSON.parse(docString)
    let pendingDelta: string = await cache.lpop(deltasKey)
    const isUpdateNeeded = pendingDelta ? true : false

    while (pendingDelta) {
      const delta = JSON.parse(pendingDelta)
      doc = new Delta(doc).compose(delta)
      pendingDelta = await cache.lpop(deltasKey)
    }

    if (isUpdateNeeded)
      await cache.save(sessionIdToKey(sessionId), JSON.stringify(doc))
    return doc
  } catch (err) {
    if (!(err instanceof cache.KeyNotFoundError)) throw err
  }
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
  } catch (err) {
    if (!(err instanceof cache.KeyDeletionFailureError)) throw err
  }
}
