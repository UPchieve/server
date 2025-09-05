import { ClientSecretCredential } from '@azure/identity'
import {
  BlobServiceClient,
  BlobSASPermissions,
  SASProtocol,
  generateBlobSASQueryParameters,
  StorageSharedKeyCredential,
} from '@azure/storage-blob'
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
  [
    config.appStorageAccountName,
    new BlobServiceClient(
      `https://${config.appStorageAccountName}.blob.core.windows.net`,
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

type BlobDocument = {
  name: string
  url: string
}

export async function getBlobsInFolder(
  storageAccountName: string,
  containerName: string,
  folderPath: string
): Promise<BlobDocument[]> {
  const blobServiceClient = getBlobClient(storageAccountName)

  const containerClient = blobServiceClient.getContainerClient(containerName)
  const documents = []

  const blobs = containerClient.listBlobsFlat({ prefix: folderPath })

  for await (const blob of blobs) {
    const blobClient = containerClient.getBlobClient(blob.name)
    const url = blobClient.url
    const fileName = blob.name.split('/').pop() || blob.name

    documents.push({
      name: fileName,
      url: url,
    })
  }

  return documents
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
  try {
    const blobServiceClient = getBlobClient(storageAccountName)
    const containerClient = blobServiceClient.getContainerClient(containerName)
    const blockBlobClient = containerClient.getBlockBlobClient(blobName)
    await blockBlobClient.upload(content.buffer, content.buffer.length, {
      blobHTTPHeaders: { blobContentType: content.mimetype },
    })
  } catch (error) {
    console.error('Full upload error:', error)
    throw error
  }
}

type PermissionChar = 'r' | 'c' | 'w'

type CreateBlobSasUrlOptions = {
  permissions: ReadonlyArray<PermissionChar>
  expiresInSeconds?: number
}

const MS_PER_SECOND = 1000
const SECONDS_PER_MINUTE = 60
const DEFAULT_EXPIRES_IN_SECONDS = 3 * SECONDS_PER_MINUTE

export function createBlobSasUrl(
  storageAccountName: string,
  storageAccountAccessKey: string,
  containerName: string,
  blobName: string,
  {
    permissions,
    expiresInSeconds = DEFAULT_EXPIRES_IN_SECONDS,
  }: CreateBlobSasUrlOptions
): string {
  const service = getBlobClient(storageAccountName)
  const container = service.getContainerClient(containerName)
  const blob = container.getBlockBlobClient(blobName)
  const expiresOn = new Date(Date.now() + expiresInSeconds * MS_PER_SECOND)
  const cred = new StorageSharedKeyCredential(
    storageAccountName,
    storageAccountAccessKey
  )
  const sas = generateBlobSASQueryParameters(
    {
      containerName,
      blobName,
      permissions: BlobSASPermissions.parse(permissions.join('')),
      protocol: SASProtocol.Https,
      expiresOn,
    },
    cred
  ).toString()

  const sasUrl = `${blob.url}?${sas}`
  return sasUrl
}

export async function getSasUrlsInFolder(
  storageAccountName: string,
  storageAccountAccessKey: string,
  containerName: string,
  folderPath: string,
  {
    permissions,
    expiresInSeconds = DEFAULT_EXPIRES_IN_SECONDS,
  }: CreateBlobSasUrlOptions
): Promise<BlobDocument[]> {
  const service = getBlobClient(storageAccountName)
  const container = service.getContainerClient(containerName)
  const results: BlobDocument[] = []
  for await (const item of container.listBlobsFlat({ prefix: folderPath })) {
    const sasUrl = createBlobSasUrl(
      storageAccountName,
      storageAccountAccessKey,
      containerName,
      item.name,
      { permissions, expiresInSeconds }
    )
    results.push({
      name: item.name,
      url: sasUrl,
    })
  }
  return results
}
