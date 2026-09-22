import sharp from 'sharp'
import * as ImageUtils from '../../utils/image-utils'
import { parse } from 'file-type-mime'

jest.mock('file-type-mime')

const mockedParse = jest.mocked(parse)
beforeEach(() => {
  jest.resetAllMocks()
})
it('isPdf', () => {
  mockedParse.mockReturnValueOnce({
    mime: 'application/pdf',
    ext: 'pdf',
  })
  mockedParse.mockReturnValueOnce({
    mime: 'image/png',
    ext: 'png',
  })
  const actualPdf = ImageUtils.isPdf({} as Buffer)
  const actualNonPdf = ImageUtils.isPdf({} as Buffer)

  expect(actualPdf).toEqual(true)
  expect(actualNonPdf).toEqual(false)
})

it('isImageFile', () => {
  mockedParse.mockReturnValueOnce({
    mime: 'application/pdf',
    ext: 'pdf',
  })
  mockedParse.mockReturnValueOnce({
    mime: 'image/png',
    ext: 'png',
  })
  const actualNonImage = ImageUtils.isImageFile({} as Buffer)
  const actualImage = ImageUtils.isImageFile({} as Buffer)

  expect(actualNonImage).toEqual(false)
  expect(actualImage).toEqual(true)
})

describe('resize', () => {
  const solid = (format: 'png' | 'jpeg') =>
    sharp({
      create: {
        width: 40,
        height: 30,
        channels: 3,
        background: { r: 10, g: 20, b: 30 },
      },
    })
      [format]()
      .toBuffer()

  it('keeps a PNG as a PNG, because re-encoding text-heavy images loses detail', async () => {
    const resized = await ImageUtils.resize(await solid('png'))

    expect(resized.mediaType).toBe('image/png')
    expect((await sharp(resized.data).metadata()).format).toBe('png')
  })

  it('encodes anything else as JPEG', async () => {
    const resized = await ImageUtils.resize(await solid('jpeg'))

    expect(resized.mediaType).toBe('image/jpeg')
    expect((await sharp(resized.data).metadata()).format).toBe('jpeg')
  })
})
