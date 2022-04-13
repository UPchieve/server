import config from '../config'
import logger from '../logger'
import { getBlob, uploadBlob } from './AzureService'
import { Ulid } from '../models/pgUtils'
import * as cache from '../cache'

const sessionIdToKey = (id: Ulid): string => `zwibbler-${id}`

export const createDoc = async (sessionId: Ulid): Promise<string> => {
  const newDoc = ''
  await cache.save(sessionIdToKey(sessionId), newDoc)
  return newDoc
}

export const getDoc = (sessionId: Ulid): Promise<string> => {
  return cache.get(sessionIdToKey(sessionId))
}

export const getDocLength = async (sessionId: Ulid): Promise<number> => {
  const document = await cache.get(sessionIdToKey(sessionId))
  if (document === undefined) return 0
  return Buffer.byteLength(document, 'utf8')
}

export const appendToDoc = (
  sessionId: Ulid,
  docAddition: string | undefined
): Promise<void> => {
  if (docAddition === undefined) return Promise.resolve()
  return cache.append(sessionIdToKey(sessionId), docAddition)
}

export const deleteDoc = (sessionId: Ulid): Promise<void> => {
  return cache.remove(sessionIdToKey(sessionId))
}

export const uploadedToStorage = async (
  sessionId: Ulid,
  whiteboardDoc: string,
  attempts = 0
): Promise<boolean> => {
  try {
    await uploadBlob(
      config.whiteboardStorageContainer,
      sessionId.toString(),
      whiteboardDoc
    )
    return true
  } catch (error) {
    if (attempts === 1) {
      logger.error(
        `Retry uploading of whiteboard failed ${sessionId}: ${
          (error as Error).message
        }`
      )

      return false
    }

    logger.error(
      `Uploading of whiteboard failed ${sessionId}, retrying: ${
        (error as Error).message
      }`
    )
    attempts++
    return uploadedToStorage(sessionId, whiteboardDoc, attempts)
  }
}

export const getDocFromStorage = async (sessionId: Ulid): Promise<string> => {
  try {
    const whiteboardDoc = await getBlob(
      config.whiteboardStorageContainer,
      sessionId.toString()
    )
    return whiteboardDoc
  } catch (error) {
    logger.error(
      `Getting the whiteboard failed ${sessionId}: ${(error as Error).message}`
    )
    return ''
  }
}
