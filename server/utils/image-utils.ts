import { parse } from 'file-type-mime'
import sharp from 'sharp'

export function getImageFileType(image: Buffer) {
  return parse(new Uint8Array(image).buffer)
}

export async function resize(image: Buffer, options?: sharp.ResizeOptions) {
  const resizeOptions = !!options
    ? options
    : {
        width: 224,
        height: 224,
        //sharp's default quality is 80
      }

  return await sharp(image)
    .resize({ ...resizeOptions, fit: 'contain' })
    .jpeg()
    .toBuffer()
}

export async function convertBase64ToImage(base64Data: string) {
  const matches = base64Data.match(/^data:(.+);base64,(.*)$/)
  if (!matches || matches.length !== 3) throw new Error('Invalid base64 data')
  const [_, contentType, base64] = matches
  const inputBuffer = Buffer.from(base64, 'base64')
  const extension = contentType.split('/')[1]
  const outputBuffer =
    extension === 'webp'
      ? await sharp(inputBuffer).png({ quality: 90 }).toBuffer()
      : inputBuffer
  return outputBuffer
}
