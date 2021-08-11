import { ClientSecretCredential } from '@azure/identity'
import { BlobServiceClient } from '@azure/storage-blob'
import config from '../config'
import * as Stream from "stream";

const whiteboardStorageAccount = config.whiteboardStorageAccountName
const whiteboardStorageCredential = new ClientSecretCredential(
  config.whiteboardStorageTenantId,
  config.whiteboardStorageAppId,
  config.whiteboardStorageSecret
)
const blobServiceClient = new BlobServiceClient(
  `https://${whiteboardStorageAccount}.blob.core.windows.net`,
  whiteboardStorageCredential
)

// a helper method used to read a Node.js readable stream into a Buffer
async function streamToBuffer(readableStream: Stream): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = []
    readableStream.on('data', (data: Buffer | Uint8Array | ArrayBuffer) => {
      chunks.push(data instanceof Buffer ? data : Buffer.from(data))
    })
    readableStream.on('end', () => {
      const result = Buffer.concat(chunks)
      resolve(result)
    })
    readableStream.on('error', reject)
  })
}

export const getBlob = async ({
  containerName,
  blobName
}: {
  containerName: string
  blobName: string
}): Promise<string> => {
  const containerClient = blobServiceClient.getContainerClient(containerName)
  const blobClient = containerClient.getBlobClient(blobName)
  const downloadBlockBlobResponse = await blobClient.download()
  if (downloadBlockBlobResponse.readableStreamBody)
    return (
      await (streamToBuffer(downloadBlockBlobResponse.readableStreamBody)
    ) as Buffer).toString()
}

export const uploadBlob = async ({
  containerName,
  blobName,
  content
}: {
  containerName: string
  blobName: string
  content: string
}): Promise<void> => {
  const containerClient = blobServiceClient.getContainerClient(containerName)
  const blockBlobClient = containerClient.getBlockBlobClient(blobName)
  await blockBlobClient.upload(content, content.length)
}
