import config from '../config'
import logger from '../logger'
import { Uuid } from '../models/pgUtils'
import { getBlobBuffer, uploadBlobBuffer } from './AzureService'
import * as WhiteboardService from './WhiteboardService'

function buildWhiteboardSnapshotPath(sessionId: Uuid): string {
  return `${sessionId}/whiteboard/snapshot.png`
}

export async function generateWhiteboardSnapshot(
  whiteboardDoc: string
): Promise<Buffer | undefined> {
  const zwibbler = await WhiteboardService.loadZwibbler()
  if (!zwibbler) return

  try {
    const rawBinary: string = await zwibbler.save(whiteboardDoc, 'png')
    return Buffer.from(rawBinary, 'binary')
  } catch (error) {
    logger.error({ err: error }, 'Failed to render whiteboard snapshot')
    return
  }
}

async function storeWhiteboardSnapshot(
  sessionId: Uuid,
  png: Buffer
): Promise<void> {
  const blobName = buildWhiteboardSnapshotPath(sessionId)
  await uploadBlobBuffer(
    config.appStorageAccountName,
    config.sessionsStorageContainer,
    blobName,
    png,
    'image/png'
  )
}

async function getWhiteboardSnapshotFromBlob(sessionId: Uuid) {
  const blobName = buildWhiteboardSnapshotPath(sessionId)
  return await getBlobBuffer(
    config.appStorageAccountName,
    config.sessionsStorageContainer,
    blobName
  )
}

export async function getWhiteboardSnapshot(sessionId: Uuid) {
  let snapshot = await getWhiteboardSnapshotFromBlob(sessionId)
  if (snapshot) return snapshot

  const whiteboardDoc = await WhiteboardService.getDocFromStorage(sessionId)
  if (!whiteboardDoc)
    throw new Error(`No whiteboard document found for session ${sessionId}`)

  snapshot = await generateWhiteboardSnapshot(whiteboardDoc)
  if (!snapshot) return

  await storeWhiteboardSnapshot(sessionId, snapshot)
  return snapshot
}
