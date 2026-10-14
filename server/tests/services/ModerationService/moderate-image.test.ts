import { mocked } from 'jest-mock'
import sharp from 'sharp'
import * as ModerationService from '../../../services/ModerationService'
import * as ClaudeService from '../../../services/ClaudeService'
import * as AiObservabilityService from '../../../services/AiObservabilityService'
import * as PromptService from '../../../services/PromptService'
import * as ModerationSettings from '../../../models/ModerationSettings/queries'
import * as AwsService from '../../../services/AwsService'
import config from '../../../config'

jest.mock('../../../logger')
jest.mock('../../../services/ClaudeService')
jest.mock('../../../services/AiObservabilityService')
jest.mock('../../../services/PromptService')
jest.mock('../../../models/ShareableDomains/queries')
jest.mock('../../../models/ModerationSettings/queries')

const mockedClaudeService = mocked(ClaudeService)
const mockedAiObservabilityService = mocked(AiObservabilityService)
const mockedPromptService = mocked(PromptService)
const mockedModerationSettings = mocked(ModerationSettings)

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
  mockedModerationSettings.getImageUploadSettings.mockResolvedValue({})
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
  it('uses image-upload settings instead of real-time settings', async () => {
    mockedModerationSettings.getImageUploadSettings.mockResolvedValue({
      PROFANITY: {
        name: 'PROFANITY',
        threshold: 0.75,
        penaltyWeight: 1,
      },
    })
    mockedClaudeService.invokeModel.mockResolvedValue({
      infractions: [{ category: 'PROFANITY', confidence: 0.7 }],
    })

    await expect(moderate(await jpeg(320, 240))).resolves.toEqual({
      isClean: true,
      failures: [],
    })
    expect(
      mockedModerationSettings.getImageUploadSettings
    ).toHaveBeenCalledTimes(1)
    expect(mockedModerationSettings.getRealTimeSettings).not.toHaveBeenCalled()
  })

  it('flags an infraction at the image-upload threshold', async () => {
    config.awsS3.moderatedSessionImageUploadBucket = 'moderated-images'
    mockedModerationSettings.getImageUploadSettings.mockResolvedValue({
      PROFANITY: {
        name: 'PROFANITY',
        threshold: 0.75,
        penaltyWeight: 1,
      },
    })
    mockedClaudeService.invokeModel.mockResolvedValue({
      infractions: [{ category: 'PROFANITY', confidence: 0.75 }],
    })
    jest.spyOn(AwsService, 'putObject').mockResolvedValue({
      response: {} as never,
      location: 'https://example.com/moderated-image',
    })

    await expect(moderate(await jpeg(320, 240))).resolves.toEqual({
      isClean: false,
      failures: ['PROFANITY'],
    })
  })

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

describe('moderateScreenshareImage', () => {
  it('loads real-time settings instead of image-upload settings', async () => {
    mockedModerationSettings.getRealTimeSettings.mockResolvedValue({
      'Person detected in image': {
        name: 'Person detected in image',
        threshold: 0.75,
        penaltyWeight: 0,
      },
    })
    jest
      .spyOn(AwsService.AWSRekognitionClient, 'send')
      .mockResolvedValue({} as never)

    await ModerationService.moderateScreenshareImage({
      image: await jpeg(320, 240),
      sessionId: 'session-id',
      userId: 'user-id',
    })

    expect(mockedModerationSettings.getRealTimeSettings).toHaveBeenCalledTimes(
      1
    )
    expect(
      mockedModerationSettings.getImageUploadSettings
    ).not.toHaveBeenCalled()
  })

  it('flags a Rekognition label above the real-time threshold', async () => {
    config.awsS3.moderatedScreenshareBucket = 'moderated-screenshares'
    mockedModerationSettings.getRealTimeSettings.mockResolvedValue({
      Violence: {
        name: 'Violence',
        threshold: 0.75,
        penaltyWeight: 0,
      },
      'Person detected in image': {
        name: 'Person detected in image',
        threshold: 0.75,
        penaltyWeight: 0,
      },
    })
    jest.spyOn(AwsService.AWSRekognitionClient, 'send').mockResolvedValue({
      ModerationLabels: [
        { Name: 'Violence', Confidence: 80, TaxonomyLevel: 1 },
      ],
    } as never)
    const putObject = jest.spyOn(AwsService, 'putObject').mockResolvedValue({
      response: {} as never,
      location: 'https://example.com/moderated-screenshare',
    })

    await ModerationService.moderateScreenshareImage({
      image: await jpeg(320, 240),
      sessionId: 'session-id',
      userId: 'user-id',
    })
    await new Promise<void>((resolve) => setImmediate(resolve))

    expect(putObject).toHaveBeenCalledTimes(1)
  })

  it('ignores a Rekognition label below the real-time threshold', async () => {
    mockedModerationSettings.getRealTimeSettings.mockResolvedValue({
      Violence: {
        name: 'Violence',
        threshold: 0.75,
        penaltyWeight: 0,
      },
      'Person detected in image': {
        name: 'Person detected in image',
        threshold: 0.75,
        penaltyWeight: 0,
      },
    })
    jest.spyOn(AwsService.AWSRekognitionClient, 'send').mockResolvedValue({
      ModerationLabels: [
        { Name: 'Violence', Confidence: 70, TaxonomyLevel: 1 },
      ],
    } as never)
    const putObject = jest.spyOn(AwsService, 'putObject')

    await ModerationService.moderateScreenshareImage({
      image: await jpeg(320, 240),
      sessionId: 'session-id',
      userId: 'user-id',
    })
    await new Promise<void>((resolve) => setImmediate(resolve))

    expect(putObject).not.toHaveBeenCalled()
  })
})
