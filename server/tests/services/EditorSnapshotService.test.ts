import { mocked } from 'jest-mock'
import config from '../../config'
import logger from '../../logger'
import { getUuid } from '../../models/pgUtils'
import * as AzureService from '../../services/AzureService'
import * as EditorSnapshotService from '../../services/EditorSnapshotService'
import * as WhiteboardService from '../../services/WhiteboardService'

jest.mock('../../logger')
jest.mock('../../services/AzureService')
jest.mock('../../services/WhiteboardService')

const mockedAzureService = mocked(AzureService)
const mockedWhiteboardService = mocked(WhiteboardService)

beforeEach(() => {
  jest.clearAllMocks()
  jest.resetAllMocks()
})

const whiteboardDocMock = `B0:Vg1:mja7b7ag;Clpl2v9;0:2/Vg11;20;{"$type":"PageNode"};`

describe('generateWhiteboardSnapshot', () => {
  test('Should return undefined if zwibbler is not available', async () => {
    mockedWhiteboardService.loadZwibbler.mockResolvedValueOnce(undefined)

    const result =
      await EditorSnapshotService.generateWhiteboardSnapshot(whiteboardDocMock)
    expect(result).toBeUndefined()
  })

  test('Should render a snapshot buffer when zwibbler saves successfully', async () => {
    mockedWhiteboardService.loadZwibbler.mockResolvedValueOnce({
      save: jest.fn().mockResolvedValueOnce('raw-binary'),
    })

    const result =
      await EditorSnapshotService.generateWhiteboardSnapshot(whiteboardDocMock)
    expect(result).toBeInstanceOf(Buffer)
    expect(result?.toString('binary')).toBe('raw-binary')
  })

  test('Should log and return undefined if zwibbler.save() throws', async () => {
    const error = new Error('save failed')
    mockedWhiteboardService.loadZwibbler.mockResolvedValueOnce({
      save: jest.fn().mockRejectedValueOnce(error),
    })

    const result =
      await EditorSnapshotService.generateWhiteboardSnapshot(whiteboardDocMock)
    expect(result).toBeUndefined()
    expect(logger.error).toHaveBeenCalledWith(
      { err: error },
      'Failed to render whiteboard snapshot'
    )
  })
})

describe('getWhiteboardSnapshot', () => {
  test('Should return snapshot if it exists in blob storage', async () => {
    const sessionId = getUuid()
    const snapshot = Buffer.from('snapshot')

    mockedAzureService.getBlobBuffer.mockResolvedValueOnce(snapshot)

    const result = await EditorSnapshotService.getWhiteboardSnapshot(sessionId)

    expect(result).toBe(snapshot)
    expect(mockedAzureService.getBlobBuffer).toHaveBeenCalledWith(
      config.appStorageAccountName,
      config.sessionsStorageContainer,
      `${sessionId}/whiteboard/snapshot.png`
    )
    expect(mockedWhiteboardService.getDocFromStorage).not.toHaveBeenCalled()
    expect(mockedAzureService.uploadBlobBuffer).not.toHaveBeenCalled()
  })

  test('Should throw if no snapshot exists and no whiteboard doc found', async () => {
    const sessionId = getUuid()

    mockedAzureService.getBlobBuffer.mockResolvedValueOnce(undefined)
    mockedWhiteboardService.getDocFromStorage.mockResolvedValueOnce('')

    await expect(
      EditorSnapshotService.getWhiteboardSnapshot(sessionId)
    ).rejects.toThrow(`No whiteboard document found for session ${sessionId}`)
  })

  test('Should return undefined if snapshot generation fails', async () => {
    const sessionId = getUuid()

    mockedAzureService.getBlobBuffer.mockResolvedValueOnce(undefined)
    mockedWhiteboardService.getDocFromStorage.mockResolvedValueOnce(
      whiteboardDocMock
    )

    mockedWhiteboardService.loadZwibbler.mockResolvedValueOnce({
      save: jest.fn().mockRejectedValueOnce(new Error('save failed')),
    })

    const result = await EditorSnapshotService.getWhiteboardSnapshot(sessionId)
    expect(result).toBeUndefined()
    expect(mockedAzureService.uploadBlobBuffer).not.toHaveBeenCalled()
  })

  test('Should generate and store snapshot if not found in blob storage', async () => {
    const sessionId = getUuid()
    const rawBinary = 'raw-binary'

    mockedAzureService.getBlobBuffer.mockResolvedValueOnce(undefined)
    mockedWhiteboardService.getDocFromStorage.mockResolvedValueOnce(
      whiteboardDocMock
    )
    mockedWhiteboardService.loadZwibbler.mockResolvedValueOnce({
      save: jest.fn().mockResolvedValueOnce(rawBinary),
    })

    const result = await EditorSnapshotService.getWhiteboardSnapshot(sessionId)
    expect(result).toBeInstanceOf(Buffer)
    expect(mockedAzureService.uploadBlobBuffer).toHaveBeenCalledWith(
      config.appStorageAccountName,
      config.sessionsStorageContainer,
      `${sessionId}/whiteboard/snapshot.png`,
      expect.any(Buffer),
      'image/png'
    )
  })
})
