import axios from 'axios'
import * as AzureService from './AzureService'
import * as ModerationRepo from '../models/ModerationInfractions'
import config from '../config'
import {
  PhotoDnaInfractionReason,
  PhotoDnaMatchFlag,
} from '../models/ModerationInfractions'
import { PhotoDnaMatchError, PhotoDnaServiceError } from '../models/Errors'
import { getFileType } from '../utils/image-utils'
import { getPhotoDnaMatchCheckFlag } from './FeatureFlagService'

const SUPPORTED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/bmp',
  'image/tiff',
])

function getEndpoint(): string {
  const host = config.photoDNABaseHost
  return `https://${host}/photodna/v1.0/Match`
}

export type { PhotoDnaMatchFlag } from '../models/ModerationInfractions'

export interface PhotoDnaMatchResponse {
  Status: { Code: number; Description: string; Exception: string | null }
  ContentId: string | null
  IsMatch: boolean
  MatchDetails: {
    AdvancedInfo: unknown[]
    MatchFlags: PhotoDnaMatchFlag[]
  } | null
  TrackingId: string
}

export type PhotoDnaCheckResult = 'disabled' | 'unsupported' | 'clean'

export function photoDnaMatchToInfractionReasons(res: PhotoDnaMatchResponse): {
  photoDna: PhotoDnaInfractionReason
} {
  return {
    photoDna: {
      contentId: res.ContentId,
      trackingId: res.TrackingId,
      matchFlags: res.MatchDetails?.MatchFlags ?? [],
    },
  }
}

export async function scanImage(
  image: Express.Multer.File,
  mimeType: string,
  userId: string,
  sessionId?: string
): Promise<PhotoDnaMatchResponse> {
  let data: PhotoDnaMatchResponse
  try {
    const response = await axios.post<PhotoDnaMatchResponse>(
      getEndpoint(),
      image.buffer,
      {
        headers: {
          'Ocp-Apim-Subscription-Key': config.photoDnaKey,
          'Content-Type': mimeType,
        },
      }
    )
    data = response.data
  } catch (err) {
    throw new PhotoDnaServiceError({
      message: 'PhotoDNA request failed',
      context: {
        userId,
        sessionId,
        ...(axios.isAxiosError(err)
          ? { code: err.code, httpStatus: err.response?.status }
          : {}),
      },
    })
  }

  if (data?.Status?.Code !== 3000 || typeof data?.IsMatch !== 'boolean') {
    throw new PhotoDnaServiceError({
      message: 'PhotoDNA returned an unsuccessful or invalid response',
      context: {
        userId,
        sessionId,
        statusCode: data?.Status?.Code,
        trackingId: data?.TrackingId,
      },
    })
  }

  if (data.IsMatch) {
    const reasons = photoDnaMatchToInfractionReasons(data)
    const quarantinedOn = new Date()
    const result = await ModerationRepo.insertModerationInfraction(
      { userId, reason: reasons, sessionId },
      undefined,
      quarantinedOn
    )

    await AzureService.uploadBlobFile(
      config.photoDnaStorageAccountName,
      config.photoDnaStorageContainer,
      result.id,
      image
    )
  }

  return data
}

export async function checkAgainstPhotoDNA(
  file: Express.Multer.File,
  userId: string,
  sessionId?: string
): Promise<PhotoDnaCheckResult> {
  if (!(await getPhotoDnaMatchCheckFlag(userId))) return 'disabled'

  const sniffed = getFileType(file.buffer)?.mime
  if (!sniffed || !SUPPORTED_MIME_TYPES.has(sniffed)) return 'unsupported'

  const result = await scanImage(file, sniffed, userId, sessionId)
  if (result.IsMatch) {
    throw new PhotoDnaMatchError()
  }
  return 'clean'
}
