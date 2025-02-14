import { ClientSecretCredential } from '@azure/identity'
import { BlobServiceClient } from '@azure/storage-blob'
import config from '../config'

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

export async function uploadBlob(
  containerName: string,
  blobName: string,
  content: string | { buffer: Express.Multer.File['buffer'] }
): Promise<void> {
  try {
    const upchieveCdnStorageAccount = config.upchieveCdnStorageAccountName
    const upchieveBlobServiceClient = new BlobServiceClient(
      `https://${upchieveCdnStorageAccount}.blob.core.windows.net`,
      whiteboardStorageCredential
    )

    const containerClient = upchieveBlobServiceClient.getContainerClient(
      containerName
    )
    const blockBlobClient = containerClient.getBlockBlobClient(blobName)

    console.log('Uploading to container:', containerName)
    console.log('Blob name:', blobName)

    if (typeof content === 'string') {
      await blockBlobClient.upload(content, content.length)
    } else {
      console.log('Buffer length:', content.buffer.length)

      // Try with explicit options
      await blockBlobClient.upload(content.buffer, content.buffer.length, {
        blobHTTPHeaders: {
          blobContentType: 'application/pdf', // Adjust based on your file type
        },
      })
    }
  } catch (error) {
    console.error('Full upload error:', error)
    throw error
  }
}

// export async function uploadBlob(
//   containerName: string,
//   blobName: string,
//   content: string | { buffer: Express.Multer.File['buffer'] },
// ): Promise<void> {
//   const upchieveCdnStorageAccount = config.upchieveCdnStorageAccountName
//   const upchieveBlobServiceClient = new BlobServiceClient(
//     `https://${upchieveCdnStorageAccount}.blob.core.windows.net`,
//     whiteboardStorageCredential
//   )

//   const containerClient = blobServiceClient.getContainerClient(containerName)
//   const blockBlobClient = containerClient.getBlockBlobClient(blobName)
//   console.log('****content', content)
//   if(typeof content === 'string') {
//     await blockBlobClient.upload(content, content.length)
//   } else {
//     console.log('*****else')
//       const containerClient = upchieveBlobServiceClient.getContainerClient(
//         containerName
//       )
//       console.log('****container client', containerClient)
//       const blockBlobClient = containerClient.getBlockBlobClient(blobName)
//       console.log('***blockBlogClient', blockBlobClient)
//       await blockBlobClient.upload(content.buffer, content.buffer.length)
//   }
// }
