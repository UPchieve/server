import { PDFParse } from 'pdf-parse'
import * as FileUtils from '../../utils/file-utils'
jest.mock('pdf-parse')

describe('extractPdfContent', () => {
  const mockedPDFParse = jest.mocked(PDFParse)
  let pdfParseObjectMock
  const image = {
    data: new Buffer([1]),
    dataUrl: '',
  }
  const mockGetText = jest.fn()
  const mockGetImage = jest.fn()
  const mockDestroy = jest.fn()

  beforeEach(() => {
    jest.resetAllMocks()
    mockGetText.mockResolvedValue({
      text: 'test text',
    })
    mockGetImage.mockResolvedValue({
      pages: [{ images: [image, image] }],
    })
    pdfParseObjectMock = {
      getText: mockGetText,
      getImage: mockGetImage,
      destroy: mockDestroy,
    }
  })
  describe('Always destroys the parser (saves memory)', () => {
    const pdfBuffer: Buffer = new Buffer([1])

    it('Destroys the parser on success', async () => {
      mockedPDFParse.mockReturnValueOnce(pdfParseObjectMock as PDFParse)
      const actual = await FileUtils.extractPdfContent(pdfBuffer)
      expect(actual).toEqual({
        text: 'test text',
        images: [image, image],
      })
      expect(pdfParseObjectMock.destroy).toHaveBeenCalledTimes(1)
    })

    it('Destroys the parser on error', async () => {
      const error = new Error('Test error')
      const mock = {
        ...pdfParseObjectMock,
        getImage: jest.fn().mockRejectedValueOnce(error),
      } as PDFParse
      mockedPDFParse.mockReturnValueOnce(mock)
      await expect(FileUtils.extractPdfContent(pdfBuffer)).rejects.toThrow(
        error
      )
      expect(mock.destroy).toHaveBeenCalledTimes(1)
    })
  })
})
