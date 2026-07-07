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
