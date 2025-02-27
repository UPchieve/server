import { ClientSecretCredential } from '@azure/identity'
import { BlobServiceClient } from '@azure/storage-blob'
import config from '../config'

const azureStorageCredential = new ClientSecretCredential(
  config.azureTenantId,
  config.azureClientId,
  config.azureStorageSecret
)

const blobClients = new Map<string, BlobServiceClient>([
  [
    config.whiteboardStorageAccountName,
    new BlobServiceClient(
      `https://${config.whiteboardStorageAccountName}.blob.core.windows.net`,
      azureStorageCredential
    ),
  ],
  [
    config.assignmentsStorageAccountName,
    new BlobServiceClient(
      `https://${config.assignmentsFrontdoorHostName}.z02.azurefd.net`,
      azureStorageCredential
    ),
  ],
])

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

function getBlobClient(storageAccountName: string): BlobServiceClient {
  const client = blobClients.get(storageAccountName)
  if (!client) {
    throw new Error(
      `No blob client configured for storage account: ${storageAccountName}`
    )
  }
  return client
}

export async function getBlob(
  storageAccountName: string,
  containerName: string,
  blobName: string
): Promise<string> {
  const blobServiceClient = getBlobClient(storageAccountName)
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
  storageAccountName: string,
  containerName: string,
  blobName: string,
  content: string
) {
  const blobServiceClient = getBlobClient(storageAccountName)
  const containerClient = blobServiceClient.getContainerClient(containerName)
  const blockBlobClient = containerClient.getBlockBlobClient(blobName)
  await blockBlobClient.upload(content, content.length)
}

export async function uploadBlobFile(
  storageAccountName: string,
  containerName: string,
  blobName: string,
  content: Express.Multer.File
): Promise<void> {
  const blobServiceClient = getBlobClient(storageAccountName)
  const containerClient = blobServiceClient.getContainerClient(containerName)
  const blockBlobClient = containerClient.getBlockBlobClient(blobName)
  await blockBlobClient.upload(content.buffer, content.buffer.length, {
    blobHTTPHeaders: { blobContentType: content.mimetype },
  })
}
