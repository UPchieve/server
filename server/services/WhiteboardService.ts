import config from '../config'
import logger from '../logger'
import { redisClient } from './RedisService'
import { getBlob, uploadBlob } from './AzureService'

function sessionIdToKey(id: string): string { return `zwibbler-${id}` }

export async function createDoc(sessionId: string): Promise<string> {
  const newDoc = ''
  await redisClient.set(sessionIdToKey(sessionId), newDoc)
  return newDoc
}

export function getDoc(sessionId: string): Promise<string|null> {
  return redisClient.get(sessionIdToKey(sessionId))
}

export async function getDocLength(sessionId: string): Promise<number> {
  const document = await redisClient.get(sessionIdToKey(sessionId))
  if (document === null) return 0
  return Buffer.byteLength(document, 'utf8')
}

export function appendToDoc(sessionId: string, docAddition: string): Promise<number> {
  return redisClient.append(sessionIdToKey(sessionId), docAddition)
}

export function deleteDoc(sessionId: string): Promise<number> {
  return redisClient.del(sessionIdToKey(sessionId))
}

export async function uploadedToStorage(
  sessionId: string,
  whiteboardDoc: string,
  attempts = 0
): Promise<boolean> {
  try {
    await uploadBlob({
      containerName: config.whiteboardStorageContainer,
      blobName: sessionId,
      content: whiteboardDoc
    })
    return true
  } catch (error) {
    if (attempts === 1) {
      logger.error(
        `Retry uploading of whiteboard failed ${sessionId}: ${error.message}`
      )

      return false
    }

    logger.error(
      `Uploading of whiteboard failed ${sessionId}, retrying: ${error.message}`
    )
    attempts++
    return uploadedToStorage(sessionId, whiteboardDoc, attempts)
  }
}

export async function getDocFromStorage(sessionId: string): Promise<string> {
  try {
    return await getBlob({
      containerName: config.whiteboardStorageContainer,
      blobName: sessionId
    })
  } catch (error) {
    logger.error(`Getting the whiteboard failed ${sessionId}: ${error.message}`)
    return ''
  }
}
