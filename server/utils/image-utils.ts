import { parse } from 'file-type-mime'
import sharp from 'sharp'

export function getImageFileType(image: Buffer) {
  return parse(new Uint8Array(image).buffer)
}

export async function resize(image: Buffer, options?: sharp.ResizeOptions) {
  // Default to 224x224 for generic image moderation use cases
  // Callers can override by providing width or height explicitly
  const hasExplicitSize = options?.width || options?.height
  const resizeOptions: sharp.ResizeOptions = {
    fit: 'contain',
    ...(hasExplicitSize ? {} : { width: 224, height: 224 }),
    ...options,
  }
  const meta = await sharp(image).metadata()
  const pipeline = sharp(image).resize(resizeOptions)

  // Preserve PNG when input is PNG, otherwise encode JPEG
  if (meta.format === 'png') return pipeline.toBuffer()
  return pipeline.jpeg().toBuffer()
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
