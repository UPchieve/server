import axios from 'axios'
import config from '../../config'
import { Response } from 'express'
import * as PhotoDnaService from '../../services/PhotoDnaService'
import * as AzureService from '../../services/AzureService'
import * as ModerationRepo from '../../models/ModerationInfractions'
import { getFileType } from '../../utils/image-utils'
import { PhotoDnaMatchError, PhotoDnaServiceError } from '../../models/Errors'
import { resError } from '../../router/res-error'
import { getPhotoDnaMatchCheckFlag } from '../../services/FeatureFlagService'

jest.mock('axios')
jest.mock('../../services/AzureService')
jest.mock('../../models/ModerationInfractions')
jest.mock('../../utils/image-utils')
jest.mock('../../services/FeatureFlagService')
jest.mock('../../logger')

const image = {
  buffer: Buffer.from('fake-image'),
  mimetype: 'image/png',
} as Express.Multer.File
const flag = {
  Source: 'Test',
  Violations: ['A1'],
  MatchDistance: 179,
  AdvancedInfo: [{ Key: 'MatchId', Value: '1234' }],
}
const cleanResponse: PhotoDnaService.PhotoDnaMatchResponse = {
  Status: { Code: 3000, Description: 'OK', Exception: null },
  ContentId: 'image1',
  TrackingId: 'tracking1',
  IsMatch: false,
  MatchDetails: null,
}
const matchResponse = {
  ...cleanResponse,
  IsMatch: true,
  MatchDetails: { AdvancedInfo: [], MatchFlags: [flag] },
}
const check = () => PhotoDnaService.checkAgainstPhotoDNA(image, 'user1')

beforeEach(() => {
  jest.resetAllMocks()
  jest.mocked(getPhotoDnaMatchCheckFlag).mockResolvedValue(true)
  jest.mocked(getFileType).mockReturnValue({ mime: 'image/png', ext: 'png' })
})

it('allows a confirmed clean image without recording an infraction', async () => {
  jest.mocked(axios.post).mockResolvedValue({ data: cleanResponse })
  await expect(check()).resolves.toBe('clean')
  expect(ModerationRepo.insertModerationInfraction).not.toHaveBeenCalled()
  expect(AzureService.uploadBlobFile).not.toHaveBeenCalled()
})

it.each(['application/octet-stream', 'text/plain', 'image/jpeg'])(
  'screens a detected PNG even when the upload declares %s',
  async (mimetype) => {
    jest.mocked(axios.post).mockResolvedValue({ data: cleanResponse })
    const file = { ...image, mimetype }

    await PhotoDnaService.checkAgainstPhotoDNA(file, 'user1')

    expect(getFileType).toHaveBeenCalledWith(file.buffer)
    expect(axios.post).toHaveBeenCalledWith(
      expect.any(String),
      file.buffer,
      expect.objectContaining({
        headers: expect.objectContaining({ 'Content-Type': 'image/png' }),
      })
    )
  }
)

it.each([
  undefined,
  { mime: 'application/pdf', ext: 'pdf' },
  { mime: 'image/webp', ext: 'webp' },
])(
  'skips unsupported or unrecognized files without calling PhotoDNA: %j',
  async (type) => {
    jest.mocked(getFileType).mockReturnValue(type)

    await expect(check()).resolves.toBe('unsupported')

    expect(axios.post).not.toHaveBeenCalled()
    expect(ModerationRepo.insertModerationInfraction).not.toHaveBeenCalled()
    expect(AzureService.uploadBlobFile).not.toHaveBeenCalled()
  }
)

it('skips MIME detection and PhotoDNA when the feature flag is disabled', async () => {
  jest.mocked(getPhotoDnaMatchCheckFlag).mockResolvedValue(false)

  await expect(check()).resolves.toBe('disabled')

  expect(getFileType).not.toHaveBeenCalled()
  expect(axios.post).not.toHaveBeenCalled()
})

