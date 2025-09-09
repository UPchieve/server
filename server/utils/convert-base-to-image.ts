import sharp from 'sharp'

export async function convertBase64ToImage(
  base64Data: string
): Promise<Buffer> {
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
