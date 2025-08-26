import { fileTypeFromBuffer, fileTypeFromStream } from 'file-type'
export async function getImageFileType(image: Buffer | Uint8Array) {
  if (Buffer.isBuffer(image)) {
    return fileTypeFromBuffer(new Uint8Array(image))
  } else {
    const stream = image as Uint8Array
    return fileTypeFromStream(stream)
  }
}
