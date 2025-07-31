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

async function streamToBuffer(
  readableStream: NodeJS.ReadableStream
): Promise<Buffer> {
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
): Promise<Buffer> {
  const containerClient = blobServiceClient.getContainerClient(containerName)
  const blobClient = containerClient.getBlobClient(
    `${blobName.replace(/-/g, '').toUpperCase()}`
  )
  const downloadBlockBlobResponse = await blobClient.download()
  const blobContent = await streamToBuffer(
    downloadBlockBlobResponse.readableStreamBody as NodeJS.ReadableStream
  )
  return blobContent
}

export const getFromStorage = async (
  voiceMessageId: Ulid
): Promise<Buffer | string> => {
  try {
    return await getBlob(
      config.voiceMessageStorageContainer,
      voiceMessageId.toString()
    )
  } catch (error) {
    logger.error(
      `Getting the voice message failed ${voiceMessageId}: ${
        (error as Error).message
      }`
    )
    return ''
  }
}
