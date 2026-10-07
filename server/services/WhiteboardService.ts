import { importFromStringSync } from 'module-from-string'
import config from '../config'
import logger from '../logger'
import { getBlob, uploadBlobString } from './AzureService'
import { Ulid, Uuid } from '../models/pgUtils'
import * as cache from '../cache'
import { KeyNotFoundError } from '../cache'
import { isZwibserveSession } from './SessionService'
import { fetchRemoteJs } from '../utils/fetch-remote-js'

const sessionIdToKey = (id: Ulid): string => `zwibbler-${id}`
const zwibserveKey = (id: Ulid): string => `zwibbler:${id}`

type Zwibbler = {
  save(doc: string, format: string): Promise<string>
}
let zwibbler: Zwibbler | undefined
let zwibblerLoad: Promise<Zwibbler | undefined> | undefined

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
      logger.info('Removed whiteboard doc from cache', { sessionId })
  } catch (error) {
    logger.warn("Couldn't remove whiteboard doc from cache", {
      err: error,
      sessionId,
    })
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
      logger.error('Retry uploading of whiteboard failed', {
        err: error,
        sessionId,
      })

      return false
    }

    logger.error('Uploading of whiteboard failed, retrying', {
      err: error,
      sessionId,
    })
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
  } catch (err) {
    logger.warn('Getting the whiteboard failed', { err, sessionId })
    return ''
  }
}

async function loadZwibblerLib(): Promise<Zwibbler | undefined> {
  // NOTE: we're grabbing the Zwibbler node library from our CDN
  // we don't want to keep it in the repo for licensing reasons
  // WARNING: DO NOT use 'module-from-string' for code we don't control since it
  // doesn't go through the same CVE checks that node modules do
  const js = await fetchRemoteJs(config.zwibblerNodeUrl)
  const lib: any = importFromStringSync(js, {
    globals: { setTimeout },
  })

  return lib?.Zwibbler as Zwibbler | undefined
}

export async function loadZwibbler(): Promise<Zwibbler | undefined> {
  if (zwibbler) return zwibbler
  // If Zwibbler is currently being loaded, return the same Promise
  // so that multiple callers wait for the same load instead of
  // starting multiple network requests
  if (zwibblerLoad) return zwibblerLoad

  // Start loading Zwibbler and store the Promise immediately
  // Any concurrent calls will reuse this Promise instead of starting the work again
  zwibblerLoad = (async () => {
    try {
      zwibbler = await loadZwibblerLib()
      return zwibbler
    } catch (err) {
      logger.warn('Zwibbler load failed. Snapshots will be skipped for now.', {
        err,
      })
      return
    } finally {
      if (!zwibbler) zwibblerLoad = undefined
    }
  })()

  return zwibblerLoad
}
