import config from '../config'
import logger from '../logger'
import { Ulid } from '../models/pgUtils'
import { ClientSecretCredential } from '@azure/identity'
import { BlobServiceClient } from '@azure/storage-blob'

// Not using AzureService since that hardcodes whiteboard specific stuff
const voiceMessageStorageAccount = config.voiceMessageStorageAccountName
const voiceMessageStorageCredential = new ClientSecretCredential(
  config.voiceMessageStorageTenantId,
  config.voiceMessageStorageAppId,
  config.voiceMessageStorageSecret
)
const blobServiceClient = new BlobServiceClient(
  `https://${voiceMessageStorageAccount}.blob.core.windows.net`,
  voiceMessageStorageCredential
)

// a helper method used to read a Node.js readable stream into a Buffer
async function streamToBuffer(
  readableStream: NodeJS.ReadableStream
): Promise<Buffer> {
  // TODO: is there a way to do this async?
  return new Promise((resolve, reject) => {
    const chunks: any[] = []
    readableStream.on('data', (data: any) => {
      chunks.push(data instanceof Buffer ? data : Buffer.from(data))
    })
    readableStream.on('end', () => {
      resolve(Buffer.concat(chunks))
    })
    readableStream.on('error', reject)
  })
}

export async function getBlob(
  containerName: string,
  blobName: string
): Promise<string> {
  const containerClient = blobServiceClient.getContainerClient(containerName)
  const blobClient = containerClient.getBlobClient(
    `${blobName.replaceAll('-', '').toUpperCase()}`
  )
  const downloadBlockBlobResponse = await blobClient.download()
  const blobContent = await streamToBuffer(
    // readableStreamBody always available within Node
    downloadBlockBlobResponse.readableStreamBody as NodeJS.ReadableStream
  )
  return blobContent
}

export async function uploadBlob(
  containerName: string,
  blobName: string,
  content: { content: { buffer: Express.Multer.File['buffer'] } }
): Promise<void> {
  const containerClient = blobServiceClient.getContainerClient(containerName)
  const blockBlobClient = containerClient.getBlockBlobClient(blobName)
  await blockBlobClient.upload(content.buffer, content.buffer.length)
}

export const uploadedToStorage = async (
  voiceMessageId: Ulid,
  voiceMessage: string,
  attempts = 0
): Promise<boolean> => {
  try {
    await uploadBlob(
      config.voiceMessageStorageContainer,
      voiceMessageId,
      voiceMessage
    )
    return true
  } catch (error) {
    if (attempts === 1) {
      logger.error(
        `Retry uploading of voice message failed ${voiceMessageId}: ${
          (error as Error).message
        }`
      )

      return false
    }

    logger.error(
      `Uploading of voice message failed ${voiceMessageId}, retrying: ${
        (error as Error).message
      }`
    )
    attempts++
    return uploadedToStorage(voiceMessageId, voiceMessage, attempts)
  }
}

export const getFromStorage = async (voiceMessageId: Ulid): Promise<string> => {
  try {
    const voiceMessage = await getBlob(
      config.voiceMessageStorageContainer,
      voiceMessageId.toString()
    )

    return voiceMessage
  } catch (error) {
    logger.error(
      `Getting the voice message failed ${voiceMessageId}: ${
        (error as Error).message
      }`
    )
    return ''
  }
}
