import { parse } from 'file-type-mime'
import type { Result } from 'file-type-mime'
import sharp from 'sharp'

export function getFileType(file: Buffer): Result | undefined {
  return parse(new Uint8Array(file).buffer)
}

export function isImageFile(image: Buffer) {
  const result = getFileType(image)
  return result && result.mime?.startsWith('image/')
}

export function isPdf(file: Buffer) {
  const result = getFileType(file)
  return result && result.mime === 'application/pdf'
}

export async function getImageDimensions(image: Buffer) {
  const { width = 0, height = 0 } = await sharp(image).metadata()
  return { width, height }
}

/**
 * A resized image and the media type it was encoded as.
 * An image content block needs that type, and re-sniffing the resized bytes
 * returns undefined for anything file-type-mime does not recognise.
 */
export type TypedImage = {
  data: Buffer
  mediaType: 'image/png' | 'image/jpeg'
}

export async function resize(
  image: Buffer,
  options?: sharp.ResizeOptions
): Promise<TypedImage> {
  const hasExplicitSize = options?.width || options?.height
  const resizeOptions: sharp.ResizeOptions = {
    fit: 'contain',
    ...(hasExplicitSize ? {} : { width: 224, height: 224 }),
    ...options,
  }
  const meta = await sharp(image).metadata()
  const pipeline = sharp(image).resize(resizeOptions)

  // Preserve PNG when input is PNG, otherwise encode JPEG
  if (meta.format === 'png')
    return { data: await pipeline.toBuffer(), mediaType: 'image/png' }
  return { data: await pipeline.jpeg().toBuffer(), mediaType: 'image/jpeg' }
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