it('rejects a confirmed match and records its details', async () => {
  jest.mocked(axios.post).mockResolvedValue({ data: matchResponse })
  jest.mocked(ModerationRepo.insertModerationInfraction).mockResolvedValue({
    id: 'infraction1',
  } as Awaited<ReturnType<typeof ModerationRepo.insertModerationInfraction>>)

  await expect(check()).rejects.toBeInstanceOf(PhotoDnaMatchError)
  expect(ModerationRepo.insertModerationInfraction).toHaveBeenCalledWith(
    {
      userId: 'user1',
      sessionId: undefined,
      reason: {
        photoDna: {
          contentId: 'image1',
          trackingId: 'tracking1',
          matchFlags: [flag],
        },
      },
    },
    undefined,
    expect.any(Date)
  )
  expect(AzureService.uploadBlobFile).toHaveBeenCalledWith(
    config.photoDnaStorageAccountName,
    config.photoDnaStorageContainer,
    'infraction1',
    image
  )
})

it.each([
  null,
  {},
  { ...cleanResponse, Status: { Code: 3004 }, IsMatch: true },
  { ...cleanResponse, IsMatch: undefined },
  { ...cleanResponse, IsMatch: 'false' },
])('rejects an unsuccessful or malformed response: %j', async (data) => {
  jest.mocked(axios.post).mockResolvedValue({ data })
  await expect(check()).rejects.toBeInstanceOf(PhotoDnaServiceError)
  expect(ModerationRepo.insertModerationInfraction).not.toHaveBeenCalled()
  expect(AzureService.uploadBlobFile).not.toHaveBeenCalled()
})

it.each([undefined, 401, 429, 503])(
  'treats request failure with HTTP status %s as a service error',
  async (status) => {
    jest.mocked(axios.isAxiosError).mockReturnValue(true)
    jest.mocked(axios.post).mockRejectedValue({
      code: 'ERR_REQUEST',
      response: { status },
      config: {
        data: image.buffer,
        headers: { 'Ocp-Apim-Subscription-Key': 'secret' },
      },
    })
    let error: unknown
    try {
      await check()
    } catch (err) {
      error = err
    }
    expect(error).toBeInstanceOf(PhotoDnaServiceError)
    expect(error).toMatchObject({
      context: { code: 'ERR_REQUEST', httpStatus: status },
    })
    expect(JSON.stringify(error)).not.toContain('secret')
    expect(JSON.stringify(error)).not.toContain('fake-image')
    expect(ModerationRepo.insertModerationInfraction).not.toHaveBeenCalled()
    expect(AzureService.uploadBlobFile).not.toHaveBeenCalled()
  }
)

it.each(['database', 'quarantine'])(
  'propagates %s failures instead of inventing a match error',
  async (stage) => {
    const error = new Error(`${stage} failed`)
    jest.mocked(axios.post).mockResolvedValue({ data: matchResponse })
    if (stage === 'database') {
      jest
        .mocked(ModerationRepo.insertModerationInfraction)
        .mockRejectedValue(error)
    } else {
      jest.mocked(ModerationRepo.insertModerationInfraction).mockResolvedValue({
        id: 'infraction1',
      } as Awaited<
        ReturnType<typeof ModerationRepo.insertModerationInfraction>
      >)
      jest.mocked(AzureService.uploadBlobFile).mockRejectedValue(error)
    }
    await expect(check()).rejects.toBe(error)
    if (stage === 'database')
      expect(AzureService.uploadBlobFile).not.toHaveBeenCalled()
  }
)

it('returns a retry message with HTTP 503 for a service failure', () => {
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() }
  resError(
    res as unknown as Response,
    new PhotoDnaServiceError({ message: 'Internal diagnostic' })
  )
  expect(res.status).toHaveBeenCalledWith(503)
  expect(res.json).toHaveBeenCalledWith(
    expect.objectContaining({
      err: "Your image can't be uploaded at this time. Please reach out to support at support@upchieve.org for assistance.",
    })
  )
})

it('preserves all match flags as structured objects', () => {
  const otherFlag = {
    ...flag,
    Source: 'Other',
    Violations: ['B2'],
    MatchDistance: 147,
  }
  const reasons = PhotoDnaService.photoDnaMatchToInfractionReasons({
    ...matchResponse,
    MatchDetails: { AdvancedInfo: [], MatchFlags: [flag, otherFlag] },
  })
  expect(reasons.photoDna).toEqual({
    contentId: 'image1',
    trackingId: 'tracking1',
    matchFlags: [flag, otherFlag],
  })
})

it('preserves tracking metadata when match details are absent', () => {
  expect(
    PhotoDnaService.photoDnaMatchToInfractionReasons({
      ...cleanResponse,
      ContentId: null,
    })
  ).toEqual({
    photoDna: { contentId: null, trackingId: 'tracking1', matchFlags: [] },
  })
})
