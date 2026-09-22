import { mocked } from 'jest-mock'
import sharp from 'sharp'
import * as ModerationService from '../../../services/ModerationService'
import * as ClaudeService from '../../../services/ClaudeService'
import * as AiObservabilityService from '../../../services/AiObservabilityService'
import * as PromptService from '../../../services/PromptService'

jest.mock('../../../logger')
jest.mock('../../../services/ClaudeService')
jest.mock('../../../services/AiObservabilityService')
jest.mock('../../../services/PromptService')
jest.mock('../../../models/ShareableDomains/queries')
jest.mock('../../../models/ModerationSettings/queries')

const mockedClaudeService = mocked(ClaudeService)
const mockedAiObservabilityService = mocked(AiObservabilityService)
const mockedPromptService = mocked(PromptService)

async function sentImageMetadata() {
  const [payload] = mockedClaudeService.invokeModel.mock.lastCall!
  return sharp(payload.images![0].data).metadata()
}

beforeEach(() => {
  jest.resetAllMocks()

  mockedAiObservabilityService.runWithTrace.mockImplementation(async (cb) => ({
    result: await cb({} as never),
    traceId: '',
  }))
  mockedAiObservabilityService.runWithModelObservation.mockImplementation(
    (cb) => cb()
  )
  mockedPromptService.getPromptWithFallback.mockResolvedValue(
    {} as PromptService.PromptResponse
  )
  mockedClaudeService.invokeModel.mockResolvedValue({ infractions: [] })
})

const jpeg = (width: number, height: number) =>
  sharp({ create: { width, height, channels: 3, background: '#ffffff' } })
    .jpeg()
    .toBuffer()

const moderate = (image: Buffer) =>
  ModerationService.moderateImage(image, {
    source: 'image_upload',
    sessionId: 'session-id',
    userId: 'user-id',
  })

describe('moderateImage', () => {
  it('caps a wide image at 1024px on its width', async () => {
    await moderate(await jpeg(2000, 1500))

    expect(await sentImageMetadata()).toMatchObject({
      width: 1024,
      height: 768,
    })
  })

  it('caps a tall image at 1024px on its height', async () => {
    await moderate(await jpeg(800, 3000))

    expect(await sentImageMetadata()).toMatchObject({
      width: 273,
      height: 1024,
    })
  })

  it('leaves an image already under 1024px at its native size', async () => {
    await moderate(await jpeg(320, 240))

    expect(await sentImageMetadata()).toMatchObject({
      width: 320,
      height: 240,
    })
  })

  it('scales a tiny image up to the 256px floor', async () => {
    await moderate(await jpeg(150, 150))

    expect(await sentImageMetadata()).toMatchObject({
      width: 256,
      height: 256,
    })
  })
})
