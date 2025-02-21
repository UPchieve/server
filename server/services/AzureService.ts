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
  content: string
  contentType: string
}

export async function getBlobsInFolder(
  storageAccountName: string,
  containerName: string,
  folderPath: string
): Promise<BlobDocument[]> {
  const blobServiceClient = new BlobServiceClient(
    `https://${storageAccountName}.blob.core.windows.net`,
    azureStorageCredential
  )

  const containerClient = blobServiceClient.getContainerClient(containerName)
  const documents = []

  const blobs = containerClient.listBlobsFlat({ prefix: folderPath })

  for await (const blob of blobs) {
    const blobClient = containerClient.getBlobClient(blob.name)
    const downloadBlockBlobResponse = await blobClient.download()
    const blobContent = await streamToBuffer(
      downloadBlockBlobResponse.readableStreamBody as NodeJS.ReadableStream
    )

    const fileName = blob.name.split('/').pop() || blob.name

    documents.push({
      name: fileName,
      content: blobContent.toString('base64'),
      contentType: getContentType(fileName),
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

//gets content type for file name using the file extension so we
//can use this function for any uploaded file types
const getContentType = (fileName: string): string => {
  const lastDotIndex = fileName.lastIndexOf('.')
  if (lastDotIndex === -1) return 'application/octet-stream'

  const extension = fileName.slice(lastDotIndex + 1).toLowerCase()
  const contentTypes: { [key: string]: string } = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx:
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx:
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    txt: 'text/plain',
    csv: 'text/csv',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
  }
  return contentTypes[extension] || 'application/octet-stream'
}
