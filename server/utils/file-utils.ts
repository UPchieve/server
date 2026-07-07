import fs from 'fs'
import { parse } from 'csv-parse/sync'
import { InputError } from '../models/Errors'
import {
  extractLinks,
  extractImages,
  extractText,
  getDocumentProxy,
} from 'unpdf'
import sharp from 'sharp'

export function readCsvFromBuffer<T>(
  buffer: Buffer,
  requiredColumns: string[]
): T[] {
  return readCsv<T>(buffer, requiredColumns)
}

export function readCsvFromFilePath<T>(
  filePath: string,
  requiredColumns: string[]
) {
  const file = fs.readFileSync(filePath)
  return readCsv<T>(file, requiredColumns)
}

function readCsv<T>(input: Buffer | string, requiredColumns: string[]): T[] {
  try {
    const contents = parse(input, {
      delimiter: ',',
      columns: true,
      bom: true,
    })

    if (!contents.length) {
      throw new InputError(`No content in the CSV.`)
    }
    if (!hasRequiredColumns(requiredColumns, contents[0])) {
      throw new InputError(
        `Missing a required column. Required: ${requiredColumns}`
      )
    }
    return contents
  } catch (e) {
    if (e instanceof Error && e.message.includes('Invalid Record Length')) {
      throw new InputError('Number of columns to headers does not match.')
    } else {
      throw e
    }
  }
}

function hasRequiredColumns(
  requiredColumns: string[],
  sample: Record<string, string>
): boolean {
  for (const col of requiredColumns) {
    if (!(col in sample)) {
      return false
    }
  }
  return true
}

type UnpdfExtractedImage = {
  data: Uint8ClampedArray
  width: number
  height: number
  channels: 1 | 3 | 4
}
export async function extractPdfContent(pdfBuffer: Buffer): Promise<{
  text: string
  links: string[]
  images: Buffer[]
}> {
  const doc = await getDocumentProxy(new Uint8Array(pdfBuffer))
  const text = await extractText(doc, {
    mergePages: true,
  })
  const links = await extractLinks(doc)

  const rawImages: UnpdfExtractedImage[] = []
  const images: Buffer[] = []
  for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
    const pageImages = await extractImages(doc, pageNum)
    rawImages.push(...pageImages)
  }
  // unpdf gives raw pixels, convert to an image so we can work with it more easily downstream
  for (const rawImage of rawImages) {
    const sharpImage = sharp(rawImage.data, {
      raw: {
        height: rawImage.height,
        width: rawImage.width,
        channels: rawImage.channels,
      },
    })
    const imageBuffer = await sharpImage.png().toBuffer()
    images.push(imageBuffer)
  }

  return {
    text: text.text,
    links: links.links,
    images,
  }
}
