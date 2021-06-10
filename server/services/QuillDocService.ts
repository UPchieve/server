import Delta from 'quill-delta'
import { redisClient } from './RedisService'

function sessionIdToKey(id: string): string {
  return `quill-${id}`
}

export async function createDoc(sessionId: string): Promise<Delta> {
  const newDoc = new Delta()
  await redisClient.set(sessionIdToKey(sessionId), JSON.stringify(newDoc))
  return newDoc
}

export async function getDoc(sessionId: string): Promise<Delta | undefined> {
  const docString = await redisClient.get(sessionIdToKey(sessionId))
  if (!docString) return
  return new Delta(JSON.parse(docString))
}

export async function appendToDoc(
  sessionId: string,
  delta: Delta
): Promise<void> {
  const redisKey = sessionIdToKey(sessionId)
  const docString = await redisClient.get(redisKey)
  if (!docString) return
  const updatedDoc = new Delta(JSON.parse(docString)).compose(delta)
  await redisClient.set(redisKey, JSON.stringify(updatedDoc))
}

export async function deleteDoc(sessionId: string): Promise<void> {
  await redisClient.del(sessionIdToKey(sessionId))
}
