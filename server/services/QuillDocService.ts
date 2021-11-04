import Delta from 'quill-delta'
import { Types } from 'mongoose'
import * as cache from '../cache'

function sessionIdToKey(id: Types.ObjectId): string {
  return `quill-${id.toString()}`
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

export async function appendToDoc(
  sessionId: Types.ObjectId,
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

export async function deleteDoc(sessionId: Types.ObjectId): Promise<void> {
  try {
    await cache.remove(sessionIdToKey(sessionId))
  } catch (err) {
    if (!(err instanceof cache.KeyDeletionFailureError)) throw err
  }
}
