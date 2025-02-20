import { ClientSecretCredential } from '@azure/identity'
import { BlobServiceClient } from '@azure/storage-blob'
import config from '../config'

const azureStorageCredential = new ClientSecretCredential(
  config.azureTenantId,
  config.azureClientId,
  config.azureStorageSecret
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
  storageAccountName: string,
  containerName: string,
  blobName: string
): Promise<string> {
  const blobServiceClient = new BlobServiceClient(
    `https://${storageAccountName}.blob.core.windows.net`,
    azureStorageCredential
  )
  const containerClient = blobServiceClient.getContainerClient(containerName)
  const blobClient = containerClient.getBlobClient(blobName)
  const downloadBlockBlobResponse = await blobClient.download()
  const blobContent = (
    await streamToBuffer(
      // readableStreamBody always available within Node
      downloadBlockBlobResponse.readableStreamBody as NodeJS.ReadableStream
    )
  ).toString()
  return blobContent
}

export async function uploadBlobString(
  storageAccount: string,
  containerName: string,
  blobName: string,
  content: string
) {
  const blobServiceClient = new BlobServiceClient(
    `https://${storageAccount}.blob.core.windows.net`,
    azureStorageCredential
  )

  const containerClient = blobServiceClient.getContainerClient(containerName)
  const blockBlobClient = containerClient.getBlockBlobClient(blobName)
  await blockBlobClient.upload(content, content.length)
}

export async function uploadBlobFile(
  storageAccount: string,
  containerName: string,
  blobName: string,
  content: { buffer: Express.Multer.File['buffer'] }
): Promise<void> {
  try {
    const blobServiceClient = new BlobServiceClient(
      `https://${storageAccount}.blob.core.windows.net`,
      azureStorageCredential
    )
    const containerClient = blobServiceClient.getContainerClient(containerName)
    const blockBlobClient = containerClient.getBlockBlobClient(blobName)
    await blockBlobClient.upload(content.buffer, content.buffer.length)
  } catch (error) {
    console.error('Full upload error:', error)
    throw error
  }
}
