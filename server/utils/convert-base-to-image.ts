import { promises as fs } from 'fs'
import path from 'path'
import sharp from 'sharp'

export async function convertBase64ToImage(
  base64Data: string,
  outputPath: string
): Promise<string> {
  const matches = base64Data.match(/^data:(.+);base64,(.*)$/)
  if (!matches || matches.length !== 3) throw new Error('Invalid base64 data')
  const [_, contentType, base64] = matches
  const inputBuffer = Buffer.from(base64, 'base64')
  const extension =
    contentType.split('/')[1] === 'webp' ? 'png' : contentType.split('/')[1]
  const outputBuffer =
    extension === 'png'
      ? await sharp(inputBuffer)
          .png({ quality: 90 })
          .toBuffer()
      : inputBuffer

  const filePath = `${outputPath}.${extension}`

  try {
    await fs.mkdir(path.parse(filePath).dir, { recursive: true })
    await fs.writeFile(filePath, outputBuffer)
    return filePath
  } catch (err) {
    throw err
  }
}
