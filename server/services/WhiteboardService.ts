import config from '../config'
import logger from '../logger'
import { getBlob, uploadBlobString } from './AzureService'
import { Ulid, Uuid } from '../models/pgUtils'
import * as cache from '../cache'
import { KeyNotFoundError } from '../cache'
import { isZwibserveSession } from './SessionService'

const sessionIdToKey = (id: Ulid): string => `zwibbler-${id}`
const zwibserveKey = (id: Ulid): string => `zwibbler:${id}`

async function getZwibserveOrCustomCollabKey(sessionId: Ulid) {
  const isUsingZwibserve = await isZwibserveSession(sessionId)
  if (isUsingZwibserve) return zwibserveKey(sessionId)
  return sessionIdToKey(sessionId)
}

export const createDoc = async (sessionId: Ulid): Promise<string> => {
  const newDoc = ''
  await cache.save(sessionIdToKey(sessionId), newDoc)
  return newDoc
}

export const getDoc = (sessionId: Ulid): Promise<string> => {
  return cache.get(sessionIdToKey(sessionId))
}

export const getDocIfExist = async (
  sessionId: Uuid
): Promise<string | undefined> => {
  try {
    const sessionKey = await getZwibserveOrCustomCollabKey(sessionId)
    return await cache.get(sessionKey)
  } catch (error) {
    if (!(error instanceof KeyNotFoundError)) throw error
  }
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

export async function deleteDoc(sessionId: Ulid) {
  try {
    const sessionKey = await getZwibserveOrCustomCollabKey(sessionId)
    ;(await cache.remove(sessionKey)) &&
      logger.info({ sessionId }, 'Removed whiteboard doc from cache')
  } catch (error) {
    logger.warn(
      { err: error, sessionId },
      "Couldn't remove whiteboard doc from cache"
    )
  }
}

export const uploadedToStorage = async (
  sessionId: Ulid,
  whiteboardDoc: string,
  attempts = 0
): Promise<boolean> => {
  try {
    await uploadBlobString(
      config.whiteboardStorageAccountName,
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
      config.whiteboardStorageAccountName,
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
