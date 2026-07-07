import * as QuillDocService from '../../services/QuillDocService'
import logger from '../../logger'

jest.mock('../../logger')

const base64Image =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADElEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII='

beforeEach(() => {
  jest.clearAllMocks()
})

describe('removeImageInsertsFromQuillDoc', () => {
  test('Should remove image inserts and keep only string inserts', () => {
    const quillDoc = JSON.stringify({
      ops: [
        { insert: 'Hello ' },
        {
          insert: {
            image: base64Image,
          },
        },
        { insert: 'world' },
      ],
    })

    const result = QuillDocService.removeImageInsertsFromQuillDoc(quillDoc)
    const parsed = JSON.parse(result)
    expect(parsed.ops).toEqual([{ insert: 'Hello ' }, { insert: 'world' }])
  })

  test('Should throw if quillDoc is invalid JSON', () => {
    expect(() =>
      QuillDocService.removeImageInsertsFromQuillDoc('not-json')
    ).toThrow()
  })
})

describe('getDocumentEditorImages', () => {
  test('Should return image buffers for base64 images in the doc', async () => {
    const quillDoc = JSON.stringify({
      ops: [
        {
          insert: {
            image: base64Image,
          },
        },
      ],
    })

    const result = await QuillDocService.getDocEditorImages(quillDoc)
    expect(result).toHaveLength(1)
    expect(Buffer.isBuffer(result[0])).toBe(true)
  })

  test('Should skip invalid base64 images and log a warning', async () => {
    const invalidBase64 = 'data:image/png;base64'
    const quillDoc = JSON.stringify({
      ops: [{ insert: { image: invalidBase64 } }],
    })

    const result = await QuillDocService.getDocEditorImages(quillDoc)
    expect(result).toEqual([])
    expect(logger.warn).toHaveBeenCalledWith(
      expect.objectContaining({
        err: expect.anything(),
        imageType: 'base64',
      }),
      expect.stringContaining(
        'Failed to create buffer for document editor image'
      )
    )
  })
})
