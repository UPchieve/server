import Delta from 'quill-delta'
import { redisClient } from './RedisService'

const sessionIdToKey = (id: string): string => `quill-${id}`

module.exports = {
  createDoc: async (sessionId: string): Promise<Delta> => {
    const newDoc = new Delta()
    await redisClient.set(sessionIdToKey(sessionId), JSON.stringify(newDoc))
    return newDoc
  },

  getDoc: async (sessionId: string): Promise<Delta | undefined> => {
    const docString = await redisClient.get(sessionIdToKey(sessionId))
    if (!docString) return
    return new Delta(JSON.parse(docString))
  },

  appendToDoc: async (sessionId: string, delta: Delta): Promise<void> => {
    const redisKey = sessionIdToKey(sessionId)
    const docString = await redisClient.get(redisKey)
    if (!docString) return
    const updatedDoc = new Delta(JSON.parse(docString)).compose(delta)
    await redisClient.set(redisKey, JSON.stringify(updatedDoc))
  },

  deleteDoc: async (sessionId: string): Promise<void> => {
    await redisClient.del(sessionIdToKey(sessionId))
  }
}
